import React, { useState, useEffect } from 'react';
import { Sun, Home, BatteryCharging, Zap, RefreshCw, Sparkles } from 'lucide-react';

const EnergyFlowCard = ({ recommendedCapacity = 3.5 }) => {
  const [telemetry, setTelemetry] = useState({
    solarOutputKW: Math.round(recommendedCapacity * 0.85 * 10) / 10,
    homeConsumptionKW: Math.round(recommendedCapacity * 0.45 * 10) / 10,
    batteryPercent: 82,
    batteryChargingRateKW: 0.8,
    gridExportKW: Math.round((recommendedCapacity * 0.85 - recommendedCapacity * 0.45 - 0.8) * 10) / 10,
    isExporting: true,
  });

  const [lastUpdated, setLastUpdated] = useState('Live');

  useEffect(() => {
    const interval = setInterval(() => {
      const variation = (Math.random() - 0.5) * 0.2;
      const baseSolar = Math.round(recommendedCapacity * 0.85 * 10) / 10;
      const newSolar = Math.max(0.5, Math.round((baseSolar + variation) * 10) / 10);
      const newHome = Math.max(0.4, Math.round((recommendedCapacity * 0.45 + variation * 0.5) * 10) / 10);
      const netSurplus = Math.round((newSolar - newHome - 0.8) * 10) / 10;

      setTelemetry({
        solarOutputKW: newSolar,
        homeConsumptionKW: newHome,
        batteryPercent: 82,
        batteryChargingRateKW: 0.8,
        gridExportKW: netSurplus > 0 ? netSurplus : 0,
        isExporting: netSurplus > 0,
      });
      setLastUpdated('Updated');
    }, 6000);

    return () => clearInterval(interval);
  }, [recommendedCapacity]);

  return (
    <div className="lc-card space-y-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text tracking-tight">
              Energy Generation & Usage Flow
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-btn bg-brand/10 text-brand text-meta font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
            Real-time power generation distribution across home, storage, and utility grid
          </p>
        </div>

        <div className="text-meta text-light-muted dark:text-dark-muted flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-brand" />
          <span>{lastUpdated}</span>
        </div>
      </div>

      {/* 4 Energy Nodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center text-center">
        {/* Node 1: Solar */}
        <div className="p-3.5 rounded-btn bg-light-surface dark:bg-dark-surface border border-brand/40 flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-btn bg-brand/10 text-brand flex items-center justify-center mb-2">
            <Sun className="w-5 h-5" />
          </div>
          <p className="text-meta font-medium text-light-muted dark:text-dark-muted">Solar Output</p>
          <p className="text-stat text-brand mt-0.5">{telemetry.solarOutputKW} kW</p>
          <p className="text-helper font-normal text-light-muted dark:text-dark-muted mt-0.5">Rooftop array</p>
        </div>

        {/* Node 2: Home */}
        <div className="p-3.5 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-btn bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2">
            <Home className="w-5 h-5" />
          </div>
          <p className="text-meta font-medium text-light-muted dark:text-dark-muted">Home Load</p>
          <p className="text-stat text-light-text dark:text-dark-text mt-0.5">{telemetry.homeConsumptionKW} kW</p>
          <p className="text-helper font-normal text-brand font-medium mt-0.5">100% solar powered</p>
        </div>

        {/* Node 3: Battery */}
        <div className="p-3.5 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-btn bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <p className="text-meta font-medium text-light-muted dark:text-dark-muted">Battery Bank</p>
          <p className="text-stat text-light-text dark:text-dark-text mt-0.5">{telemetry.batteryPercent}%</p>
          <p className="text-helper font-normal text-light-muted dark:text-dark-muted mt-0.5">+{telemetry.batteryChargingRateKW} kW charging</p>
        </div>

        {/* Node 4: Grid */}
        <div className="p-3.5 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-btn bg-brand/10 text-brand flex items-center justify-center mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-meta font-medium text-light-muted dark:text-dark-muted">Grid Export</p>
          <p className="text-stat text-brand mt-0.5">+{telemetry.gridExportKW} kW</p>
          <p className="text-helper font-normal text-brand font-medium mt-0.5">Net-metering credit</p>
        </div>
      </div>

      {/* Concise Summary Note */}
      <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-helper text-light-muted dark:text-dark-muted flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-brand shrink-0" />
        <p>
          <strong className="text-light-text dark:text-dark-text font-semibold">Summary: </strong>
          Solar generation powers current household load, charges the battery, and exports surplus <span className="text-brand font-medium">{telemetry.gridExportKW} kW</span> to the grid.
        </p>
      </div>
    </div>
  );
};

export default EnergyFlowCard;
