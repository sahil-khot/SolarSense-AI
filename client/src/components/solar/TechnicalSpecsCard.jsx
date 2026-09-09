import React, { useState } from 'react';
import { Cpu, Layers, Maximize, BatteryCharging, HelpCircle } from 'lucide-react';
import { formatKW } from '../../utils/formatters';

const TechnicalSpecsCard = ({ assessment }) => {
  const [showExplainer, setShowExplainer] = useState(false);

  if (!assessment) return null;

  const specs = [
    {
      label: 'Recommended PV Capacity',
      value: formatKW(assessment.recommendedCapacity),
      icon: Cpu,
      note: 'Optimal DC peak capacity',
    },
    {
      label: 'Solar Module Count',
      value: `${assessment.panelCount} Modules`,
      icon: Layers,
      note: `${assessment.panelWattage || 540}W Mono PERC Bifacial`,
    },
    {
      label: 'Inverter Rating',
      value: `${assessment.inverterCapacity} kW AC`,
      icon: Cpu,
      note: 'Grid-tied string inverter',
    },
    {
      label: 'Roof Area Required',
      value: `${assessment.areaRequiredSqFt} sq.ft`,
      icon: Maximize,
      note: `Out of ${assessment.roofArea} sq.ft available`,
    },
    {
      label: 'Grid Connection',
      value: assessment.gridPreference === 'hybrid' ? 'Hybrid (Battery Ready)' : 'On-Grid Net Metering',
      icon: BatteryCharging,
      note: assessment.batteryRequirement ? 'Battery storage included' : 'Bi-directional net metering',
    },
  ];

  return (
    <div className="bg-white border border-[#D1D5DB] shadow-sm rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#D1D5DB] gap-3">
        <div>
          <h3 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            System Technical Specifications
          </h3>
          <p className="text-base text-[#374151] mt-0.5 font-normal">
            Engineered hardware sizing based on MNRE guidelines & IEEE grid interconnection standards
          </p>
        </div>
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="flex items-center gap-2 text-sm font-bold text-[#15803D] hover:text-[#16A34A] bg-[#DCFCE7] border border-[#86EFAC] px-4 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-[#16A34A]" />
          <span>{showExplainer ? 'Hide Guide' : 'What do these mean?'}</span>
        </button>
      </div>

      {/* Explainer Drawer */}
      {showExplainer && (
        <div className="mb-6 p-5 rounded-2xl bg-[#F8FAFC] text-sm sm:text-base text-[#374151] space-y-2.5 border border-[#D1D5DB]">
          <p>
            <strong className="font-bold text-[#111827]">Peak Sun Hours ({assessment.assumptions?.peakSunHours || 4.8} hrs):</strong> The daily equivalent hours during which sunlight intensity equals 1,000 Watts per square meter.
          </p>
          <p>
            <strong className="font-bold text-[#111827]">Performance Ratio ({assessment.assumptions?.performanceRatio || 0.78}):</strong> Represents the real-world efficiency of the PV system after accounting for inverter thermal loss, wiring resistance, dust, and temperature de-rating.
          </p>
          <p>
            <strong className="font-bold text-[#111827]">540W Mono PERC Panels:</strong> High-efficiency monocrystalline solar modules with passivated emitter rear cell technology, yielding higher power output per square foot.
          </p>
        </div>
      )}

      {/* Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {specs.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-[#D1D5DB] shadow-xs flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D] shrink-0">
                <Icon className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#6B7280] uppercase tracking-wider">{item.label}</p>
                <p className="text-xl sm:text-2xl font-extrabold text-[#111827] truncate mt-1">{item.value}</p>
                <p className="text-sm font-medium text-[#4B5563] truncate mt-1">{item.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechnicalSpecsCard;
