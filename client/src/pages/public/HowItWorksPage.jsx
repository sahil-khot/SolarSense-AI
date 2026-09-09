import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
} from 'lucide-react';

const HowItWorksPage = () => {
  const formulas = [
    {
      title: 'Daily Consumption',
      formula: 'dailyConsumption = monthlyConsumption / billingDays',
      desc: 'Calculates the baseline kilowatt-hours consumed each day across 30-day billing intervals.',
    },
    {
      title: 'Estimated PV Capacity',
      formula: 'pvCapacity = dailyConsumption / (peakSunHours × performanceRatio)',
      desc: 'Sizes the DC solar array considering regional sun hours (typically 4.8 hrs/day) and system efficiency (0.78).',
    },
    {
      title: 'Estimated Annual Generation',
      formula: 'annualGeneration = pvCapacity × peakSunHours × 365 × performanceRatio',
      desc: 'Projects the 365-day kilowatt-hour yield of clean electricity delivered to your property.',
    },
    {
      title: 'Panel Count',
      formula: 'panelCount = ceil((pvCapacity × 1000) / panelWattage)',
      desc: 'Determines the exact physical module count using high-efficiency 540W Mono PERC bifacial solar panels.',
    },
    {
      title: 'System & Net Cost',
      formula: 'netCost = (pvCapacity × costPerKW) - subsidy',
      desc: 'Applies transparent Indian market benchmarks (₹48,000 to ₹60,000/kW) and deducts eligible government subsidies.',
    },
    {
      title: 'Simple Payback Period',
      formula: 'payback = netCost / annualSavings',
      desc: 'Projects the exact duration in years until electricity bill savings completely recover your initial net investment.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-btn bg-brand-green/10 border border-brand-green/20 text-brand-green text-label font-medium uppercase tracking-wider mb-2.5">
          <Calculator className="w-3.5 h-3.5" />
          <span>Transparent Solar Physics & Economics</span>
        </div>
        <h1 className="text-page-title font-semibold text-light-text dark:text-dark-text tracking-tight">
          How SolarSense AI Sizing Engine Works
        </h1>
        <p className="text-helper text-light-muted dark:text-dark-muted mt-2 leading-relaxed">
          No black-box mystery numbers. SolarSense AI combines physical solar irradiance models, MNRE engineering baselines, and DISCOM tariff structures to calculate realistic feasibility.
        </p>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formulas.map((item, idx) => (
          <div
            key={idx}
            className="lc-card p-5 hover:border-brand-green/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded-btn bg-brand-green/10 text-brand-green font-mono font-semibold text-label flex items-center justify-center mb-2.5 border border-brand-green/20">
                0{idx + 1}
              </div>
              <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">{item.title}</h3>
              <div className="my-2.5 p-2.5 rounded-btn lc-surface text-brand-green font-mono text-label overflow-x-auto border border-light-border dark:border-dark-border">
                {item.formula}
              </div>
              <p className="text-helper text-light-muted dark:text-dark-muted leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subsidy Explanation */}
      <div className="lc-card p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="text-label font-medium uppercase tracking-wider text-brand-green px-2.5 py-1 rounded-btn bg-brand-green/10 border border-brand-green/20">
            Direct Benefit Transfer Subsidy
          </span>
          <h2 className="text-section-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-2.5">
            PM Surya Ghar: Muft Bijli Yojana (2024–2026)
          </h2>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
            For residential consumers in India, direct benefit transfer (DBT) subsidies are automatically calculated and factored in according to official Ministry of New and Renewable Energy (MNRE) guidelines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
            <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
              <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Up to 2 kW</p>
              <p className="text-stat font-bold text-brand-green mt-0.5">₹30,000 <span className="text-helper font-normal text-light-muted dark:text-dark-muted">/ kW</span></p>
              <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">Maximum ₹60,000</p>
            </div>

            <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
              <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Additional 3rd kW</p>
              <p className="text-stat font-bold text-brand-green mt-0.5">₹18,000 <span className="text-helper font-normal text-light-muted dark:text-dark-muted">/ kW</span></p>
              <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">For capacity between 2–3 kW</p>
            </div>

            <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
              <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Above 3 kW</p>
              <p className="text-stat font-bold text-brand-green mt-0.5">₹78,000 <span className="text-helper font-normal text-light-muted dark:text-dark-muted">Max</span></p>
              <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">Capped total DBT incentive</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 lc-btn-brand text-body font-medium"
        >
          <span>Run Free Sizing Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default HowItWorksPage;
