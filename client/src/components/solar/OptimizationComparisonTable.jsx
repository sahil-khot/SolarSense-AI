import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency, formatKWh } from '../../utils/formatters';

const OptimizationComparisonTable = ({ options = [], recommendedCapacity }) => {
  if (!options || !options.length) {
    return (
      <div className="text-center py-8 text-sm text-light-muted">
        No comparative system matrix available. Run an assessment to generate comparison tiers.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-light-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-light-border text-xs font-bold uppercase tracking-wider text-light-muted bg-light-surface">
            <th className="py-3.5 px-4">System Tier</th>
            <th className="py-3.5 px-3">Panels (540W)</th>
            <th className="py-3.5 px-3">Area Needed</th>
            <th className="py-3.5 px-3">Annual Gen</th>
            <th className="py-3.5 px-3">Gross Cost</th>
            <th className="py-3.5 px-3 text-brand">Subsidy</th>
            <th className="py-3.5 px-3">Net Cost</th>
            <th className="py-3.5 px-3 text-brand">Annual Savings</th>
            <th className="py-3.5 px-3">Payback</th>
            <th className="py-3.5 px-3">25-Yr ROI</th>
            <th className="py-3.5 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border text-sm text-light-text font-normal">
          {options.map((opt) => {
            const isRec = opt.capacityKW === recommendedCapacity || opt.isRecommended;

            return (
              <tr
                key={opt.capacityKW}
                className={`transition-colors ${
                  isRec
                    ? 'bg-brand/10 font-semibold border-l-4 border-l-brand'
                    : 'hover:bg-light-surface'
                }`}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-light-text">{opt.capacityKW} kW</span>
                    {isRec && (
                      <span className="flex items-center gap-1 text-[11px] bg-brand text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        Optimal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-light-muted font-normal mt-0.5">{opt.tierLabel}</p>
                </td>
                <td className="py-3.5 px-3">{opt.panelCount} Panels</td>
                <td className="py-3.5 px-3">{opt.areaRequiredSqFt} sq.ft</td>
                <td className="py-3.5 px-3">{formatKWh(opt.annualGeneration)}</td>
                <td className="py-3.5 px-3 text-light-muted line-through text-xs">
                  {formatCurrency(opt.systemCost)}
                </td>
                <td className="py-3.5 px-3 text-brand font-semibold">
                  {opt.subsidy > 0 ? formatCurrency(opt.subsidy) : '₹0'}
                </td>
                <td className="py-3.5 px-3 font-bold text-light-text">
                  {formatCurrency(opt.netCost)}
                </td>
                <td className="py-3.5 px-3 text-brand font-bold">
                  {formatCurrency(opt.annualSavings)}/yr
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-btn text-xs bg-light-surface border border-light-border font-semibold text-light-text">
                    {opt.paybackPeriod} yrs
                  </span>
                </td>
                <td className="py-3.5 px-3 text-brand font-bold">
                  +{opt.roi}%
                </td>
                <td className="py-3.5 px-4 text-right">
                  {isRec ? (
                    <span className="inline-flex items-center gap-1 text-brand text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Recommended
                    </span>
                  ) : (
                    <span className="text-light-muted text-xs">Alternative</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OptimizationComparisonTable;
