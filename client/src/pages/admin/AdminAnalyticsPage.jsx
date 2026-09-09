import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatKW } from '../../utils/formatters';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminService.getAnalytics();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Computing cross-sector energy analytics..." />
      </div>
    );
  }

  const { assessmentsByType = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text tracking-tight">
          Sectoral Sizing & Payback Analytics
        </h2>
        <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
          Comparative performance metrics aggregated across consumer categories.
        </p>
      </div>

      {/* Sector Cards */}
      {assessmentsByType.length === 0 ? (
        <div className="lc-card p-8 text-center">
          <p className="text-body font-medium text-light-text">No sector evaluations recorded yet</p>
          <p className="text-helper text-light-muted mt-1">Consumer assessments will populate cross-sector sizing metrics automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assessmentsByType.map((item) => (
            <div key={item._id} className="lc-card p-5">
              <span className="text-label font-medium uppercase tracking-wider text-brand-green px-2 py-0.5 rounded-btn bg-brand-green/10 border border-brand-green/20">
                {item._id?.replace('_', ' ')}
              </span>
              <div className="mt-3.5 space-y-2.5">
                <div>
                  <p className="text-label text-light-muted uppercase font-medium">Evaluations Run</p>
                  <p className="text-stat font-bold text-light-text mt-0.5">{item.count} <span className="text-helper font-normal">Assessments</span></p>
                </div>
                <div className="pt-2 border-t border-light-border grid grid-cols-2 gap-2 text-body">
                  <div>
                    <p className="text-label text-light-muted font-medium">Avg Size</p>
                    <p className="font-semibold text-light-text mt-0.5">{formatKW(item.avgCapacity || 0)}</p>
                  </div>
                  <div>
                    <p className="text-label text-light-muted font-medium">Avg Payback</p>
                    <p className="font-semibold text-brand-green mt-0.5">
                      {item.avgPayback != null && item.avgPayback > 0 ? `${item.avgPayback.toFixed(1)} Yrs` : '—'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-light-border">
                  <p className="text-label text-light-muted font-medium">Total Projected Annual Savings</p>
                  <p className="font-semibold text-sky-500 text-body mt-0.5">{formatCurrency(item.totalSavings || 0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Benchmark Explanatory Card */}
      <div className="lc-card p-5">
        <h3 className="text-card-title font-semibold text-light-text mb-1.5">
          Engineering Takeaways & Pattern Analysis
        </h3>
        <p className="text-helper text-light-muted leading-relaxed max-w-4xl">
          Residential consumers benefit most from capital relief through PM Surya Ghar direct subsidies (~₹78,000 max), accelerating capital recovery. Meanwhile, Commercial and Small Business consumers achieve rapid payback driven by daytime load synchronization with peak solar irradiance, avoiding high commercial tariff tiers without requiring expensive battery storage.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
