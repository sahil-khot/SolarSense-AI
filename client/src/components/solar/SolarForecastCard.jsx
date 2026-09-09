import React from 'react';
import { Sun, CloudSun, Compass, Sparkles, Calendar } from 'lucide-react';

const SolarForecastCard = ({ recommendedCapacity = 3.5, city = 'Pune' }) => {
  const dailyExpectedKWh = Math.round(recommendedCapacity * 4.8 * 0.78 * 10) / 10;

  return (
    <div className="lc-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-btn bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">
              Solar & Weather Forecast
            </h3>
            <p className="text-helper text-light-muted dark:text-dark-muted">
              Live meteorological conditions for {city}
            </p>
          </div>
        </div>

        <span className="text-label font-semibold text-brand-green px-2.5 py-1 rounded-btn bg-brand-green/10 border border-brand-green/20">
          Optimal Sunshine
        </span>
      </div>

      {/* Grid of Weather & Sunlight Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
        <div className="lc-surface p-3.5">
          <div className="flex items-center justify-between text-light-muted dark:text-dark-muted mb-1">
            <span className="text-label font-medium uppercase tracking-wider">Conditions</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-stat font-bold text-light-text dark:text-dark-text">31°C</p>
          <p className="text-helper text-brand-green mt-0.5 font-medium">Clear & Sunny</p>
        </div>

        <div className="lc-surface p-3.5">
          <div className="flex items-center justify-between text-light-muted dark:text-dark-muted mb-1">
            <span className="text-label font-medium uppercase tracking-wider">Solar Potential</span>
            <Sparkles className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-stat font-bold text-brand-green">92%</p>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">High irradiance</p>
        </div>

        <div className="lc-surface p-3.5">
          <div className="flex items-center justify-between text-light-muted dark:text-dark-muted mb-1">
            <span className="text-label font-medium uppercase tracking-wider">Today's Generation</span>
            <Compass className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-stat font-bold text-light-text dark:text-dark-text">~{dailyExpectedKWh} kWh</p>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">Expected yield</p>
        </div>

        <div className="lc-surface p-3.5">
          <div className="flex items-center justify-between text-light-muted dark:text-dark-muted mb-1">
            <span className="text-label font-medium uppercase tracking-wider">Peak Hours</span>
            <Calendar className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-stat font-bold text-light-text dark:text-dark-text">10 AM – 3 PM</p>
          <p className="text-helper text-brand-green mt-0.5 font-medium">5.2 peak hours</p>
        </div>
      </div>

      {/* Tomorrow Outlook */}
      <div className="mt-4 p-3.5 rounded-card lc-surface flex items-start gap-3 text-body">
        <CloudSun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-light-text dark:text-dark-text leading-relaxed text-body">
          <strong className="font-semibold text-light-text dark:text-dark-text">Tomorrow's Outlook: </strong> Expected generation remains strong (~{Math.round((dailyExpectedKWh * 0.95) * 10) / 10} kWh) with light afternoon cloud cover. SolarSense AI recommends pre-running heavy loads during midday peak.
        </p>
      </div>
    </div>
  );
};

export default SolarForecastCard;
