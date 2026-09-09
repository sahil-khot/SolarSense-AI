const EnergyProfile = require('../models/EnergyProfile');
const SolarAssessment = require('../models/SolarAssessment');
const Recommendation = require('../models/Recommendation');
const Bill = require('../models/Bill');
const User = require('../models/User');
const { calculateSolarMetrics } = require('../utils/solarCalculations');
const { buildPersonalizedRecommendation } = require('../ai/recommendationEngine');

class EnergyProfileService {
  /**
   * Evaluates if solar installation is financially worthwhile
   */
  evaluateFinancialViability(paybackPeriod, roi, npv) {
    if (paybackPeriod > 0 && paybackPeriod <= 4.5 && roi >= 20 && npv > 0) {
      return {
        financialViability: 'Strong',
        viabilityReason: `Excellent financial returns with a short payback period of ${paybackPeriod} years and 25-year ROI of ${roi}%. Subsidies and tariff savings yield strong net present value.`,
      };
    }
    if (paybackPeriod > 4.5 && paybackPeriod <= 7.0 && roi >= 12 && npv >= 0) {
      return {
        financialViability: 'Moderate',
        viabilityReason: `Healthy investment return with a payback of ${paybackPeriod} years and steady long-term electricity bill hedge against DISCOM tariff inflation.`,
      };
    }
    return {
      financialViability: 'Weak',
      viabilityReason: `Extended payback period (${paybackPeriod > 0 ? paybackPeriod + ' years' : 'Long'}). Consider checking roof shading, optimizing system size, or exploring state net-metering policies.`,
    };
  }

