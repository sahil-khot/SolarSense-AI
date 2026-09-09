import React from 'react';
import { TrendingUp, Trees, Leaf, Globe2, Zap, ArrowRight } from 'lucide-react';
import { formatCurrency, formatNumber, formatKWh } from '../../utils/formatters';

const PredictionTimelineCard = ({ assessment }) => {
  if (!assessment) return null;

  const annualSavings =
    assessment.annualSavings ||
    (assessment.monthlySavings ? assessment.monthlySavings * 12 : 9600);
  const annualGen = assessment.estimatedGeneration || Math.round(assessment.recommendedCapacity * 1450);
  const annualCo2 = assessment.co2AvoidedKg || Math.round(annualGen * 0.82);
  const annualTrees = assessment.treesPlanted || Math.max(1, Math.round(annualCo2 / 22));

  // Dynamic Multi-Year Projections (accounting for standard 4% DISCOM grid tariff inflation)
  // Year 1: base annual savings
  const yr1Savings = annualSavings;
  const yr1Co2 = annualCo2;
  const yr1Trees = annualTrees;
  const yr1Energy = annualGen;

  // Year 5: cumulative 5 years with modest 4% tariff inflation factor (~5.41x)
  const yr5Savings = Math.round(annualSavings * 5.4);
  const yr5Co2 = annualCo2 * 5;
  const yr5Trees = annualTrees * 5;
  const yr5Energy = annualGen * 5;

  // Year 10: cumulative 10 years with tariff inflation factor (~12.0x)
  const yr10Savings = Math.round(annualSavings * 12.0);
  const yr10Co2 = annualCo2 * 10;
  const yr10Trees = annualTrees * 10;
  const yr10Energy = annualGen * 10;

  return (
    <div className="bg-white border border-[#D1D5DB] shadow-sm rounded-2xl p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#D1D5DB] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3.5 py-1 rounded-lg text-sm font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              SOLAR SAVINGS & IMPACT PREDICTION
            </span>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            Financial & Environmental Forecast
          </h3>
          <p className="text-base sm:text-[17px] text-[#374151] mt-1 font-normal">
            Projected cumulative returns and carbon offset from your {assessment.recommendedCapacity} kW solar system.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] block">Forecast Model</span>
          <span className="text-sm font-bold text-[#111827]">Based on your actual consumption data</span>
        </div>
      </div>

      {/* Visual 3-Milestone Prediction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Milestone 1: AFTER 1 YEAR */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#D1D5DB] shadow-xs flex flex-col justify-between hover:border-[#16A34A] transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                AFTER 1 YEAR
              </span>
              <TrendingUp className="w-5 h-5 text-[#16A34A]" />
            </div>

            <div className="mb-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                {formatCurrency(yr1Savings)}+
              </p>
              <p className="text-base font-bold text-[#15803D] mt-1">
                Estimated electricity savings
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#D1D5DB]">
              <div className="flex items-start gap-2.5 text-base font-medium text-[#111827]">
                <Trees className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  <strong>~{formatNumber(yr1Trees)} trees</strong> equivalent CO₂ absorption
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[#374151]">
                <Leaf className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{formatNumber(yr1Co2)} kg CO₂ avoided from grid</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[#374151]">
                <Zap className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{formatKWh(yr1Energy)} clean electricity generated</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#E5E7EB] text-xs font-semibold text-[#6B7280]">
            Immediate 1st-year tariff reduction
          </div>
        </div>

        {/* Milestone 2: AFTER 5 YEARS */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#D1D5DB] shadow-xs flex flex-col justify-between hover:border-[#16A34A] transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                AFTER 5 YEARS
              </span>
              <TrendingUp className="w-5 h-5 text-[#16A34A]" />
            </div>

            <div className="mb-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                {formatCurrency(yr5Savings)}+
              </p>
              <p className="text-base font-bold text-[#15803D] mt-1">
                Estimated cumulative savings
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#D1D5DB]">
              <div className="flex items-start gap-2.5 text-base font-medium text-[#111827]">
                <Trees className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  <strong>~{formatNumber(yr5Trees)} trees</strong> equivalent CO₂ absorption
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[#374151]">
                <Leaf className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{formatNumber(yr5Co2)} kg cumulative CO₂ reduction</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[#374151]">
                <Zap className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{formatKWh(yr5Energy)} clean electricity generated</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#E5E7EB] text-xs font-semibold text-[#15803D]">
            System pays for itself (~{assessment.paybackPeriod || 3.1} yrs)
          </div>
        </div>

        {/* Milestone 3: AFTER 10 YEARS */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#D1D5DB] shadow-xs flex flex-col justify-between hover:border-[#16A34A] transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                AFTER 10 YEARS
              </span>
              <Globe2 className="w-5 h-5 text-[#16A34A]" />
            </div>

            <div className="mb-4">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
                {formatCurrency(yr10Savings)}+
              </p>
              <p className="text-base font-bold text-[#15803D] mt-1">
                Estimated cumulative savings
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[#D1D5DB]">
              <div className="flex items-start gap-2.5 text-base font-medium text-[#111827]">
                <Trees className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>
                  <strong>~{formatNumber(yr10Trees)} trees</strong> equivalent CO₂ absorption
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[#374151]">
                <Leaf className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{formatNumber(yr10Co2)} kg long-term CO₂ reduction</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-[#374151]">
                <Zap className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{formatKWh(yr10Energy)} clean electricity generated</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#E5E7EB] text-xs font-semibold text-[#15803D]">
            Pure compounding profit post-payback
          </div>
        </div>
      </div>

      <p className="text-xs text-[#6B7280] mt-5 text-right font-medium">
        * Projections incorporate dynamic solar generation ({assessment.recommendedCapacity} kW system) and typical 4% annual DISCOM tariff escalation.
      </p>
    </div>
  );
};

export default PredictionTimelineCard;
