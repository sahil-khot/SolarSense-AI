import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Minus,
  Plus,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  simulateSolarCapacity,
  generateSimulatorInsight,
} from '../../utils/solarSimulatorEngine';
import {
  formatCurrency,
  formatLakh,
  formatKW,
  formatKWh,
  formatNumber,
} from '../../utils/formatters';

const PRESET_CAPACITIES = [1, 2, 3, 5, 7, 10];

const WhatIfSolarSimulator = ({
  recommendedCapacity = 0,
  monthlyConsumption = 0,
  monthlyBill = 0,
  tariff = null,
  userType = 'residential',
  hasData = true,
  costPerKW = 60000,
  roofArea = 1000,
}) => {
  // Canonical recommended capacity (falls back to 1.0 kW if not set)
  const canonicalRecommended = recommendedCapacity > 0 ? recommendedCapacity : 1.0;

  // Selected capacity state
  const [selectedCapacity, setSelectedCapacity] = useState(() => canonicalRecommended);
  const [showDetails, setShowDetails] = useState(false);

  // Sync if recommended capacity updates from server
  React.useEffect(() => {
    if (recommendedCapacity > 0) {
      setSelectedCapacity(recommendedCapacity);
    }
  }, [recommendedCapacity]);

  const minCap = 1.0;
  const maxCap = Math.max(10.0, Math.ceil(canonicalRecommended * 1.5));
  const step = 0.5;

  // Perform live simulation calculations using authentic engine
  const simulated = useMemo(() => {
    return simulateSolarCapacity({
      capacityKW: selectedCapacity,
      recommendedCapacity: canonicalRecommended,
      monthlyConsumption: monthlyConsumption || (hasData ? 0 : 250), // 250 kWh baseline for preview if no data
      monthlyBill: monthlyBill || (hasData ? 0 : 2100),
      tariff,
      userType,
      costPerKW,
    });
  }, [selectedCapacity, canonicalRecommended, monthlyConsumption, monthlyBill, tariff, userType, costPerKW, hasData]);

  const recommendedSim = useMemo(() => {
    return simulateSolarCapacity({
      capacityKW: canonicalRecommended,
      recommendedCapacity: canonicalRecommended,
      monthlyConsumption: monthlyConsumption || (hasData ? 0 : 250),
      monthlyBill: monthlyBill || (hasData ? 0 : 2100),
      tariff,
      userType,
      costPerKW,
    });
  }, [canonicalRecommended, monthlyConsumption, monthlyBill, tariff, userType, costPerKW, hasData]);

  const insight = useMemo(() => {
    return generateSimulatorInsight(simulated, recommendedSim);
  }, [simulated, recommendedSim]);

  const isRecommendedSelected = Math.abs(selectedCapacity - canonicalRecommended) < 0.05;

  // Step adjustments
  const handleDecrement = () => {
    setSelectedCapacity((prev) => Math.max(minCap, Math.round((prev - step) * 10) / 10));
  };

  const handleIncrement = () => {
    setSelectedCapacity((prev) => Math.min(maxCap, Math.round((prev + step) * 10) / 10));
  };

  const handleReset = () => {
    setSelectedCapacity(canonicalRecommended);
  };

  // Friendly dynamic microcopy
  const microcopy = useMemo(() => {
    if (isRecommendedSelected) {
      return 'Current sweet spot — try another size to compare trade-offs.';
    }
    if (selectedCapacity === 3) {
      return "Nice — here's what changes with 3.0 kW, a popular residential upgrade.";
    }
    if (selectedCapacity === 5) {
      return 'Curious about 5.0 kW? Generates abundant surplus clean energy.';
    }
    if (selectedCapacity === 10) {
      return 'Testing high 10.0 kW capacity — best for large homes with EV charging.';
    }
    if (selectedCapacity > canonicalRecommended) {
      return `See what changes — upgrading to ${selectedCapacity} kW increases solar generation.`;
    }
    return `Testing ${selectedCapacity} kW — lower upfront cost with reduced bill coverage.`;
  }, [selectedCapacity, isRecommendedSelected, canonicalRecommended]);

  // Plain-language difference explanation generated from real calculation variances
  const plainExplanation = useMemo(() => {
    const diffGen = simulated.annualGeneration - recommendedSim.annualGeneration;
    const diffCost = simulated.netCost - recommendedSim.netCost;
    const diffSavings = simulated.annualSavings - recommendedSim.annualSavings;
    const diffArea = simulated.areaRequiredSqFt - recommendedSim.areaRequiredSqFt;

    if (isRecommendedSelected) {
      return `This ${canonicalRecommended} kW system is your balanced recommendation. It maximizes PM Surya Ghar subsidy efficiency and best matches your electricity usage without unnecessary capital tie-up.`;
    }

    if (selectedCapacity > canonicalRecommended) {
      return `${selectedCapacity} kW could generate ${diffGen > 0 ? diffGen.toLocaleString('en-IN') + ' kWh more electricity' : 'extra clean units'} and increase your potential savings by ${formatCurrency(diffSavings)}/year, but it also requires a ${formatCurrency(Math.abs(diffCost))} higher upfront investment and ~${diffArea} sq.ft more roof space.`;
    }

    return `${selectedCapacity} kW requires ${formatCurrency(Math.abs(diffCost))} less upfront investment, but it generates ${Math.abs(diffGen).toLocaleString('en-IN')} kWh less per year and only offsets ~${simulated.billReductionPercent}% of your electricity, leaving higher recurring DISCOM charges.`;
  }, [selectedCapacity, canonicalRecommended, isRecommendedSelected, simulated, recommendedSim]);

  return (
    <section className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-7">
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Explore Your Solar Options
            </span>
            <span className="text-xs font-semibold text-slate-500">
              What-If Solar Simulator
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What if you choose a different solar size?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Try different system sizes and instantly see how your cost, savings and payback change.
          </p>
        </div>

        {/* Current Recommendation Anchor */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Recommended for you
            </span>
            <span className="text-lg font-extrabold text-emerald-700">
              {formatKW(canonicalRecommended)}
            </span>
          </div>

          {!isRecommendedSelected && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to recommended size"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Capacity Control (Slider + Presets + Microcopy) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Selected System
            </span>
            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-emerald-700">
                {selectedCapacity.toFixed(1)} kW
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                {isRecommendedSelected ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 inline" /> Recommended Size
                  </span>
                ) : (
                  'What-If Choice'
                )}
              </span>
            </div>
          </div>

          {/* Stepper Buttons for Touch & Mobile */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={selectedCapacity <= minCap}
              aria-label="Decrease system size"
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 font-bold transition-all shadow-xs cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-xs sm:text-sm font-bold text-slate-700 px-2 select-none min-w-[60px] text-center">
              ± 0.5 kW
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={selectedCapacity >= maxCap}
              aria-label="Increase system size"
              className="w-10 h-10 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Large Horizontal Range Slider */}
        <div className="space-y-2 pt-1">
          <div className="relative flex items-center">
            <input
              type="range"
              min={minCap}
              max={maxCap}
              step={step}
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(parseFloat(e.target.value))}
              aria-label="Solar System Capacity Slider"
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
          </div>

          {/* Scale Labels & Recommended Pin */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1 pt-1">
            <span>{minCap} kW</span>
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold">
              <span>↑ Recommended: {canonicalRecommended} kW</span>
            </div>
            <span>{maxCap} kW</span>
          </div>
        </div>

        {/* Quick Presets & Live Microcopy */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Presets:</span>
            {PRESET_CAPACITIES.filter((kw) => kw <= maxCap).map((kw) => {
              const isCurrent = Math.abs(selectedCapacity - kw) < 0.05;
              const isRec = Math.abs(canonicalRecommended - kw) < 0.05;
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setSelectedCapacity(kw)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {kw} kW {isRec && <span className="opacity-90">★</span>}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-emerald-800 bg-emerald-50/80 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{microcopy}</span>
          </p>
        </div>
      </div>

      {/* 3. Live Results Summary Area */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {selectedCapacity.toFixed(1)} kW Solar System
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {hasData ? (
              <span className="text-emerald-700 font-semibold">Calculated from your profile ({monthlyConsumption > 0 ? `${monthlyConsumption} kWh/mo` : 'declared'})</span>
            ) : (
              <span className="text-slate-500">Estimated (typical home baseline)</span>
            )}
          </span>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Annual generation */}
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Annual Generation
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {simulated.annualGeneration > 0 ? `${simulated.annualGeneration.toLocaleString('en-IN')} kWh` : 'Not available'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              ~{simulated.dailyGeneration} kWh / day
            </p>
          </div>

          {/* 2. Estimated investment */}
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Estimated Investment
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {simulated.netCost > 0 ? formatLakh(simulated.netCost) : 'Not available'}
            </p>
            <p className="text-xs text-emerald-700 font-semibold">
              After ₹{simulated.subsidy.toLocaleString('en-IN')} subsidy
            </p>
          </div>

          {/* 3. Annual savings */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
              Annual Savings
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700">
              {simulated.annualSavings > 0 ? formatCurrency(simulated.annualSavings) : 'Not available'}
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              ~{formatCurrency(simulated.monthlySavings)} / month
            </p>
          </div>

          {/* 4. Payback */}
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Payback
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {simulated.paybackPeriod > 0 ? `${simulated.paybackPeriod} years` : 'Not available'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Break-even horizon
            </p>
          </div>

          {/* 5. Bill reduction */}
          <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Bill Reduction
            </span>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {simulated.billReductionPercent > 0 ? `~${simulated.billReductionPercent}%` : 'Not available'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Electricity offset
            </p>
          </div>
        </div>
      </div>

      {/* 4. Recommended vs What-If Comparison */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Comparison
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {isRecommendedSelected ? 'Matching Recommendation' : 'What-If Comparison'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            Side-by-side trade-off
          </span>
        </div>

        {/* Clean Side-by-Side Cards/Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Your Recommendation */}
          <div className={`p-4 rounded-xl bg-white border transition-all ${
            isRecommendedSelected ? 'border-emerald-400 ring-1 ring-emerald-400/20' : 'border-slate-300'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Your Recommendation
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              {formatKW(canonicalRecommended)}
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              <div className="flex justify-between">
                <span>Net Investment:</span>
                <span className="font-semibold text-slate-900">{formatLakh(recommendedSim.netCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Savings:</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(recommendedSim.annualSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payback:</span>
                <span className="font-semibold text-slate-900">{recommendedSim.paybackPeriod} years</span>
              </div>
              <div className="flex justify-between">
                <span>Generation:</span>
                <span className="font-semibold text-slate-900">{recommendedSim.annualGeneration.toLocaleString('en-IN')} kWh/yr</span>
              </div>
            </div>
          </div>

          {/* Card B: What-If Option */}
          <div className={`p-4 rounded-xl bg-white border transition-all ${
            !isRecommendedSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-300'
          }`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              What-If Option
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              {formatKW(selectedCapacity)}
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
              <div className="flex justify-between">
                <span>Net Investment:</span>
                <span className="font-semibold text-slate-900">{formatLakh(simulated.netCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Savings:</span>
                <span className="font-semibold text-emerald-700">{formatCurrency(simulated.annualSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payback:</span>
                <span className="font-semibold text-slate-900">{simulated.paybackPeriod} years</span>
              </div>
              <div className="flex justify-between">
                <span>Generation:</span>
                <span className="font-semibold text-slate-900">{simulated.annualGeneration.toLocaleString('en-IN')} kWh/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plain Language Explanation Box */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {plainExplanation}
          </p>
        </div>
      </div>

      {/* 5. Progressive Disclosure: "View more details" */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>{showDetails ? 'Hide technical & financial details' : 'View more details (roof area, panel count, subsidy, 25-yr impact)'}</span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">Roof Space</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">~{simulated.areaRequiredSqFt} sq.ft</span>
                <span className="text-[11px] text-slate-400">@ 90 sq.ft/kW</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">Panels</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{simulated.panelCount} units</span>
                <span className="text-[11px] text-slate-400">540W Mono PERC</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">Inverter Rating</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{simulated.inverterCapacity} kW</span>
                <span className="text-[11px] text-slate-400">Grid-tied</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">DBT Subsidy</span>
                <span className="text-base font-bold text-emerald-700 block mt-0.5">₹{simulated.subsidy.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-emerald-600">PM Surya Ghar</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">25-Yr Net Savings</span>
                <span className="text-base font-bold text-emerald-700 block mt-0.5">{formatLakh(simulated.lifetimeSavings)}</span>
                <span className="text-[11px] text-slate-400">Lifecycle</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold">CO₂ / Trees</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">{simulated.treesPlanted} Trees</span>
                <span className="text-[11px] text-slate-400">{formatNumber(simulated.co2AvoidedKg)} kg/yr</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-normal">
              * Calculated using authentic solar resource data (4.8 peak sun hours, 78% performance ratio, and PM Surya Ghar central subsidy guidelines).
            </p>
          </div>
        )}
      </div>

      {/* 6. Final Simulator Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
          {isRecommendedSelected
            ? 'Currently showing your official recommendation.'
            : `Exploring ${selectedCapacity} kW does not overwrite your saved recommendation.`}
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRecommendedSelected && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-center"
            >
              Keep My Recommendation ({canonicalRecommended} kW)
            </button>
          )}

          <Link
            to="/solar-recommendation"
            state={{ simulatedCapacity: selectedCapacity }}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>{isRecommendedSelected ? 'View Full Analysis' : `View Full ${selectedCapacity} kW Analysis`}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatIfSolarSimulator;