  /**
   * Synchronizes EnergyProfile directly from an uploaded or verified Bill.
   */
  async syncFromBill(userId, billDoc, isUserVerified = false) {
    try {
      let profile = await EnergyProfile.findOne({ userId });
      const user = await User.findById(userId);

      const userType = billDoc.consumerCategory
        ? (billDoc.consumerCategory.toLowerCase().includes('agri') ? 'farm' :
           billDoc.consumerCategory.toLowerCase().includes('comm') ? 'small_business' :
           billDoc.consumerCategory.toLowerCase().includes('ind') ? 'large_business' :
           user?.userType || 'residential')
        : user?.userType || 'residential';

      const units = billDoc.unitsConsumed || 0;
      const billAmount = billDoc.totalAmount || 0;
      const tariff = billDoc.tariff || (units > 0 && billAmount > 0 ? Math.round((billAmount / units) * 100) / 100 : 7.5);

      // Estimate roof area needed if property constraints not yet given
      const targetKw = Math.max(1, Math.round((units / (30 * 4.8 * 0.78)) * 10) / 10);
      const existingArea = profile?.property?.roofArea || 0;
      const effectiveArea = existingArea > 0 ? existingArea : Math.max(400, Math.round(targetKw * 135));

      const location = user?.location || { state: 'Maharashtra', city: 'Pune' };

      // Deterministic engineering calculations
      let metrics = null;
      let recResult = null;
      if (units > 0) {
        metrics = calculateSolarMetrics({
          monthlyConsumption: units,
          monthlyBill: billAmount,
          userType,
          roofArea: effectiveArea,
          tariff,
          location,
        });

        recResult = buildPersonalizedRecommendation({
          userType,
          monthlyConsumption: units,
          monthlyBill: billAmount,
          roofArea: effectiveArea,
          tariff,
          location,
          metrics,
        });
      }

      const viability = metrics
        ? this.evaluateFinancialViability(metrics.paybackPeriod, metrics.roi, metrics.npv)
        : { financialViability: 'Not Evaluated', viabilityReason: 'Requires electricity consumption data' };

      const statusTag = isUserVerified ? 'userVerified' : (billDoc.verificationStatus === 'verified' ? 'extracted' : 'estimated');
      const confScore = billDoc.fieldConfidence?.overall || 0.85;

      const profileData = {
        userId,
        primarySource: 'bill_upload',
        sourceBillId: billDoc._id,
        userType,
        location,
        consumption: {
          monthlyConsumption: units,
          dailyConsumption: Math.round((units / (billDoc.billingPeriodDays || 30)) * 10) / 10,
          monthlyBill: billAmount,
          tariff,
          billingPeriodDays: billDoc.billingPeriodDays || 30,
          billingMonth: billDoc.billingMonth || '',
          billingYear: billDoc.billingYear || new Date().getFullYear(),
          discom: billDoc.discom || '',
          consumerNumber: billDoc.consumerNumber || '',
          consumerName: billDoc.consumerName || '',
          consumerCategory: billDoc.consumerCategory || 'Residential',
          meterNumber: billDoc.meterNumber || '',
          sanctionedLoadKW: billDoc.sanctionedLoadKW || null,
          fixedCharges: billDoc.fixedCharges || 0,
          energyCharges: billDoc.energyCharges || 0,
          taxes: billDoc.taxes || 0,
        },
        property: {
          roofArea: effectiveArea,
          usableRoofArea: metrics?.roofModel?.usableRoofArea || Math.round(effectiveArea * 0.7),
          roofType: profile?.property?.roofType || 'concrete_flat',
          roofOrientation: profile?.property?.roofOrientation || 'south',
          shadingCondition: profile?.property?.shadingCondition || 'none',
          gridPreference: profile?.property?.gridPreference || 'on_grid',
          batteryRequirement: profile?.property?.batteryRequirement || false,
          budget: profile?.property?.budget || 0,
          dayNightUsage: profile?.property?.dayNightUsage || 'balanced',
        },
        solar: metrics ? {
          recommendedCapacity: metrics.recommendedCapacity,
          capacityRange: {
            min: Math.max(1, Math.round((metrics.recommendedCapacity * 0.85) * 10) / 10),
            max: Math.round((metrics.recommendedCapacity * 1.15) * 10) / 10,
          },
          panelCount: metrics.panelCount,
          panelWattage: metrics.panelWattage,
          inverterCapacity: metrics.inverterCapacity,
          areaRequiredSqFt: metrics.areaRequiredSqFt,
          dailyGeneration: metrics.dailyGeneration,
          annualGeneration: metrics.annualGeneration,
          solarSuitability: recResult?.solarSuitability || 'Good',
          aiExplanation: recResult?.aiExplanation || '',
          whyRecommendBullets: metrics.whyRecommendBullets || [],
          recommendationScore: metrics.recommendationScore || 0,
        } : (profile?.solar || {}),
        financials: metrics ? {
          systemCost: metrics.systemCost,
          subsidy: metrics.subsidy,
          subsidyScheme: metrics.subsidyInfo?.schemeName || 'PM Surya Ghar: Muft Bijli Yojana',
          netCost: metrics.netCost,
          annualSavings: metrics.annualSavings,
          monthlySavings: metrics.monthlySavings,
          paybackPeriod: metrics.paybackPeriod,
          discountedPaybackPeriod: metrics.discountedPaybackPeriod,
          npv: metrics.npv,
          irr: metrics.irr,
          lcoe: metrics.lcoe,
          roi: metrics.roi,
          lifetimeSavings: metrics.lifetimeSavings,
          financialViability: viability.financialViability,
          viabilityReason: viability.viabilityReason,
        } : (profile?.financials || {}),
        environmental: metrics ? {
          co2AvoidedKg: metrics.co2AvoidedKg,
          treesPlanted: metrics.treesPlanted,
          coalSavedKg: Math.round(metrics.annualGeneration * 0.4),
        } : (profile?.environmental || {}),
        assumptions: metrics?.assumptions || profile?.assumptions,
        provenance: {
          monthlyConsumption: {
            value: units,
            source: 'bill_extracted',
            confidence: billDoc.fieldConfidence?.unitsConsumed || confScore,
            status: statusTag,
            notes: `Extracted from document: ${billDoc.fileName || 'Uploaded Bill'}`,
          },
          monthlyBill: {
            value: billAmount,
            source: 'bill_extracted',
            confidence: billDoc.fieldConfidence?.totalAmount || confScore,
            status: statusTag,
            notes: `Extracted total amount payable`,
          },
          tariff: {
            value: tariff,
            source: billDoc.tariff ? 'bill_extracted' : 'calculated',
            confidence: confScore,
            status: billDoc.tariff ? statusTag : 'calculated',
            notes: billDoc.tariff ? 'Explicitly stated on bill' : 'Computed from Total Bill ÷ Units Consumed',
          },
          roofArea: {
            value: effectiveArea,
            source: existingArea > 0 ? 'user_input' : 'calculated',
            confidence: existingArea > 0 ? 1.0 : 0.7,
            status: existingArea > 0 ? 'userVerified' : 'estimated',
            notes: existingArea > 0 ? 'User declared rooftop area' : 'Estimated standard rooftop footprint required',
          },
          recommendedCapacity: {
            value: metrics?.recommendedCapacity || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Deterministic sizing: Daily kWh ÷ (Peak Sun Hours × PR)',
          },
          annualGeneration: {
            value: metrics?.annualGeneration || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Calculated using regional PSH and combined engineering derate',
          },
          systemCost: {
            value: metrics?.systemCost || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Calculated using benchmark category Capex/kW',
          },
          subsidy: {
            value: metrics?.subsidy || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Calculated per active PM Surya Ghar subsidy slabs',
          },
          netCost: {
            value: metrics?.netCost || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Net capital outlay = Gross Capex - Direct Subsidy',
          },
          annualSavings: {
            value: metrics?.annualSavings || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Calculated from annual solar self-consumption × grid tariff',
          },
          paybackPeriod: {
            value: metrics?.paybackPeriod || 0,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Net Capex ÷ Annual Year-1 Net Savings',
          },
        },
        dataQuality: {
          isComplete: Boolean(units > 0 && metrics),
          hasBill: true,
          hasAssessment: Boolean(profile?.sourceAssessmentId),
          hasVerifiedData: isUserVerified,
          confidenceScore: confScore,
          lastUpdatedSource: 'bill_sync',
        },
      };

      if (profile) {
        Object.assign(profile, profileData);
        await profile.save();
      } else {
        profile = await EnergyProfile.create(profileData);
      }

      return profile;
    } catch (err) {
      console.error('[EnergyProfileService] Error syncing from bill:', err);
      throw err;
    }
  }

