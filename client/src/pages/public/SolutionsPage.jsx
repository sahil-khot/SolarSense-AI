import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Tractor, Store, Factory, ArrowRight, CheckCircle2 } from 'lucide-react';

const SolutionsPage = () => {
  const solutions = [
    {
      id: 'residential',
      title: 'Residential Rooftop Solar',
      icon: Home,
      tag: 'Homes & Apartments',
      desc: 'Engineered for households experiencing high slab-based electricity bills. Sized to offset lighting, refrigeration, air conditioning, and EV charging.',
      features: [
        'Direct PM Surya Ghar subsidy integration (up to ₹78,000)',
        'Standard 1 kW to 10 kW rooftop configurations',
        'Bi-directional net-metering grid support',
        'Average 3.5 to 4.5 year capital payback',
      ],
      typicalCapacity: '3 – 5 kW',
    },
    {
      id: 'farm',
      title: 'Agricultural & Farm Solar',
      icon: Tractor,
      tag: 'Pumps & Rural Estates',
      desc: 'Designed for farms, dairy setups, and agricultural tubewells facing irregular rural electricity schedules. Solar generation synchronizes naturally with daytime irrigation cycles.',
      features: [
        'Solar irrigation and AC submersible pump sizing',
        'Hybrid off-grid and battery storage configurations',
        'Open ground installation and farm shed mounting',
        'Protection against rural grid power surges and outages',
      ],
      typicalCapacity: '5 – 15 kW',
    },
    {
      id: 'small_business',
      title: 'Small & Retail Commercial',
      icon: Store,
      tag: 'Offices, Bakeries & Retail',
      desc: 'Commercial operations encounter high daytime tariffs (₹9–12/kWh) exactly during peak solar output hours. Direct daytime self-consumption eliminates the need for expensive battery banks.',
      features: [
        'Up to 90% direct daytime solar self-consumption',
        'Commercial tariff slab reduction',
        'Fast 3 to 4 year simple investment payback',
        'High 25-year return on investment (+300-400%)',
      ],
      typicalCapacity: '5 – 25 kW',
    },
    {
      id: 'large_business',
      title: 'Large Commercial & Industrial',
      icon: Factory,
      tag: 'Warehouses & Factories',
      desc: 'High-voltage industrial energy consumers with extensive rooftop or ground acreage. Solar serves as a primary OPEX hedge against utility escalations while satisfying corporate ESG mandates.',
      features: [
        'Accelerated tax depreciation benefit (40%)',
        'Bulk economies of scale (₹45,000 to ₹48,000/kW)',
        'Massive annual Scope 2 carbon footprint reductions',
        'Multi-megawatt rooftop and ground-mounted options',
      ],
      typicalCapacity: '50 – 500+ kW',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-label font-medium uppercase tracking-wider text-brand-green px-2.5 py-1 rounded-btn bg-brand-green/10 border border-brand-green/20">
          Targeted Consumer Profiles
        </span>
        <h1 className="text-page-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-2.5">
          Tailored Solar Architecture for Every Consumer
        </h1>
        <p className="text-helper text-light-muted dark:text-dark-muted mt-2 leading-relaxed">
          One size does not fit all in renewable energy. Explore how SolarSense customizes calculations for your specific usage profile and tariff structure.
        </p>
      </div>

      {/* Solutions Cards */}
      <div className="space-y-4">
        {solutions.map((sol) => {
          const Icon = sol.icon;
          return (
            <div
              key={sol.id}
              className="lc-card p-5 sm:p-6 hover:border-brand-green/40 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-btn bg-brand-green/10 text-brand-green flex items-center justify-center border border-brand-green/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-label font-medium uppercase tracking-wider text-brand-green px-2 py-0.5 rounded-btn bg-brand-green/10 border border-brand-green/20">
                      {sol.tag}
                    </span>
                    <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text mt-0.5">{sol.title}</h3>
                  </div>
                </div>

                <p className="text-helper text-light-muted dark:text-dark-muted leading-relaxed">{sol.desc}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {sol.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-body text-light-text dark:text-dark-text">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                      <span className="text-helper">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 lc-surface rounded-card p-5 border border-light-border dark:border-dark-border flex flex-col justify-between">
                <div>
                  <p className="text-label font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">
                    Typical System Sizing
                  </p>
                  <p className="text-stat font-bold text-light-text dark:text-dark-text mt-0.5">{sol.typicalCapacity}</p>
                  <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
                    Calculated using standard regional irradiance and load hours.
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    to="/onboarding"
                    className="w-full lc-btn-brand text-body font-medium flex items-center justify-center gap-2"
                  >
                    <span>Assess {sol.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolutionsPage;
