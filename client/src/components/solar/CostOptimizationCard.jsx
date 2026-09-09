import React from 'react';
import { ShieldCheck, ArrowRight, ArrowDown, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CostOptimizationCard = ({ assessment }) => {
  if (!assessment) return null;

  const cap = assessment.recommendedCapacity || 1;
  const grossCost = assessment.estimatedCost || Math.round(cap * 55000);
  const subsidy = assessment.subsidy !== undefined ? assessment.subsidy : (cap >= 3 ? 78000 : (cap >= 2 ? 60000 : 30000));
  const netCost = assessment.netCost || Math.max(0, grossCost - subsidy);
  const annualSavings = assessment.annualSavings || (assessment.monthlySavings ? assessment.monthlySavings * 12 : Math.round(cap * 4.8 * 0.78 * 365 * 7.5));
  const monthlySavings = assessment.monthlySavings || Math.round(annualSavings / 12);
  const payback = assessment.paybackPeriod || (annualSavings > 0 ? Math.round((netCost / annualSavings) * 10) / 10 : 0);
  const subsidyPercent = grossCost > 0 ? Math.round((subsidy / grossCost) * 100) : 0;

  return (
    <div className="bg-white border border-[#D1D5DB] shadow-sm rounded-2xl p-6 sm:p-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#D1D5DB] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3.5 py-1 rounded-lg text-sm font-extrabold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              COST OPTIMIZATION
            </span>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            System Financial Architecture
          </h3>
          <p className="text-base sm:text-[17px] text-[#374151] mt-1 font-normal">
            Direct DBT subsidy incentives and net billing economics calculated for your installation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-[#15803D] bg-[#DCFCE7] px-4 py-2 rounded-xl border border-[#86EFAC]">
          <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          <span>PM Surya Ghar Approved</span>
        </div>
      </div>

      {/* Main Financial KPI Grid (Pure White Cards, 28-36px Numbers, High Contrast) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Gross System Cost */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <p className="text-sm font-bold uppercase tracking-wider text-[#374151]">
            Gross System Cost
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">
            {formatCurrency(grossCost)}
          </p>
          <p className="text-sm font-medium text-[#4B5563] mt-2">
            Turnkey engineering, panels, inverter & wiring
          </p>
        </div>

        {/* Government Subsidy */}
        <div className="p-6 rounded-2xl bg-white border border-[#86EFAC] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#15803D]">
              Government Subsidy
            </p>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              ~{subsidyPercent}% DBT
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#15803D] mt-2 tracking-tight">
            − {formatCurrency(subsidy)}
          </p>
          <p className="text-sm font-medium text-[#4B5563] mt-2">
            PM Surya Ghar Central Financial Assistance
          </p>
        </div>

        {/* Your Net Investment (Hero Value) */}
        <div className="p-6 rounded-2xl bg-[#DCFCE7]/30 border-2 border-[#16A34A] shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[#15803D]">
              Your Net Investment
            </p>
            <Sparkles className="w-5 h-5 text-[#16A34A]" />
          </div>
          <p className="text-3xl sm:text-[38px] font-extrabold text-[#111827] mt-2 tracking-tight">
            {formatCurrency(netCost)}
          </p>
          <p className="text-sm font-bold text-[#15803D] mt-2">
            Your effective out-of-pocket cost
          </p>
        </div>

        {/* Estimated Monthly Savings */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <p className="text-sm font-bold uppercase tracking-wider text-[#374151]">
            Estimated Monthly Savings
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">
            {formatCurrency(monthlySavings)}{' '}
            <span className="text-lg font-bold text-[#374151]">/ mo</span>
          </p>
          <p className="text-sm font-medium text-[#4B5563] mt-2">
            Direct monthly DISCOM bill reduction
          </p>
        </div>

        {/* Estimated Annual Savings */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <p className="text-sm font-bold uppercase tracking-wider text-[#374151]">
            Estimated Annual Savings
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#15803D] mt-2 tracking-tight">
            {formatCurrency(annualSavings)}{' '}
            <span className="text-lg font-bold text-[#374151]">/ year</span>
          </p>
          <p className="text-sm font-medium text-[#4B5563] mt-2">
            Annual electricity expense retained
          </p>
        </div>

        {/* Estimated Payback */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <p className="text-sm font-bold uppercase tracking-wider text-[#374151]">
            Estimated Payback
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-2 tracking-tight">
            ~{payback}{' '}
            <span className="text-xl font-bold text-[#374151]">Years</span>
          </p>
          <p className="text-sm font-bold text-[#15803D] mt-2">
            +{assessment.roi || 320}% 25-yr system ROI
          </p>
        </div>
      </div>

      {/* Visual Step Breakdown / Flowchart (VALUE -> WHAT IT MEANS -> ACTION) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#F8FAFC] border border-[#D1D5DB]">
        <h4 className="text-base sm:text-lg font-extrabold text-[#111827] uppercase tracking-wider mb-5 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#16A34A]" />
          <span>Visual Cost-To-Savings Breakdown:</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Step 1: Gross Cost */}
          <div className="p-5 rounded-2xl bg-white border border-[#D1D5DB] text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              1. Turnkey System Cost
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1.5">
              {formatCurrency(grossCost)}
            </p>
            <p className="text-xs font-semibold text-[#374151] mt-1">
              Benchmark rate
            </p>
          </div>

          {/* Step 2: Subsidy */}
          <div className="p-5 rounded-2xl bg-white border border-[#86EFAC] text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              2. Govt Subsidy (DBT)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#15803D] mt-1.5">
              − {formatCurrency(subsidy)}
            </p>
            <p className="text-xs font-semibold text-[#15803D] mt-1">
              Credited to bank
            </p>
          </div>

          {/* Step 3: Net Investment */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#16A34A] text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              3. Your Investment
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1.5">
              {formatCurrency(netCost)}
            </p>
            <p className="text-xs font-bold text-[#15803D] mt-1">
              Out-of-pocket
            </p>
          </div>

          {/* Step 4: Estimated Savings */}
          <div className="p-5 rounded-2xl bg-white border border-[#86EFAC] text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
              4. Annual Savings
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#15803D] mt-1.5">
              {formatCurrency(annualSavings)}
              <span className="text-sm font-semibold text-[#374151]">/yr</span>
            </p>
            <p className="text-xs font-bold text-[#111827] mt-1">
              ~{payback} yrs payback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizationCard;
