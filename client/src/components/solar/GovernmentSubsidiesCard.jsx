import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Calculator,
  Building2,
  Home,
  Check,
  FileCheck,
} from 'lucide-react';

const GovernmentSubsidiesCard = ({ systemCapacity = 3.5 }) => {
  const [activeTab, setActiveTab] = useState('residential');
  const [calcCapacity, setCalcCapacity] = useState(Math.round(systemCapacity) || 3);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  // PM Surya Ghar calculation logic
  const calculateSubsidy = (kw) => {
    if (kw <= 0) return 0;
    if (kw <= 1) return 30000;
    if (kw <= 2) return 60000;
    return 78000; // Capped at ₹78,000
  };

  const currentSubsidy = calculateSubsidy(calcCapacity);
  const benchmarkCost = calcCapacity * 55000;
  const netUserCost = Math.max(0, benchmarkCost - currentSubsidy);
  const monthlyUnits = Math.round(calcCapacity * 4.8 * 30 * 0.78);

  const applicationSteps = [
    { step: '01', title: 'Portal Registration', desc: 'Register at pmsuryaghar.gov.in with electricity consumer number.' },
    { step: '02', title: 'Technical Feasibility', desc: 'Local DISCOM approves transformer load & rooftop connection.' },
    { step: '03', title: 'Vendor Installation', desc: 'Empanelled vendor installs certified made-in-India DCR panels.' },
    { step: '04', title: 'Net-Meter Inspection', desc: 'DISCOM inspects bi-directional meter and issues certificate.' },
    { step: '05', title: 'Direct DBT Transfer', desc: 'Subsidy is credited straight to your bank account within 30 days.' },
  ];

  return (
    <div className="lc-card space-y-6 p-6 shadow-subtle">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-light-border">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-btn bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[20px] font-bold text-light-text">
                Government Solar Subsidies
              </h3>
              <span className="text-[12.5px] font-semibold px-2.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                PM Surya Ghar
              </span>
            </div>
            <p className="text-[14.5px] text-light-muted mt-0.5">
              Direct Benefit Transfer (DBT) credited directly into your bank account
            </p>
          </div>
        </div>

        <div className="text-[14px] text-light-muted sm:text-right">
          <span>Central Budget: ₹75,021 Cr • </span>
          <span className="text-brand font-semibold">Active 2026</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-light-border text-[15px] no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('residential')}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn transition-colors shrink-0 cursor-pointer font-medium ${
            activeTab === 'residential'
              ? 'bg-brand text-white shadow-subtle font-semibold'
              : 'text-light-muted hover:text-light-text hover:bg-light-surface'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Residential</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ghs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn transition-colors shrink-0 cursor-pointer font-medium ${
            activeTab === 'ghs'
              ? 'bg-brand text-white shadow-subtle font-semibold'
              : 'text-light-muted hover:text-light-text hover:bg-light-surface'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Housing Societies</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kusum')}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn transition-colors shrink-0 cursor-pointer font-medium ${
            activeTab === 'kusum'
              ? 'bg-brand text-white shadow-subtle font-semibold'
              : 'text-light-muted hover:text-light-text hover:bg-light-surface'
          }`}
        >
          <span>Agricultural (PM-KUSUM)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('commercial')}
          className={`flex items-center gap-2 px-4 py-2 rounded-btn transition-colors shrink-0 cursor-pointer font-medium ${
            activeTab === 'commercial'
              ? 'bg-brand text-white shadow-subtle font-semibold'
              : 'text-light-muted hover:text-light-text hover:bg-light-surface'
          }`}
        >
          <span>Commercial & Industrial</span>
        </button>
      </div>

      {/* TAB 1: RESIDENTIAL */}
      {activeTab === 'residential' && (
        <div className="space-y-6">
          <p className="text-[15.5px] text-light-text leading-relaxed">
            Under PM Surya Ghar, eligible homeowners receive fixed DBT subsidies directly to their Aadhaar-linked bank accounts.
          </p>

          {/* Slabs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13px] font-semibold text-light-muted uppercase tracking-wider">Up to 2 kW</span>
              <p className="text-[28px] font-bold text-brand mt-1">₹30,000 <span className="text-[15px] font-normal text-light-muted">/ kW</span></p>
              <p className="text-[15.5px] font-semibold text-light-text mt-1">₹60,000 for 2 kW</p>
              <p className="text-[14px] text-light-muted mt-0.5">For small homes & apartments.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13px] font-semibold text-light-muted uppercase tracking-wider">Above 2 kW up to 3 kW</span>
              <p className="text-[28px] font-bold text-brand mt-1">₹18,000 <span className="text-[15px] font-normal text-light-muted">/ kW</span></p>
              <p className="text-[15.5px] font-semibold text-light-text mt-1">Capacity between 2–3 kW</p>
              <p className="text-[14px] text-light-muted mt-0.5">Adds to the first ₹60,000.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-brand/40 shadow-subtle">
              <span className="text-[13px] font-semibold text-brand uppercase tracking-wider">Above 3 kW</span>
              <p className="text-[28px] font-bold text-light-text mt-1">₹78,000 <span className="text-[15px] font-semibold text-brand">Max</span></p>
              <p className="text-[15.5px] font-semibold text-light-text mt-1">Maximum Central Grant</p>
              <p className="text-[14px] text-light-muted mt-0.5">Capped total DBT support.</p>
            </div>
          </div>

          {/* Interactive Live Sizing & Cost Estimator */}
          <div className="p-5 rounded-card bg-light-surface border border-light-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-brand" />
                <h4 className="text-[17px] font-bold text-light-text">
                  Subsidy & Out-of-Pocket Calculator
                </h4>
              </div>
              <span className="text-[14px] text-light-muted">
                Pick a capacity to view net cost
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setCalcCapacity(kw)}
                  className={`px-4 py-1.5 rounded-btn text-[14.5px] font-semibold transition-colors cursor-pointer ${
                    calcCapacity === kw
                      ? 'bg-brand text-white shadow-subtle'
                      : 'bg-white border border-light-border text-light-muted hover:text-light-text'
                  }`}
                >
                  {kw} kW
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-card bg-white border border-light-border shadow-subtle">
                <p className="text-[14px] font-medium text-light-muted">Gross Cost</p>
                <p className="text-[24px] font-bold text-light-text mt-1">
                  ₹{benchmarkCost.toLocaleString('en-IN')}
                </p>
                <p className="text-[13px] text-light-muted">@ ₹55,000/kW</p>
              </div>

              <div className="p-4 rounded-card bg-white border border-light-border shadow-subtle">
                <p className="text-[14px] font-medium text-brand">DBT Subsidy</p>
                <p className="text-[24px] font-bold text-brand mt-1">
                  -₹{currentSubsidy.toLocaleString('en-IN')}
                </p>
                <p className="text-[13px] text-brand/90 font-medium">Credited to bank</p>
              </div>

              <div className="p-4 rounded-card bg-white border border-light-border shadow-subtle">
                <p className="text-[14px] font-medium text-sky-600">You Pay (Net)</p>
                <p className="text-[24px] font-bold text-sky-600 mt-1">
                  ₹{netUserCost.toLocaleString('en-IN')}
                </p>
                <p className="text-[13px] text-light-muted">Out-of-pocket</p>
              </div>

              <div className="p-4 rounded-card bg-white border border-light-border shadow-subtle">
                <p className="text-[14px] font-medium text-amber-600">Free Energy</p>
                <p className="text-[24px] font-bold text-light-text mt-1">
                  ~{monthlyUnits} <span className="text-[14px] font-normal text-light-muted">kWh/mo</span>
                </p>
                <p className="text-[13px] text-light-muted">Up to 300 free units</p>
              </div>
            </div>
          </div>

          {/* 5-Step Process */}
          <div className="p-5 rounded-card bg-light-surface border border-light-border space-y-4">
            <h4 className="text-[17px] font-bold text-light-text flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand" />
              <span>5-Step Application Process</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {applicationSteps.map((s) => (
                <div key={s.step} className="p-3.5 rounded-card bg-white border border-light-border shadow-subtle">
                  <span className="text-[15px] font-mono font-bold text-brand">
                    {s.step}
                  </span>
                  <h5 className="text-[15.5px] font-semibold text-light-text mt-1">{s.title}</h5>
                  <p className="text-[13.5px] text-light-muted mt-1 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GHS / RWA */}
      {activeTab === 'ghs' && (
        <div className="space-y-4">
          <p className="text-[15.5px] text-light-text leading-relaxed">
            For apartment buildings and resident welfare associations to power common lifts, water pumps, and EV stations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Fixed Subsidy</span>
              <p className="text-[28px] font-bold text-brand mt-1">₹18,000 <span className="text-[15px] font-normal text-light-muted">/ kW</span></p>
              <p className="text-[14px] text-light-muted mt-1">For common meters.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Maximum Size</span>
              <p className="text-[28px] font-bold text-light-text mt-1">500 kW</p>
              <p className="text-[14px] text-light-muted mt-1">Up to ₹90 Lakhs assistance.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Eligible Common Loads</span>
              <p className="text-[24px] font-bold text-light-text mt-1">Lifts, Pumps, EV</p>
              <p className="text-[14px] text-light-muted mt-1">Lowers monthly maintenance fees.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AGRICULTURAL (PM-KUSUM) */}
      {activeTab === 'kusum' && (
        <div className="space-y-4">
          <p className="text-[15.5px] text-light-text leading-relaxed">
            Subsidies for farmers to replace diesel pumps with standalone solar water pumps and grid-connected irrigation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-brand uppercase">Component B: Solar Pumps</span>
              <p className="text-[28px] font-bold text-brand mt-1">60% <span className="text-[15px] font-normal text-light-muted">Subsidy</span></p>
              <p className="text-[14px] text-light-muted mt-1">30% Central + 30% State. Farmer pays only 40%.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Component C: Grid Pumps</span>
              <p className="text-[28px] font-bold text-light-text mt-1">60% Assistance</p>
              <p className="text-[14px] text-light-muted mt-1">Sell surplus energy back to DISCOM.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Pump Sizes</span>
              <p className="text-[28px] font-bold text-light-text mt-1">3 to 10 HP</p>
              <p className="text-[14px] text-light-muted mt-1">Surface & submersible irrigation pumps.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMERCIAL & INDUSTRIAL */}
      {activeTab === 'commercial' && (
        <div className="space-y-4">
          <p className="text-[15.5px] text-light-text leading-relaxed">
            Commercial and industrial properties benefit from accelerated depreciation and daytime commercial tariff offset.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-brand uppercase">Tax Depreciation</span>
              <p className="text-[28px] font-bold text-brand mt-1">40% in Year 1</p>
              <p className="text-[14px] text-light-muted mt-1">Section 32 of Income Tax Act.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Commercial Tariff Offset</span>
              <p className="text-[28px] font-bold text-light-text mt-1">₹9 – 13 / kWh</p>
              <p className="text-[14px] text-light-muted mt-1">Offsets highest grid rate tier.</p>
            </div>

            <div className="p-5 rounded-card bg-light-surface border border-light-border">
              <span className="text-[13.5px] font-semibold text-light-muted uppercase">Average Payback</span>
              <p className="text-[28px] font-bold text-light-text mt-1">~3.2 Years</p>
              <p className="text-[14px] text-light-muted mt-1">Fast return on investment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Document Checklist */}
      <div className="p-4 rounded-card bg-light-surface border border-light-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[14.5px]">
        <div className="flex items-center gap-2.5 text-light-text">
          <FileCheck className="w-5 h-5 text-brand shrink-0" />
          <span>Requirements: Residential meter in applicant's name • ALMM-certified Indian DCR panels • Empanelled vendor</span>
        </div>
        <a
          href="https://pmsuryaghar.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-brand font-semibold hover:underline shrink-0"
        >
          <span>pmsuryaghar.gov.in</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 pt-4 border-t border-light-border">
        {eligibilityChecked ? (
          <div className="flex items-center gap-2.5 text-[16px] font-semibold text-brand">
            <Check className="w-5 h-5 text-brand" />
            <span>Eligible for PM Surya Ghar subsidy (up to ₹78,000).</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEligibilityChecked(true)}
            className="lc-btn-brand text-[15.5px] py-2.5 px-5 font-medium"
          >
            Check My Eligibility
          </button>
        )}

        <a
          href="https://pmsuryaghar.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="lc-btn-secondary text-[15.5px] py-2.5 px-5 font-medium"
        >
          <span>Official National Portal</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default GovernmentSubsidiesCard;