  /**
   * Synchronizes EnergyProfile from a SolarAssessment & Recommendation run.
   */
  async syncFromAssessment(userId, assessmentDoc, recommendationDoc = null) {
    try {
      let profile = await EnergyProfile.findOne({ userId });
      const user = await User.findById(userId);

      const viability = this.evaluateFinancialViability(
        assessmentDoc.paybackPeriod,
        assessmentDoc.roi,
        assessmentDoc.npv || 50000
      );

      const profileData = {
        userId,
        primarySource: 'manual_assessment',
        sourceAssessmentId: assessmentDoc._id,
        sourceRecommendationId: recommendationDoc?._id || profile?.sourceRecommendationId,
        userType: assessmentDoc.userType,
        location: assessmentDoc.location || user?.location || { state: 'Maharashtra', city: 'Pune' },
        consumption: {
          monthlyConsumption: assessmentDoc.monthlyConsumption,
          dailyConsumption: Math.round((assessmentDoc.monthlyConsumption / 30) * 10) / 10,
          monthlyBill: assessmentDoc.monthlyBill,
          tariff: assessmentDoc.tariff,
          billingPeriodDays: 30,
          billingMonth: profile?.consumption?.billingMonth || 'Assessment Period',
          billingYear: profile?.consumption?.billingYear || new Date().getFullYear(),
          discom: profile?.consumption?.discom || '',
          consumerNumber: profile?.consumption?.consumerNumber || '',
          consumerName: user?.name || '',
          consumerCategory: assessmentDoc.userType === 'residential' ? 'Residential' :
                           assessmentDoc.userType === 'farm' ? 'Agricultural' : 'Commercial',
        },
        property: {
          roofArea: assessmentDoc.roofArea,
          usableRoofArea: assessmentDoc.areaRequiredSqFt || Math.round(assessmentDoc.roofArea * 0.7),
          roofType: assessmentDoc.roofType || 'concrete_flat',
          roofOrientation: assessmentDoc.roofOrientation || 'south',
          shadingCondition: assessmentDoc.shadingCondition || 'none',
          gridPreference: assessmentDoc.gridPreference || 'on_grid',
          batteryRequirement: Boolean(assessmentDoc.batteryRequirement),
          budget: assessmentDoc.budget || 0,
          dayNightUsage: assessmentDoc.dayNightUsage || 'balanced',
        },
        solar: {
          recommendedCapacity: assessmentDoc.recommendedCapacity,
          capacityRange: {
            min: Math.max(1, Math.round((assessmentDoc.recommendedCapacity * 0.85) * 10) / 10),
            max: Math.round((assessmentDoc.recommendedCapacity * 1.15) * 10) / 10,
          },
          panelCount: assessmentDoc.panelCount,
          panelWattage: assessmentDoc.panelWattage || 540,
          inverterCapacity: assessmentDoc.inverterCapacity,
          areaRequiredSqFt: assessmentDoc.areaRequiredSqFt,
          dailyGeneration: assessmentDoc.estimatedDailyGeneration || Math.round((assessmentDoc.estimatedGeneration / 365) * 10) / 10,
          annualGeneration: assessmentDoc.estimatedGeneration,
          solarSuitability: assessmentDoc.solarSuitability || 'Good',
          aiExplanation: assessmentDoc.aiExplanation || '',
          whyRecommendBullets: recommendationDoc?.whyRecommendBullets || [],
          recommendationScore: assessmentDoc.recommendationScore || 85,
        },
        financials: {
          systemCost: assessmentDoc.estimatedCost,
          subsidy: assessmentDoc.subsidy,
          subsidyScheme: assessmentDoc.userType === 'residential' ? 'PM Surya Ghar: Muft Bijli Yojana' : '40% Accelerated Tax Depreciation',
          netCost: assessmentDoc.netCost,
          annualSavings: assessmentDoc.annualSavings,
          monthlySavings: assessmentDoc.monthlySavings || Math.round(assessmentDoc.annualSavings / 12),
          paybackPeriod: assessmentDoc.paybackPeriod,
          discountedPaybackPeriod: assessmentDoc.discountedPaybackPeriod || Math.round((assessmentDoc.paybackPeriod * 1.2) * 10) / 10,
          npv: assessmentDoc.npv || 0,
          irr: assessmentDoc.irr || 0,
          lcoe: assessmentDoc.lcoe || 2.45,
          roi: assessmentDoc.roi,
          lifetimeSavings: assessmentDoc.lifetimeSavings || (assessmentDoc.annualSavings * 20),
          financialViability: viability.financialViability,
          viabilityReason: viability.viabilityReason,
        },
        environmental: {
          co2AvoidedKg: assessmentDoc.co2AvoidedKg,
          treesPlanted: assessmentDoc.treesPlanted,
          coalSavedKg: Math.round(assessmentDoc.estimatedGeneration * 0.4),
        },
        assumptions: assessmentDoc.assumptions || profile?.assumptions,
        provenance: {
          monthlyConsumption: {
            value: assessmentDoc.monthlyConsumption,
            source: 'user_input',
            confidence: 1.0,
            status: 'userVerified',
            notes: 'Provided directly by user in solar assessment wizard',
          },
          monthlyBill: {
            value: assessmentDoc.monthlyBill,
            source: 'user_input',
            confidence: 1.0,
            status: 'userVerified',
            notes: 'Provided directly by user in solar assessment wizard',
          },
          tariff: {
            value: assessmentDoc.tariff,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Declared by user or resolved from state tariff schedule',
          },
          roofArea: {
            value: assessmentDoc.roofArea,
            source: 'user_input',
            confidence: 1.0,
            status: 'userVerified',
            notes: 'Rooftop footprint specified in assessment step 3',
          },
          recommendedCapacity: {
            value: assessmentDoc.recommendedCapacity,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Computed deterministically from consumption & solar irradiance',
          },
          annualGeneration: {
            value: assessmentDoc.estimatedGeneration,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Standard PV generation formula with system loss derates',
          },
          systemCost: {
            value: assessmentDoc.estimatedCost,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Computed from market turnkey rate per kW',
          },
          subsidy: {
            value: assessmentDoc.subsidy,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Computed per national PM Surya Ghar subsidy rule matrix',
          },
          netCost: {
            value: assessmentDoc.netCost,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'System cost less eligible direct subsidies',
          },
          annualSavings: {
            value: assessmentDoc.annualSavings,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Estimated first-year bill reduction from solar generation',
          },
          paybackPeriod: {
            value: assessmentDoc.paybackPeriod,
            source: 'calculated',
            confidence: 1.0,
            status: 'calculated',
            notes: 'Deterministic simple payback = Net Investment ÷ Annual Savings',
          },
        },
        dataQuality: {
          isComplete: true,
          hasBill: Boolean(profile?.sourceBillId || profile?.dataQuality?.hasBill),
          hasAssessment: true,
          hasVerifiedData: true,
          confidenceScore: 0.98,
          lastUpdatedSource: 'assessment_sync',
        },
      };

      if (profile) {
        Object.assign(profile, profileData);
        await profile.save();
      } else {
        profile = await EnergyProfile.create(profileData);
      }

      return profile;
    } catch (err) {
      console.error('[EnergyProfileService] Error syncing from assessment:', err);
      throw err;
    }
  }

