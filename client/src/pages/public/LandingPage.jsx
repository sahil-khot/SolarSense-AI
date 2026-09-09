import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Home,
  Tractor,
  Store,
  Factory,
  CheckCircle2,
} from 'lucide-react';
import { solarService } from '../../services/solarService';
import { formatCurrency, formatKW, formatKWh } from '../../utils/formatters';

const LandingPage = () => {
  // Quick Teaser Calculator state
  const [calcUnits, setCalcUnits] = useState(350);
  const [calcType, setCalcType] = useState('residential');
  const [quickResult, setQuickResult] = useState(null);

  const runQuickCalc = async (units, type) => {
    try {
      const res = await solarService.quickEstimate({
        monthlyConsumption: Number(units),
        userType: type,
        roofArea: 800,
      });
      if (res.success) {
        setQuickResult(res.metrics);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runQuickCalc(calcUnits, calcType);
  }, []);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setCalcUnits(val);
    runQuickCalc(val, calcType);
  };

  const handleTypeChange = (type) => {
    setCalcType(type);
    runQuickCalc(calcUnits, type);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-btn bg-brand-green/10 border border-brand-green/20 text-label font-medium text-brand-green mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              <span>AI-Driven Solar Feasibility & Optimization Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text dark:text-dark-text tracking-tight leading-[1.2]">
              Know exactly what solar{' '}
              <span className="text-brand-green">
                can do for you.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-4 text-body sm:text-base text-light-muted dark:text-dark-muted leading-relaxed max-w-2xl mx-auto">
              SolarSense AI analyzes your roof, your electricity bills, and current government subsidies to give you clear, honest solar recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto lc-btn-brand text-body font-medium flex items-center justify-center gap-2 py-2.5 px-6"
              >
                <span>Get Your Free Solar Estimate</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto lc-btn-secondary text-body font-medium flex items-center justify-center gap-2 py-2.5 px-6"
              >
                <span>Explore Sizing Engine</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-label font-medium text-light-muted dark:text-dark-muted">
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>PM Surya Ghar Ready</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Transparent Formulas</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>4 Consumer Segments</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Official PDF Audits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE INSTANT ESTIMATE TEASER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lc-card p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-label font-medium uppercase tracking-wider text-brand-green">
              Instant Estimation Teaser
            </span>
            <h2 className="text-section-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-0.5">
              Estimate Your Solar Capacity in Seconds
            </h2>
            <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
              Adjust monthly electricity units to preview recommended kW capacity and financial savings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Controls */}
            <div className="lg:col-span-6 space-y-4 lc-surface p-5 rounded-card border border-light-border dark:border-dark-border">
              <div>
                <label className="text-label font-medium text-light-text dark:text-dark-text block mb-2">
                  Select Consumer Category:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'residential', label: 'Residential' },
                    { id: 'farm', label: 'Farm / Agri' },
                    { id: 'small_business', label: 'Small Business' },
                    { id: 'large_business', label: 'Commercial' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id)}
                      className={`py-2 px-3 rounded-btn text-body font-medium border transition-colors cursor-pointer ${
                        calcType === t.id
                          ? 'bg-brand-green text-white border-brand-green shadow-xs'
                          : 'bg-light-card dark:bg-dark-card text-light-muted dark:text-dark-muted border-light-border dark:border-dark-border hover:text-light-text dark:hover:text-dark-text'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-body font-medium text-light-text dark:text-dark-text mb-2">
                  <span>Monthly Electricity Consumption:</span>
                  <span className="text-brand-green font-semibold">{calcUnits} kWh</span>
                </div>
                <input
                  type="range"
                  min={calcType === 'large_business' ? 1000 : 100}
                  max={calcType === 'large_business' ? 25000 : 2500}
                  step={calcType === 'large_business' ? 500 : 25}
                  value={calcUnits}
                  onChange={handleSliderChange}
                  className="w-full accent-brand-green h-2 bg-light-border dark:bg-dark-border rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-label text-light-muted dark:text-dark-muted mt-1">
                  <span>{calcType === 'large_business' ? '1,000 kWh' : '100 kWh'}</span>
                  <span>{calcType === 'large_business' ? '25,000+ kWh' : '2,500 kWh'}</span>
                </div>
              </div>
            </div>

            {/* Live Teaser Output */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Recommended Size</p>
                <p className="text-stat font-bold text-light-text dark:text-dark-text mt-0.5">
                  {quickResult ? formatKW(quickResult.recommendedCapacity) : '...'}
                </p>
                <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
                  {quickResult ? `${quickResult.panelCount} panels (540W)` : ''}
                </p>
              </div>

              <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Annual Generation</p>
                <p className="text-stat font-bold text-light-text dark:text-dark-text mt-0.5">
                  {quickResult ? formatKWh(quickResult.annualGeneration) : '...'}
                </p>
                <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">Zero-emission power</p>
              </div>

              <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Est. Annual Savings</p>
                <p className="text-stat font-bold text-brand-green mt-0.5">
                  {quickResult ? formatCurrency(quickResult.annualSavings) : '...'}
                </p>
                <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">Every year for 25 yrs</p>
              </div>

              <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label uppercase font-medium text-light-muted dark:text-dark-muted">Capital Payback</p>
                <p className="text-stat font-bold text-light-text dark:text-dark-text mt-0.5">
                  {quickResult ? `${quickResult.paybackPeriod} Yrs` : '...'}
                </p>
                <p className="text-helper text-brand-green font-medium mt-0.5">
                  {quickResult ? `+${quickResult.roi}% 25-Yr ROI` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 lc-btn-brand text-body font-medium"
            >
              <span>Unlock Complete 4-Step Analysis & Subsidy Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 CONSUMER SOLUTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-label font-medium uppercase tracking-wider text-brand-green">
            Tailored Intelligence
          </span>
          <h2 className="text-section-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-0.5">
            Engineered for Four Key Consumer Profiles
          </h2>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-1">
            Different energy consumption patterns demand fundamentally different solar sizing models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Residential Rooftops',
              icon: Home,
              desc: 'Maximizes PM Surya Ghar subsidies (up to ₹78,000). Sized for evening domestic appliances, ACs, and EV home charging.',
              highlight: '3 – 5 kW typical',
            },
            {
              title: 'Farms & Agriculture',
              icon: Tractor,
              desc: 'Synchronizes daytime irrigation and agricultural pumps with peak solar sunshine, shielding crops from grid blackouts.',
              highlight: 'Solar water pumps',
            },
            {
              title: 'Small Business',
              icon: Store,
              desc: 'Up to 90% direct self-consumption during commercial daytime hours (9 AM - 7 PM) offsetting high commercial tariffs.',
              highlight: 'Fast 3–4 yr payback',
            },
            {
              title: 'Large Commercial',
              icon: Factory,
              desc: 'Mega-scale rooftop & ground-mounted solar with accelerated tax depreciation (40%) and substantial industrial OPEX reduction.',
              highlight: 'Scale economics',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="lc-card p-5 hover:border-brand-green/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-btn bg-brand-green/10 border border-brand-green/20 text-brand-green flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">{item.title}</h3>
                  <p className="text-helper text-light-muted dark:text-dark-muted mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-body">
                  <span className="font-semibold text-brand-green">{item.highlight}</span>
                  <Link to="/solutions" className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lc-card p-6 sm:p-10">
          <div className="max-w-2xl mb-8">
            <span className="text-label font-medium uppercase tracking-wider text-brand-green">
              Methodology
            </span>
            <h2 className="text-section-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-0.5">
              How the SolarSense Sizing Engine Works
            </h2>
            <p className="text-helper text-light-muted dark:text-dark-muted mt-1">
              Transparent physics formulas combined with regional solar irradiance and Indian tariff policies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Consumption Sizing',
                desc: 'Computes daily average kWh demand: dailyConsumption = monthlyUnits / 30.',
              },
              {
                step: '02',
                title: 'Solar Yield Modeling',
                desc: 'Incorporates regional peak sun hours (4.8 hrs/day) and system performance ratio (0.78).',
              },
              {
                step: '03',
                title: 'Physical Constraints',
                desc: 'Validates available rooftop area against standard 90 sq.ft per kW module requirements.',
              },
              {
                step: '04',
                title: 'Cost Optimization',
                desc: 'Calculates PM Surya Ghar subsidies, annual savings, simple payback, and 25-year ROI.',
              },
            ].map((st, i) => (
              <div key={i} className="border-l-2 border-brand-green/40 pl-3.5 space-y-1.5">
                <span className="text-stat font-bold text-brand-green">{st.step}</span>
                <h4 className="text-body font-semibold text-light-text dark:text-dark-text">{st.title}</h4>
                <p className="text-helper text-light-muted dark:text-dark-muted leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
