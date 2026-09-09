import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { formatCurrency, formatKW, formatKWh } from '../../utils/formatters';

const BestSetupCard = ({ assessment }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!assessment) return null;

  const {
    recommendedCapacity = 3.5,
    panelCount = 7,
    panelWattage = 540,
    estimatedGeneration = 4895,
    annualSavings = 36712,
    monthlySavings = 3059,
    paybackPeriod = 3.6,
    netCost = 132000,
    subsidy = 78000,
    estimatedCost = 210000,
    aiExplanation = '',
    assumptions = {},
  } = assessment;

  return (
    <div className="lc-card border border-brand/40 space-y-4 transition-colors">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-meta font-medium px-2 py-0.5 rounded-btn bg-brand/10 text-brand border border-brand/20">
              Personalized Sizing Match
            </span>
            <span className="text-meta text-light-muted dark:text-dark-muted capitalize">
              {assessment.userType?.replace('_', ' ')}
            </span>
          </div>
          <h2 className="text-section-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-1">
            Recommended Solar Setup
          </h2>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
            Optimized to offset ~90% of electricity bills while maximizing subsidy and ROI
          </p>
        </div>

        <Link
          to="/solar-recommendation"
          className="lc-btn-brand self-start sm:self-auto"
        >
          <span>View Recommendation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sizing Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <p className="text-meta text-light-muted dark:text-dark-muted">Solar Size</p>
          <p className="text-stat text-light-text dark:text-dark-text mt-0.5">{formatKW(recommendedCapacity)}</p>
          <p className="text-helper font-normal text-brand font-medium mt-0.5">{panelCount} panels ({panelWattage}W)</p>
        </div>

        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <p className="text-meta text-light-muted dark:text-dark-muted">Yearly Energy</p>
          <p className="text-stat text-light-text dark:text-dark-text mt-0.5">{formatKWh(estimatedGeneration)}</p>
          <p className="text-helper font-normal text-light-muted dark:text-dark-muted mt-0.5">~{Math.round(estimatedGeneration / 365)} units/day</p>
        </div>

        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <p className="text-meta text-brand font-medium">Annual Savings</p>
          <p className="text-stat text-brand mt-0.5">{formatCurrency(annualSavings)}</p>
          <p className="text-helper font-normal text-light-muted dark:text-dark-muted mt-0.5">~{formatCurrency(monthlySavings)}/mo</p>
        </div>

        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <p className="text-meta text-light-muted dark:text-dark-muted">Payback Period</p>
          <p className="text-stat text-light-text dark:text-dark-text mt-0.5">{paybackPeriod} Yrs</p>
          <p className="text-helper font-normal text-brand font-medium mt-0.5">Free power after</p>
        </div>

        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <p className="text-meta text-light-muted dark:text-dark-muted">Govt Subsidy</p>
          <p className="text-stat text-brand mt-0.5">{subsidy > 0 ? formatCurrency(subsidy) : '40% Tax Dep.'}</p>
          <p className="text-helper font-normal text-light-muted dark:text-dark-muted mt-0.5">Direct DBT grant</p>
        </div>

        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-brand/40">
          <p className="text-meta text-brand font-medium">Net Outlay</p>
          <p className="text-stat text-light-text dark:text-dark-text mt-0.5">{formatCurrency(netCost)}</p>
          <p className="text-helper font-normal text-light-muted dark:text-dark-muted line-through mt-0.5">{formatCurrency(estimatedCost)} gross</p>
        </div>
      </div>

      {/* Concise Rationale Box */}
      <div className="p-3.5 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-2">
        <div className="flex items-center gap-1.5 text-brand font-medium text-meta">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sizing Rationale</span>
        </div>
        <p className="text-body text-light-text dark:text-dark-text leading-relaxed">
          {aiExplanation ||
            `Based on your consumption profile, a ${recommendedCapacity} kW system is optimal. It matches your roof area (${panelCount} panels) and yields maximum PM Surya Ghar financial assistance.`}
        </p>

        {/* Technical Sizing Drawer Toggle */}
        <div className="pt-2 border-t border-light-border dark:border-dark-border flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-helper text-brand hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Calculation formula breakdown</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showTechnical ? 'rotate-180' : ''}`} />
          </button>

          <span className="text-helper font-normal text-light-muted dark:text-dark-muted">
            MNRE & CEA physics models
          </span>
        </div>

        {showTechnical && (
          <div className="mt-2 p-3 rounded-btn bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-meta text-light-muted dark:text-dark-muted space-y-1">
            <p className="text-brand font-semibold">// Engineering Sizing Formulas:</p>
            <p>1. Daily Demand = Monthly kWh ({assessment.monthlyConsumption}) ÷ 30 = {(assessment.monthlyConsumption / 30).toFixed(1)} kWh/day</p>
            <p>2. PV Capacity = Daily Demand ÷ (Peak Sun Hours {assumptions.peakSunHours || 4.8} × PR {assumptions.performanceRatio || 0.78}) = {recommendedCapacity} kW</p>
            <p>3. Annual Output = {recommendedCapacity} kW × 4.8 × 365 × 0.78 = {estimatedGeneration} kWh/yr</p>
            <p>4. Net Investment = ({recommendedCapacity} kW × ₹{assumptions.costPerKW || 60000}) - Subsidy (₹{subsidy}) = ₹{netCost}</p>
            <p>5. Simple Payback = Net Investment (₹{netCost}) ÷ Annual Savings (₹{annualSavings}) = {paybackPeriod} Years</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSetupCard;
