import React from 'react';
import { Leaf, Trees, Wind, Sparkles } from 'lucide-react';
import { formatNumber, formatKWh } from '../../utils/formatters';

const EnvironmentalImpactCard = ({ co2AvoidedKg = 0, treesPlanted = 0, cleanEnergyKWh = 0 }) => {
  return (
    <div className="bg-white border border-[#D1D5DB] shadow-sm rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#D1D5DB] gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D] shrink-0 shadow-xs">
            <Leaf className="w-7 h-7 text-[#16A34A]" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
              Environmental Impact Projection
            </h3>
            <p className="text-base text-[#374151] mt-0.5 font-normal">
              Estimated annual carbon offset (CEA National Grid Emission Factor: 0.82 kg CO₂/kWh)
            </p>
          </div>
        </div>
        <span className="text-sm font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] self-start sm:self-auto">
          Green Yield
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-[#374151]">
              CO₂ Emissions Avoided
            </span>
            <Wind className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            {formatNumber(co2AvoidedKg)}{' '}
            <span className="text-lg font-bold text-[#374151]">kg/yr</span>
          </div>
          <p className="text-sm font-semibold text-[#4B5563] mt-2">
            Displaces coal thermal grid generation
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-[#374151]">
              Equivalent Trees
            </span>
            <Trees className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#15803D] tracking-tight">
            {formatNumber(treesPlanted)}{' '}
            <span className="text-lg font-bold text-[#374151]">trees</span>
          </div>
          <p className="text-sm font-semibold text-[#4B5563] mt-2">
            ~22 kg CO₂ absorption per mature tree/year
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-[#374151]">
              Clean Energy Generated
            </span>
            <Sparkles className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            {formatKWh(cleanEnergyKWh)}
          </div>
          <p className="text-sm font-semibold text-[#4B5563] mt-2">
            Zero-emission rooftop solar electricity
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#D1D5DB] text-xs font-semibold text-[#6B7280] text-right">
        * Estimated metrics; indicative calculations for environmental sustainability and carbon footprint reporting.
      </div>
    </div>
  );
};

export default EnvironmentalImpactCard;
