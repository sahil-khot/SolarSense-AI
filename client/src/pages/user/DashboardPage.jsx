import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Zap,
  IndianRupee,
  Clock,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  UploadCloud,
  Check,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { solarService } from '../../services/solarService';
import { billService } from '../../services/billService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PastSavingsComparisonChart from '../../components/charts/PastSavingsComparisonChart';
import WhatIfSolarSimulator from '../../components/solar/WhatIfSolarSimulator';
import {
  formatCurrency,
  formatLakh,
  formatKW,
  formatKWh,
  formatNumber,
  getUserTypeBadge,
} from '../../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [bills, setBills] = useState([]);
  const [energyProfile, setEnergyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [solarRes, billRes, profileRes] = await Promise.allSettled([
          solarService.getLatestAssessment(),
          billService.getBills(),
          solarService.getEnergyProfile(),
        ]);

        if (solarRes.status === 'fulfilled' && solarRes.value?.success && solarRes.value?.assessment) {
          setAssessment(solarRes.value.assessment);
        }

        if (billRes.status === 'fulfilled' && billRes.value?.success && billRes.value?.bills) {
          setBills(billRes.value.bills || []);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value?.success && profileRes.value?.profile) {
          setEnergyProfile(profileRes.value.profile);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling your energy profile & solar recommendation dashboard..." />
      </div>
    );
  }

  // --- DERIVE AUTHORITATIVE DATA FROM CANONICAL PROFILE, ASSESSMENT, OR BILLS ---
  const latestBill = bills && bills.length > 0 ? bills[0] : null;
  const hasAssessment = Boolean(assessment || energyProfile?.dataQuality?.hasAssessment);
  const hasBill = Boolean(latestBill || energyProfile?.dataQuality?.hasBill);
  const hasData = hasAssessment || hasBill;

  // Canonical metrics (Strictly no fake default values like 350 kWh or ₹2850)
  const monthlyConsumption =
    energyProfile?.consumption?.monthlyConsumption ||
    latestBill?.unitsConsumed ||
    assessment?.monthlyConsumption ||
    0;

  const monthlyBill =
    energyProfile?.consumption?.monthlyBill ||
    latestBill?.totalAmount ||
    assessment?.monthlyBill ||
    0;

  const tariff =
    energyProfile?.consumption?.tariff ||
    latestBill?.tariff ||
    assessment?.tariff ||
    (monthlyConsumption > 0 && monthlyBill > 0 ? Math.round((monthlyBill / monthlyConsumption) * 100) / 100 : null);

  const recommendedCapacity =
    energyProfile?.solar?.recommendedCapacity ||
    assessment?.recommendedCapacity ||
    (monthlyConsumption > 0 ? Math.max(1, Math.round((monthlyConsumption / (30 * 4.8 * 0.78)) * 10) / 10) : 1.0);

  const estimatedMonthlySavings =
    energyProfile?.financials?.monthlySavings ||
    assessment?.monthlySavings ||
    (monthlyBill > 0 ? Math.round(monthlyBill * 0.85) : Math.round(recommendedCapacity * 4.8 * 0.78 * 30 * (tariff || 7.5)));

  const estimatedAnnualSavings =
    energyProfile?.financials?.annualSavings ||
    assessment?.annualSavings ||
    (estimatedMonthlySavings * 12);

  const netCost =
    energyProfile?.financials?.netCost ||
    assessment?.netCost ||
    (recommendedCapacity * 60000 - (recommendedCapacity <= 2 ? recommendedCapacity * 30000 : 78000));

  const grossCost =
    energyProfile?.financials?.systemCost ||
    assessment?.estimatedCost ||
    (recommendedCapacity * 60000);

  const subsidy =
    energyProfile?.financials?.subsidy ||
    assessment?.subsidy ||
    (recommendedCapacity >= 3 ? 78000 : (recommendedCapacity >= 2 ? 60000 : (recommendedCapacity >= 1 ? 30000 : 0)));

  const paybackPeriod =
    energyProfile?.financials?.paybackPeriod ||
    assessment?.paybackPeriod ||
    (netCost > 0 && estimatedAnnualSavings > 0 ? Math.round((netCost / estimatedAnnualSavings) * 10) / 10 : 3.2);

  const annualGeneration =
    energyProfile?.solar?.annualGeneration ||
    assessment?.estimatedGeneration ||
    (recommendedCapacity > 0 ? Math.round(recommendedCapacity * 4.8 * 0.78 * 365) : 1400);

  const co2AvoidedKg =
    energyProfile?.environmental?.co2AvoidedKg ||
    assessment?.co2AvoidedKg ||
    Math.round(annualGeneration * 0.82);

  const treesPlanted =
    energyProfile?.environmental?.treesPlanted ||
    assessment?.treesPlanted ||
    Math.round(annualGeneration * 0.04);

  const areaRequired =
    energyProfile?.solar?.areaRequiredSqFt ||
    assessment?.areaRequiredSqFt ||
    Math.round(recommendedCapacity * 90);

  const isConsumptionEstimated =
    energyProfile?.provenance?.monthlyConsumption?.status === 'estimated' ||
    latestBill?.normalizedData?.isConsumptionEstimated ||
    !hasData;

  const userType = energyProfile?.userType || assessment?.userType || user?.userType || 'residential';
  const badge = getUserTypeBadge(userType);

  // Genuine comparison chart data from actual uploaded bills only
  const chartData = bills.length > 0
    ? [...bills].reverse().map((b, idx) => {
        const orig = b.totalAmount || (b.unitsConsumed && tariff ? Math.round(b.unitsConsumed * tariff) : 0);
        const slashed = Math.round(orig * 0.15); // ~85% solar offset
        const label = b.billingMonth
          ? `${b.billingMonth} ${b.billingYear || ''}`.trim()
          : (b.fileName ? b.fileName.replace('.pdf', '').substring(0, 14) : `Bill #${idx + 1}`);

        return {
          period: label,
          originalBill: orig,
          withSolar: slashed,
          savings: Math.max(0, orig - slashed),
        };
      })
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Onboarding Guidance Banner for New Users */}
      {!hasData && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Welcome, {user?.name || 'Solar Explorer'}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Explore custom solar system capacities with our live What-If simulator below, or upload your bill to personalize your figures.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Link
              to="/bill-analysis"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Bill</span>
            </Link>
            <Link
              to="/onboarding"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Run Assessment</span>
            </Link>
          </div>
        </div>
      )}
      {/* 1. TOP SUMMARY: 3 Core Consumer Decision Anchors */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h2 className="text-section-title font-semibold text-slate-900 tracking-tight">
              Your Solar & Energy Summary
            </h2>
            <p className="text-secondary text-slate-500 mt-0.5">
              Current electricity baseline and estimated rooftop solar feasibility
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-meta font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {badge?.label || 'Residential'}
            </span>
            <span className="text-meta text-slate-500 hidden sm:inline">
              • {user?.location?.city || 'Pune'}, {user?.location?.state || 'Maharashtra'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Your Electricity */}
          <div className="lc-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-meta font-semibold uppercase tracking-wider text-slate-500">
                  Your Electricity
                </span>
                {isConsumptionEstimated ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Estimated
                  </span>
                ) : monthlyConsumption > 0 ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    From Bill
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-stat font-bold text-slate-900 tracking-tight">
                  {monthlyConsumption > 0 ? monthlyConsumption.toLocaleString('en-IN') : '—'}
                </span>
                <span className="text-body font-semibold text-slate-500">kWh / month</span>
              </div>
              <p className="text-secondary text-slate-500 mt-1">
                {monthlyBill > 0 ? `Current bill: ${formatCurrency(monthlyBill)}/mo` : 'Upload a bill to verify exact units'}
              </p>
            </div>

            {tariff ? (
              <div className="pt-2.5 border-t border-slate-100 text-meta text-slate-500 flex justify-between">
                <span>Average cost per unit:</span>
                <span className="font-semibold text-slate-800">₹{tariff} / kWh</span>
              </div>
            ) : (
              <div className="pt-2.5 border-t border-slate-100 text-meta text-slate-400">
                Tariff calculated from DISCOM bill
              </div>
            )}
          </div>

          {/* Card 2: Your Solar Recommendation */}
          <div className="lc-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-meta font-semibold uppercase tracking-wider text-slate-500">
                  Your Solar Recommendation
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Optimal Size
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-stat font-bold text-emerald-700 tracking-tight">
                  {recommendedCapacity > 0 ? formatKW(recommendedCapacity) : '—'}
                </span>
                <span className="text-body font-semibold text-slate-500">Recommended</span>
              </div>
              <p className="text-secondary text-slate-500 mt-1">
                {netCost > 0 ? `Net investment: ${formatLakh(netCost)}` : 'Roof-optimized solar system'}
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-100 text-meta text-slate-500 flex justify-between">
              <span>Required roof area:</span>
              <span className="font-semibold text-slate-800">~{areaRequired} sq.ft</span>
            </div>
          </div>

          {/* Card 3: Your Savings Potential */}
          <div className="lc-card flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-emerald-50/30">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-meta font-semibold uppercase tracking-wider text-emerald-800">
                  Your Savings Potential
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ~85% Bill Cut
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-stat font-bold text-emerald-700 tracking-tight">
                  {estimatedMonthlySavings > 0 ? formatCurrency(estimatedMonthlySavings) : '—'}
                </span>
                <span className="text-body font-semibold text-emerald-600">/ month</span>
              </div>
              <p className="text-secondary text-emerald-700 mt-1">
                {estimatedAnnualSavings > 0 ? `~${formatCurrency(estimatedAnnualSavings)} saved per year` : 'Free electricity after payback'}
              </p>
            </div>

            <div className="pt-2.5 border-t border-emerald-100 text-meta text-emerald-800 flex justify-between font-medium">
              <span>Estimated payback:</span>
              <span className="font-semibold">{paybackPeriod > 0 ? `${paybackPeriod} years` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WHAT-IF SOLAR SIMULATOR (Interactive Exploration Tool) */}
      <WhatIfSolarSimulator
        recommendedCapacity={recommendedCapacity}
        monthlyConsumption={monthlyConsumption}
        monthlyBill={monthlyBill}
        tariff={tariff}
        userType={userType}
        hasData={hasData}
        costPerKW={assessment?.costPerKW || 60000}
        roofArea={areaRequired}
      />

      {/* 3. PROMINENT SECTION: "YOUR SOLAR RECOMMENDATION" (Per Phase 7) */}
      <div className="bg-white border border-slate-300 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                YOUR SOLAR RECOMMENDATION
              </span>
              <span className="text-xs font-bold text-slate-500">
                Deterministic Sizing Engine
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatKW(recommendedCapacity)} Rooftop Solar System
            </h3>
            <p className="text-base text-slate-600 mt-1 font-normal">
              Engineered to replace ~85% of your grid electricity consumption while maximizing government financial assistance.
            </p>
          </div>

          <Link
            to="/solar-recommendation"
            className="self-start md:self-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <span>View Full Recommendation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Core Financial & Technical Value Anchors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Recommended System
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {formatKW(recommendedCapacity)}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              ~{Math.round(annualGeneration / 365)} kWh clean daily energy
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Estimated Net Investment
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {netCost > 0 ? formatLakh(netCost) : (grossCost > 0 ? formatLakh(grossCost - subsidy) : '—')}
            </p>
            <p className="text-xs text-emerald-700 mt-1 font-semibold">
              After ₹{subsidy ? subsidy.toLocaleString('en-IN') : '0'} DBT subsidy
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
              Estimated Savings
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {formatCurrency(estimatedMonthlySavings)}<span className="text-sm font-normal text-emerald-600">/mo</span>
            </p>
            <p className="text-xs text-emerald-700 mt-1 font-semibold">
              ~{formatCurrency(estimatedAnnualSavings)} in Year 1
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
              Simple Payback
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {paybackPeriod > 0 ? `${paybackPeriod} years` : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Free electricity for next 20+ years
            </p>
          </div>
        </div>

        {/* 3. "WHY SOLARSENSE RECOMMENDS THIS" (Per Phase 7) */}
        <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Why SolarSense Recommends This System</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-800 font-medium">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Matches your consumption:</strong> Generates ~{annualGeneration.toLocaleString('en-IN')} kWh/year, covering your {monthlyConsumption > 0 ? `${monthlyConsumption} kWh/mo` : 'declared'} usage without excessive grid feed-in penalties.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Fits your roof footprint:</strong> Requires ~{areaRequired} sq.ft of unshaded roof space, leaving safe maintenance margins.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Maximizes government subsidies:</strong> Unlocks direct bank transfer assistance under active PM Surya Ghar scheme guidelines.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Attractive financial payback:</strong> Recovers initial net capital expenditure in ~{paybackPeriod} years, delivering a 25-year ROI above 20%.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ELECTRICITY TREND & HISTORICAL BILL SAVINGS */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Historical Diagnostics
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <span>Electricity Bill Trend & Solar Savings Comparison</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Visual proof of how rooftop solar net-metering offsets your monthly DISCOM charges
            </p>
          </div>

          <Link
            to="/bill-analysis"
            className="self-start sm:self-auto text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Another Bill</span>
          </Link>
        </div>

        {chartData.length > 0 ? (
          <PastSavingsComparisonChart data={chartData} />
        ) : (
          <div className="text-center py-10 space-y-3 bg-slate-50 rounded-xl border border-slate-200 p-6">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              No historical electricity bills uploaded yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload your monthly DISCOM electricity bill PDF or photo to unlock visual month-by-month bill comparison.
            </p>
            <Link
              to="/bill-analysis"
              className="inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Electricity Bill</span>
            </Link>
          </div>
        )}

        {/* Historical Table if bills exist */}
        {bills.length > 0 && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse min-w-[650px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase font-bold text-slate-500 bg-slate-50 tracking-wider">
                  <th className="py-3 px-3">Document / Period</th>
                  <th className="py-3 px-3">Units (kWh)</th>
                  <th className="py-3 px-3">Actual Light Bill</th>
                  <th className="py-3 px-3">Tariff</th>
                  <th className="py-3 px-3">Bill With Solar</th>
                  <th className="py-3 px-3">Monthly Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((b) => {
                  const billAmt = b.totalAmount || (b.unitsConsumed && tariff ? Math.round(b.unitsConsumed * tariff) : 0);
                  const withSolar = Math.round(billAmt * 0.15);
                  const savings = Math.max(0, billAmt - withSolar);
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 block">
                          {b.billingMonth ? `${b.billingMonth} ${b.billingYear || ''}` : b.fileName || 'Uploaded Bill'}
                        </span>
                        <span className="text-xs text-slate-400">{b.discom || 'DISCOM Bill'}</span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {b.unitsConsumed ? `${b.unitsConsumed} kWh` : '—'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-rose-600">
                        {formatCurrency(billAmt)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        ₹{b.tariff || tariff || '—'}/unit
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700">
                        {formatCurrency(withSolar)}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-700">
                        +{formatCurrency(savings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. SOLAR IMPACT: Annual Generation, Annual Savings, Environmental */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Clean Energy Impact
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            25-Year Environmental & Lifetime Contribution
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Every kilowatt of rooftop solar displaces carbon-intensive thermal power from the national grid
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Annual Solar Generation
            </span>
            <p className="text-3xl font-extrabold text-slate-900">
              {formatKWh(annualGeneration)}
            </p>
            <p className="text-xs text-slate-500">
              ~{formatKWh(annualGeneration * 25)} over 25-year panel warranty
            </p>
          </div>

          <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              CO₂ Emissions Avoided
            </span>
            <p className="text-3xl font-extrabold text-emerald-700">
              {formatNumber(co2AvoidedKg)} <span className="text-lg font-bold">kg / yr</span>
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              ~{formatNumber(Math.round((co2AvoidedKg * 25) / 1000), 1)} metric tonnes over lifecycle
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Forest Equivalent
            </span>
            <p className="text-3xl font-extrabold text-slate-900">
              {treesPlanted} <span className="text-lg font-bold">Trees</span>
            </p>
            <p className="text-xs text-slate-500">
              Equivalent carbon absorption of planted trees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