  /**
   * Retrieves canonical profile for a user.
   * If profile does not exist yet, tries to back-fill from latest assessment or verified bill.
   */
  async getCanonicalProfile(userId) {
    try {
      let profile = await EnergyProfile.findOne({ userId });
      if (profile) {
        return profile;
      }

      // Check if user has an existing assessment to populate profile retroactively
      const latestAssessment = await SolarAssessment.findOne({ userId }).sort({ createdAt: -1 });
      if (latestAssessment) {
        const latestRec = await Recommendation.findOne({ assessmentId: latestAssessment._id });
        return await this.syncFromAssessment(userId, latestAssessment, latestRec);
      }

      // Check if user has an existing bill
      const latestBill = await Bill.findOne({ userId, verificationStatus: 'verified' }).sort({ createdAt: -1 });
      if (latestBill) {
        return await this.syncFromBill(userId, latestBill, latestBill.verifiedByUser);
      }

      // Return empty blueprint profile (clean unpopulated state for brand new users)
      const user = await User.findById(userId);
      return {
        userId,
        userType: user?.userType || 'residential',
        location: user?.location || { state: 'Maharashtra', city: 'Pune' },
        dataQuality: {
          isComplete: false,
          hasBill: false,
          hasAssessment: false,
          hasVerifiedData: false,
          confidenceScore: 0,
        },
        consumption: {
          monthlyConsumption: 0,
          monthlyBill: 0,
          tariff: 7.5,
        },
        solar: {
          recommendedCapacity: 0,
          annualGeneration: 0,
        },
        financials: {
          netCost: 0,
          annualSavings: 0,
          paybackPeriod: 0,
          financialViability: 'Not Evaluated',
        },
        environmental: {
          co2AvoidedKg: 0,
          treesPlanted: 0,
        },
      };
    } catch (err) {
      console.error('[EnergyProfileService] Error getting canonical profile:', err);
      throw err;
    }
  }
}

module.exports = new EnergyProfileService();
