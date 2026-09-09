import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Sparkles,
  TrendingUp,
  FileText,
  CheckCircle2,
  Zap,
  Layers,
  ShieldCheck,
  Compass,
  ArrowRight,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Award,
} from 'lucide-react';
import { solarService } from '../../services/solarService';
import TechnicalSpecsCard from '../../components/solar/TechnicalSpecsCard';
import EnvironmentalImpactCard from '../../components/solar/EnvironmentalImpactCard';
import GovernmentSubsidiesCard from '../../components/solar/GovernmentSubsidiesCard';
import SuitableCompaniesCard from '../../components/solar/SuitableCompaniesCard';
import PredictionTimelineCard from '../../components/solar/PredictionTimelineCard';
import CostOptimizationCard from '../../components/solar/CostOptimizationCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatLakh, formatKW, formatKWh } from '../../utils/formatters';

const SolarRecommendationPage = () => {
  const location = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [energyProfile, setEnergyProfile] = useState(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        const [solarRes, profileRes] = await Promise.allSettled([
          solarService.getLatestAssessment(),
          solarService.getEnergyProfile(),
        ]);

        if (solarRes.status === 'fulfilled' && solarRes.value?.success && solarRes.value?.assessment) {
          setAssessment(solarRes.value.assessment);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.profile) {
          setEnergyProfile(profileRes.value.profile);
        }
      } catch (err) {
        console.error('Error fetching recommendation:', err);
      } finally {
        setLoading(false);
      }
    };
    loadRecommendation();
  }, [location.key]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Analyzing optimal solar system sizing from your electricity data..." />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-4 border border-emerald-200 shadow-xs">
          <Sun className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900">No Assessment Found</h3>
        <p className="text-base text-slate-600 mt-2 mb-6 max-w-sm">
          Upload your electricity bill or complete the quick 3-step assessment to see your custom engineering recommendation.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/bill-analysis"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload Electricity Bill</span>
          </Link>
          <Link
            to="/onboarding"
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-base px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <span>3-Step Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const capacity = assessment.recommendedCapacity || 1;
  const minRangeKw = Math.max(1, Math.round((capacity * 0.85) * 10) / 10);
  const maxRangeKw = Math.round((capacity * 1.15) * 10) / 10;
  const annualGen = assessment.estimatedGeneration || Math.round(capacity * 4.8 * 0.78 * 365);
  const monthlyUnits = assessment.monthlyConsumption || Math.round(annualGen / 12);
  const coveragePercent = Math.min(
    100,
    Math.round((annualGen / Math.max(1, monthlyUnits * 12)) * 100)
  );

  const grossCost = assessment.estimatedCost || Math.round(capacity * 55000);
  const subsidy = assessment.subsidy !== undefined ? assessment.subsidy : (capacity >= 3 ? 78000 : (capacity >= 2 ? 60000 : 30000));
  const netCost = assessment.netCost || Math.max(0, grossCost - subsidy);
  const annualSavings = assessment.annualSavings || Math.round(annualGen * (assessment.tariff || 7.5));
  const monthlySavings = assessment.monthlySavings || Math.round(annualSavings / 12);
  const payback = assessment.paybackPeriod || (annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : 3.8);

  // Financial Viability Assessment (Phase 13)
  const isViable = payback <= 4.5 ? 'Strong' : (payback <= 7.0 ? 'Moderate' : 'Weak');
  const viabilityReason = isViable === 'Strong'
    ? `Strong investment case: Fast capital payback of ${payback} years and attractive 25-year ROI supported by PM Surya Ghar financial assistance.`
    : (isViable === 'Moderate'
      ? `Healthy returns: ${payback} years breakeven provides steady insurance against rising DISCOM grid tariffs.`
      : `Extended payback (${payback} years): Consider shadow reduction, optimal orientation, or higher-efficiency Mono PERC panels.`);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Bill Provenance Notice if generated from bill */}
      {assessment.sourceBill && (
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                Calculated Directly from Uploaded Bill
              </p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                Document: <span className="font-extrabold text-emerald-700">{assessment.sourceBill}</span> • Consumption: {assessment.monthlyConsumption} kWh/month
                {assessment.monthlyBill ? ` (${formatCurrency(assessment.monthlyBill)}/mo)` : ''}
              </p>
            </div>
          </div>
          <Link
            to="/bill-analysis"
            className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1.5 shrink-0"
          >
            <span>View Bill Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* SECTION 1: HERO SOLAR RECOMMENDATION (Per Phase 28 & Phase 7) */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                YOUR SOLAR RECOMMENDATION
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                {assessment.userType ? assessment.userType.replace('_', ' ') : 'Residential'} Property
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Range: {minRangeKw} – {maxRangeKw} kW
              </span>
            </div>

            <h2 className="text-3xl sm:text-[34px] font-bold text-light-text tracking-tight leading-tight">
              SolarSense recommends a {formatKW(capacity)} system for you.
            </h2>

            <p className="text-base sm:text-secondary mt-1.5">
              Produces <strong className="text-brand font-bold">{formatKWh(annualGen)}</strong> per year (~{Math.round(annualGen / 12)} kWh/month), covering <strong className="text-brand font-bold">~{coveragePercent}%</strong> of your current electricity use.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/cost-analysis"
              className="flex-1 md:flex-initial lc-btn-brand text-sm py-2.5 px-5 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Financial Analysis</span>
            </Link>
            <Link
              to="/reports"
              className="flex items-center justify-center gap-2 lc-btn-secondary text-sm py-2.5 px-5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-brand" />
              <span>Download Report</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary Decision Points */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Recommended system size
            </span>
            <p className="text-stat font-extrabold text-light-text mt-1.5">
              {formatKW(capacity)}
            </p>
            <p className="text-xs text-light-muted mt-1">
              Covers ~{coveragePercent}% of power
            </p>
          </div>

          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Estimated cost
            </span>
            <p className="text-stat font-extrabold text-light-text mt-1.5">
              {formatLakh(netCost)}
            </p>
            <p className="text-xs text-brand mt-1 font-semibold">
              After ₹{subsidy.toLocaleString('en-IN')} DBT subsidy
            </p>
          </div>

          <div className="p-5 rounded-card bg-brand/5 border border-brand/20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Expected yearly savings
            </span>
            <p className="text-stat font-extrabold text-brand mt-1.5">
              {formatCurrency(annualSavings)}<span className="text-xs font-normal text-brand">/yr</span>
            </p>
            <p className="text-xs text-brand mt-1 font-semibold">
              ~{formatCurrency(monthlySavings)}/month
            </p>
          </div>

          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Payback period
            </span>
            <p className="text-stat font-extrabold text-light-text mt-1.5">
              {payback} <span className="text-base font-bold text-light-muted">Years</span>
            </p>
            <p className="text-xs text-light-muted mt-1">
              Free energy for remaining 20+ years
            </p>
          </div>
        </div>

        {/* Is Solar Worth It For You? (Consumer Viability Verdict) */}
        <div className="p-5 rounded-card bg-light-surface border border-light-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
                Is solar worth it for you?
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isViable === 'Strong'
                    ? 'bg-brand/10 text-brand border-brand/20'
                    : (isViable === 'Moderate' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                }`}
              >
                {isViable === 'Strong' ? '✓ Yes, Highly Recommended' : (isViable === 'Moderate' ? '✓ Good Financial Return' : 'Review Roof Constraints')}
              </span>
            </div>
            <p className="text-sm text-light-text leading-relaxed">
              {viabilityReason}
            </p>
          </div>
        </div>

        {/* SECTION 2: WHY THIS SIZE? */}
        <div className="p-5 rounded-card bg-brand/5 border border-brand/20 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand" />
            <span>Why this size?</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-800">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Matches electricity consumption:</strong> Sized for ~{monthlyUnits} kWh/mo to cover normal daytime loads and maximize net-metering banking without export penalties.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Fits available roof footprint:</strong> Requires ~{assessment.areaRequiredSqFt || Math.round(capacity * 90)} sq.ft, safely leaving walking space for maintenance.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Subsidy optimization:</strong> Captures the maximum permissible subsidy under PM Surya Ghar guidelines ({capacity <= 2 ? '₹30,000/kW' : '₹78,000 max'}).
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Attractive payback:</strong> Recovers initial investment in {payback} years, providing free solar power for the remaining 20+ years of module life.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PREDICTION TIMELINE & GENERATION */}
      <PredictionTimelineCard assessment={assessment} />

      {/* SECTION 5: COST OPTIMIZATION & FINANCIAL ENGINE */}
      <CostOptimizationCard assessment={assessment} />

      {/* SECTION 6: GOVERNMENT SUBSIDIES & SCHEMES */}
      <GovernmentSubsidiesCard systemCapacity={capacity} />

      {/* SECTION 7: VERIFIED SOLAR INSTALLERS */}
      <SuitableCompaniesCard
        userType={assessment.userType}
        recommendedCapacity={capacity}
        location={assessment.location}
        budget={netCost}
      />

      {/* SECTION 8: ENVIRONMENTAL IMPACT */}
      <EnvironmentalImpactCard
        co2AvoidedKg={assessment.co2AvoidedKg}
        treesPlanted={assessment.treesPlanted}
        cleanEnergyKWh={annualGen}
      />

      {/* SECTION 9: PROGRESSIVE DISCLOSURE - TECHNICAL DETAILS */}
      <div className="lc-card p-6 sm:p-7">
        <button
          type="button"
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-light-surface text-brand flex items-center justify-center font-bold border border-light-border">
              <Info className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-light-text">
                Technical details & engineering assumptions
              </h4>
              <p className="text-xs text-light-muted mt-0.5">
                Hardware sizing, sunlight hours, expected system performance, and roof requirements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-brand">
            <span>{showAssumptions ? 'Hide technical details' : 'View technical details'}</span>
            {showAssumptions ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {showAssumptions && (
          <div className="mt-6 pt-5 border-t border-light-border space-y-6">
            {/* Assumptions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Available Sunlight (Peak Sun Hours)</span>
                <p className="text-lg font-bold text-light-text mt-1">4.8 Hours / Day</p>
                <p className="text-xs text-light-muted mt-0.5">Based on solar radiation data for {assessment.location?.state || 'India'}</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Expected System Performance</span>
                <p className="text-lg font-bold text-light-text mt-1">78% Efficiency</p>
                <p className="text-xs text-light-muted mt-0.5">Accounts for wiring, dust, temperature, and inverter conversion</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Panel Degradation</span>
                <p className="text-lg font-bold text-light-text mt-1">0.7% / Year</p>
                <p className="text-xs text-light-muted mt-0.5">Standard 25-year performance warranty for Tier-1 Mono PERC panels</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Average Cost per Unit</span>
                <p className="text-lg font-bold text-light-text mt-1">₹{assessment.tariff || 7.5} / kWh</p>
                <p className="text-xs text-light-muted mt-0.5">Slab tariff used to calculate your monthly electricity bill savings</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Rooftop Area Required</span>
                <p className="text-lg font-bold text-light-text mt-1">~{assessment.areaRequiredSqFt || Math.round(capacity * 90)} sq.ft</p>
                <p className="text-xs text-light-muted mt-0.5">Leaves boundary space for walkways and panel maintenance</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Central Subsidy (DBT)</span>
                <p className="text-lg font-bold text-light-text mt-1">PM Surya Ghar Scheme</p>
                <p className="text-xs text-light-muted mt-0.5">₹30,000/kW up to 2 kW, ₹18,000 for 3rd kW, capped at ₹78,000</p>
              </div>
            </div>

            {/* Hardware Specifications Subcomponent */}
            <TechnicalSpecsCard assessment={assessment} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarRecommendationPage;
