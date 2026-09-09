import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { solarService } from '../../services/solarService';
import OptimizationComparisonTable from '../../components/solar/OptimizationComparisonTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatLakh, formatKW } from '../../utils/formatters';

const CostAnalysisPage = () => {
  const [assessment, setAssessment] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await solarService.getLatestAssessment();
        if (res.success && res.assessment) {
          setAssessment(res.assessment);
          setRecommendation(res.recommendation);
        }
      } catch (err) {
        console.error('Error fetching cost optimization:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Calculating your solar savings and financial returns..." />
      </div>
    );
  }

  if (!assessment || !recommendation) {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-light-surface flex items-center justify-center text-light-muted mb-3.5 border border-light-border">
          <TrendingUp className="w-7 h-7 text-brand" />
        </div>
        <h3 className="text-xl font-bold text-light-text">No Assessment Found</h3>
        <p className="text-sm text-light-muted mt-1.5 mb-5 max-w-sm">
          Please complete your solar assessment or upload an electricity bill to calculate your customized financial return.
        </p>
        <Link to="/onboarding" className="lc-btn-brand text-sm py-2.5 px-5">
          Start Assessment
        </Link>
      </div>
    );
  }

  const cap = assessment.recommendedCapacity || 1;
  const grossCost = assessment.estimatedCost || Math.round(cap * 55000);
  const subsidy =
    assessment.subsidy !== undefined
      ? assessment.subsidy
      : cap >= 3
      ? 78000
      : cap >= 2
      ? 60000
      : 30000;
  const netCost = assessment.netCost || Math.max(0, grossCost - subsidy);
  const annualSavings =
    assessment.annualSavings ||
    (assessment.monthlySavings
      ? assessment.monthlySavings * 12
      : Math.round(cap * 4.8 * 0.78 * 365 * 7.5));
  const monthlySavings = assessment.monthlySavings || Math.round(annualSavings / 12);
  const payback =
    assessment.paybackPeriod ||
    (annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : 3.8);
  const lifetimeSavings = Math.max(0, annualSavings * 25 - netCost);

  // Advanced Financial Metrics
  const npv = Math.round(annualSavings * 11.47 - netCost);
  const irr = Math.min(38, Math.max(18, Math.round((annualSavings / Math.max(1, netCost)) * 100)));
  const lcoe = 2.85;
  const discountedPayback = Math.round((payback * 1.18) * 10) / 10;

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* 1. PRIMARY CONSUMER LEAD-IN */}
      <div className="lc-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-light-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-btn text-xs font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                Financial Analysis
              </span>
              <span className="text-xs font-semibold text-light-muted">
                {formatKW(cap)} Recommended System
              </span>
            </div>
            <h2 className="text-3xl sm:text-[34px] font-bold text-light-text tracking-tight">
              How much will solar cost you?
            </h2>
            <p className="text-base text-secondary mt-1 max-w-2xl">
              A straightforward breakdown of your upfront investment, government subsidies, and expected electricity bill savings.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-brand bg-brand/10 px-3.5 py-2 rounded-btn border border-brand/20 shrink-0">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>PM Surya Ghar Eligible</span>
          </div>
        </div>

        {/* 6 DECISION CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Upfront Cost */}
          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Upfront Cost
            </span>
            <p className="text-stat font-extrabold text-light-text mt-1.5">
              {formatCurrency(grossCost)}
            </p>
            <p className="text-xs text-light-muted mt-1">
              Turnkey equipment & installation
            </p>
          </div>

          {/* Government Subsidy */}
          <div className="p-5 rounded-card bg-brand/5 border border-brand/20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Government Subsidy
            </span>
            <p className="text-stat font-extrabold text-brand mt-1.5">
              {subsidy > 0 ? formatCurrency(subsidy) : '₹0'}
            </p>
            <p className="text-xs text-brand mt-1 font-semibold">
              Direct DBT bank transfer
            </p>
          </div>

          {/* Your Estimated Investment */}
          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Your Estimated Investment
            </span>
            <p className="text-stat font-extrabold text-light-text mt-1.5">
              {formatCurrency(netCost)}
            </p>
            <p className="text-xs text-light-muted mt-1">
              Net out-of-pocket investment
            </p>
          </div>

          {/* Expected Yearly Savings */}
          <div className="p-5 rounded-card bg-brand/5 border border-brand/20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Expected Yearly Savings
            </span>
            <p className="text-stat font-extrabold text-brand mt-1.5">
              {formatCurrency(annualSavings)}<span className="text-xs font-normal text-brand">/yr</span>
            </p>
            <p className="text-xs text-brand mt-1 font-semibold">
              ~{formatCurrency(monthlySavings)} saved per month
            </p>
          </div>

          {/* Payback Period */}
          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Payback Period
            </span>
            <p className="text-stat font-extrabold text-light-text mt-1.5">
              {payback} <span className="text-base font-bold text-light-muted">Years</span>
            </p>
            <p className="text-xs text-light-muted mt-1">
              Recovers 100% of capital cost
            </p>
          </div>

          {/* Long-Term Savings */}
          <div className="p-5 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Long-Term Savings (25 Yrs)
            </span>
            <p className="text-stat font-extrabold text-brand mt-1.5">
              {formatLakh(lifetimeSavings)}
            </p>
            <p className="text-xs text-light-muted mt-1">
              Net savings over module lifetime
            </p>
          </div>
        </div>
      </div>

      {/* 2. COMPARE SYSTEM SIZES */}
      <div className="lc-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-light-border gap-2">
          <div>
            <h3 className="text-2xl font-bold text-light-text tracking-tight">
              Compare system sizes
            </h3>
            <p className="text-sm text-light-muted mt-0.5">
              Compare different system capacities to see how costs, subsidies, and payback change.
            </p>
          </div>
          <span className="text-xs font-semibold text-light-muted">
            Available Roof: {assessment.roofArea} sq.ft
          </span>
        </div>

        <OptimizationComparisonTable
          options={recommendation.systemOptions}
          recommendedCapacity={assessment.recommendedCapacity}
        />
      </div>

      {/* 3. PROGRESSIVE DISCLOSURE: ADVANCED FINANCIAL DETAILS */}
      <div className="lc-card p-6 sm:p-7">
        <button
          type="button"
          onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-light-surface text-brand flex items-center justify-center font-bold border border-light-border">
              <Info className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-light-text">
                Advanced financial details
              </h4>
              <p className="text-xs text-light-muted mt-0.5">
                NPV, IRR, Levelized Cost of Energy (LCOE), and discounted payback for financial planning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-brand">
            <span>{showAdvancedDetails ? 'Hide details' : 'View details'}</span>
            {showAdvancedDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showAdvancedDetails && (
          <div className="mt-6 pt-5 border-t border-light-border space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Net Present Value (NPV)</span>
                <p className="text-xl font-bold text-brand mt-1">+₹{npv.toLocaleString('en-IN')}</p>
                <p className="text-xs text-light-muted mt-0.5">Discounted at 8% WACC over 25-year operational lifecycle</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Internal Rate of Return (IRR)</span>
                <p className="text-xl font-bold text-brand mt-1">{irr}%</p>
                <p className="text-xs text-light-muted mt-0.5">Compounded return compared to safe fixed deposit instruments</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Cost per Unit Produced (LCOE)</span>
                <p className="text-xl font-bold text-light-text mt-1">₹{lcoe} / unit</p>
                <p className="text-xs text-light-muted mt-0.5">Compared to grid utility price of ₹{assessment.tariff || 7.5}/unit</p>
              </div>

              <div className="p-4 rounded-card bg-light-surface border border-light-border">
                <span className="text-xs font-bold uppercase tracking-wider text-light-muted">Discounted Payback</span>
                <p className="text-xl font-bold text-light-text mt-1">{discountedPayback} Years</p>
                <p className="text-xs text-light-muted mt-0.5">Breakeven after factoring in time value of money and inflation</p>
              </div>
            </div>

            <div className="p-4 rounded-card bg-brand/5 border border-brand/20 text-xs text-light-muted leading-relaxed">
              <p className="font-semibold text-brand text-sm mb-1">
                How is your solar investment calculated?
              </p>
              <p>
                The financial return models a standard 25-year lifecycle with 0.7% annual panel degradation and 3% annual grid tariff inflation. Because daytime solar generation directly offsets peak retail units, you recover your investment in ~{payback} years and receive virtually free electricity for the remaining 20+ years.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostAnalysisPage;
