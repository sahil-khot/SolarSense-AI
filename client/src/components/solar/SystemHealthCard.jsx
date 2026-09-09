import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Cpu, Zap, Battery, Layers, Info } from 'lucide-react';

const SystemHealthCard = () => {
  const [showDetails, setShowDetails] = useState(false);

  const components = [
    {
      name: 'Solar Panels',
      status: 'Healthy',
      detail: 'Standard current yield with zero shading degradation.',
      icon: Layers,
    },
    {
      name: 'Inverter',
      status: 'Online',
      detail: '98.2% conversion efficiency at nominal temperature.',
      icon: Cpu,
    },
    {
      name: 'Battery',
      status: '82% Charged',
      detail: 'Optimal lithium-ion state of charge and cell balance.',
      icon: Battery,
    },
    {
      name: 'Grid Connection',
      status: 'Synchronized',
      detail: 'Stable voltage at 230V; net-metering active.',
      icon: Zap,
    },
  ];

  return (
    <div className="lc-card space-y-4 transition-colors">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-btn bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text tracking-tight">
              Hardware Diagnostics & Health
            </h3>
            <p className="text-helper text-light-muted dark:text-dark-muted">Automated continuous hardware monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-meta font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
            All systems normal
          </span>
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {components.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-meta text-light-muted dark:text-dark-muted font-medium">{c.name}</span>
                <Icon className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-body font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>{c.status}</span>
              </p>
              <p className="text-helper text-light-muted dark:text-dark-muted mt-1 leading-snug">{c.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Concise Helper Footer */}
      <div className="pt-2.5 border-t border-light-border dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-helper">
        <div className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
          <Info className="w-3.5 h-3.5 text-brand shrink-0" />
          <span>No maintenance required. Solar modules and inverter operating at peak health.</span>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-brand hover:underline font-medium cursor-pointer shrink-0"
        >
          {showDetails ? 'Hide details' : 'Diagnostic help'}
        </button>
      </div>

      {showDetails && (
        <div className="p-3 rounded-btn bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-helper text-light-muted dark:text-dark-muted space-y-1.5">
          <p><strong className="text-light-text dark:text-dark-text">Panel cleaning:</strong> Clean modules with water every 30 days to prevent 3–5% dust losses.</p>
          <p><strong className="text-light-text dark:text-dark-text">Grid disconnection:</strong> Standard grid-tied inverters automatically island during grid outages for utility safety.</p>
        </div>
      )}
    </div>
  );
};

export default SystemHealthCard;
