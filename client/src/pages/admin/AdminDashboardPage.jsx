import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sun,
  FileSpreadsheet,
  FileText,
  ArrowRight,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Database,
  Activity,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/common/StatCard';
import UserTypeDistributionChart from '../../components/charts/UserTypeDistributionChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatKW, formatKWh, formatNumber } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Querying enterprise telemetry..." />
      </div>
    );
  }

  const { summary, systemHealth, recentUsers = [], recentAssessments = [] } = data || {};
  const mlModels = systemHealth?.mlLayer?.models;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 4 PRIMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Consumers"
          value={summary?.totalUsers || 0}
          subtitle="Active consumer accounts"
          icon={Users}
          iconBg="bg-brand-green/10 text-brand-green"
          badge="Verified"
          badgeType="positive"
        />

        <StatCard
          title="Solar Assessments"
          value={summary?.totalAssessments || 0}
          subtitle="Full sizing evaluations"
          icon={Sun}
          iconBg="bg-amber-500/10 text-amber-500"
          badge="Engine Sized"
          badgeType="positive"
        />

        <StatCard
          title="Bills Uploaded & Diagnosed"
          value={summary?.totalBills || 0}
          subtitle={`${summary?.verifiedBills || 0} Verified • ${summary?.pendingBills || 0} Pending`}
          icon={FileSpreadsheet}
          iconBg="bg-sky-500/10 text-sky-500"
          badge="Verified Pipeline"
          badgeType="accent"
        />

        <StatCard
          title="Audit Reports Generated"
          value={summary?.totalReports || 0}
          subtitle="Official engineering PDFs"
          icon={FileText}
          iconBg="bg-indigo-500/10 text-indigo-500"
          badge="Exported"
          badgeType="positive"
        />
      </div>

      {/* AI & ML INFRASTRUCTURE MONITORING CARD (Requirements 60, 68) */}
      <div className="lc-card p-5 border-l-4 border-l-brand">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-light-border gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-card-title font-bold text-light-text tracking-tight">
                AI & Machine Learning Infrastructure Telemetry
              </h3>
              <p className="text-xs text-light-muted">
                FastAPI Python Service + Gemini Flash Reasoning Layer status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                systemHealth?.mlLayer?.available
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>
                {systemHealth?.mlLayer?.available
                  ? 'ML Microservice Online'
                  : 'ML Microservice Standby (Offline)'}
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          {/* Box 1: Consumption Model */}
          <div className="p-3.5 rounded-lg lc-surface border border-light-border space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center justify-between">
              <span>Consumption Forecaster</span>
              <span
                className={`text-[10.5px] px-1.5 py-0.5 rounded font-bold ${
                  mlModels?.consumptionForecaster?.status === 'active' || systemHealth?.mlLayer?.available
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {mlModels?.consumptionForecaster?.version
                  ? `v${mlModels.consumptionForecaster.version}`
                  : systemHealth?.mlLayer?.available
                  ? 'Active'
                  : 'Offline'}
              </span>
            </p>
            <p className="text-slate-500">
              Model: <strong>{mlModels?.consumptionForecaster?.modelName || (systemHealth?.mlLayer?.available ? 'Gradient Boosting' : 'Not available')}</strong>
            </p>
            <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-mono">
              <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                <p className="text-slate-400">MAPE</p>
                <p className="font-bold text-emerald-600">
                  {mlModels?.consumptionForecaster?.mape != null ? `${mlModels.consumptionForecaster.mape}%` : '—'}
                </p>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                <p className="text-slate-400">MAE</p>
                <p className="font-bold text-slate-800">
                  {mlModels?.consumptionForecaster?.mae != null ? `${mlModels.consumptionForecaster.mae} kWh` : '—'}
                </p>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                <p className="text-slate-400">Samples</p>
                <p className="font-bold text-slate-800">
                  {mlModels?.consumptionForecaster?.trainingSamples != null ? mlModels.consumptionForecaster.trainingSamples : '—'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Eval: Walk-forward split (24 mo train / 12 mo test)
            </p>
          </div>

          {/* Box 2: Solar Yield Model */}
          <div className="p-3.5 rounded-lg lc-surface border border-light-border space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center justify-between">
              <span>Solar Yield ML Model</span>
              <span
                className={`text-[10.5px] px-1.5 py-0.5 rounded font-bold ${
                  systemHealth?.mlLayer?.available ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {systemHealth?.mlLayer?.available ? 'Dual Forecast' : 'Offline'}
              </span>
            </p>
            <p className="text-slate-500">
              Model: <strong>{mlModels?.solarForecaster?.modelName || (systemHealth?.mlLayer?.available ? 'Gradient Boosting Solar Forecaster' : 'Not available')}</strong>
            </p>
            <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] font-mono">
              <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                <p className="text-slate-400">Test MAPE</p>
                <p className="font-bold text-blue-600">
                  {mlModels?.solarForecaster?.mape != null ? `${mlModels.solarForecaster.mape}%` : '—'}
                </p>
              </div>
              <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                <p className="text-slate-400">Training Samples</p>
                <p className="font-bold text-slate-800">
                  {mlModels?.solarForecaster?.trainingSamples != null ? mlModels.solarForecaster.trainingSamples : '—'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Dataset: Indian Solar Irradiance & Field Soiling Calibration
            </p>
          </div>

          {/* Box 3: Gemini Flash Gateway & Storage */}
          <div className="p-3.5 rounded-lg lc-surface border border-light-border space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center justify-between">
              <span>Gemini AI Gateway</span>
              <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Grounded</span>
            </p>
            <p className="text-slate-500">
              Active Model: <strong>{systemHealth?.gemini?.model || 'gemini-2.5-flash'}</strong>
            </p>
            <div className="space-y-1 pt-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Reasoning:</span>
                <span className="font-mono text-purple-700">Strict Engineering Rules</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Limits:</span>
                <span>Enforced Per-User</span>
              </div>
              <div className="flex justify-between">
                <span>File Storage:</span>
                <span className="text-emerald-600 font-semibold">Protected Authenticated Stream</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLATFORM AGGREGATE IMPACT BAR */}
      <div className="lc-card p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-light-border">
          <div>
            <h3 className="text-card-title font-semibold text-light-text tracking-tight">
              Aggregate Clean Energy Pipeline
            </h3>
            <p className="text-helper text-light-muted mt-0.5">
              Total cumulative solar capacity recommended across all active consumer profiles
            </p>
          </div>
          <span className="text-label font-medium uppercase tracking-wider px-2 py-0.5 rounded-btn bg-brand-green/10 text-brand-green border border-brand-green/20">
            Platform Portfolio
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-card lc-surface border border-light-border">
            <p className="text-label text-light-muted font-medium uppercase">Total Sized Capacity</p>
            <p className="text-stat font-bold text-light-text mt-0.5">
              {formatKW(summary?.impact?.totalCapacityKW || 0)}
            </p>
          </div>
          <div className="p-3.5 rounded-card lc-surface border border-light-border">
            <p className="text-label text-light-muted font-medium uppercase">Projected Annual Yield</p>
            <p className="text-stat font-bold text-brand-green mt-0.5">
              {formatKWh(summary?.impact?.totalAnnualGenerationKWh || 0)}
            </p>
          </div>
          <div className="p-3.5 rounded-card lc-surface border border-light-border">
            <p className="text-label text-light-muted font-medium uppercase">Annual Energy Savings</p>
            <p className="text-stat font-bold text-sky-500 mt-0.5">
              {formatCurrency(summary?.impact?.totalAnnualSavingsINR || 0)}
            </p>
          </div>
          <div className="p-3.5 rounded-card lc-surface border border-light-border">
            <p className="text-label text-light-muted font-medium uppercase">Total CO2 Abatement</p>
            <p className="text-stat font-bold text-teal-500 mt-0.5">
              {formatNumber(summary?.impact?.totalCO2AvoidedKg || 0)} <span className="text-helper font-normal text-light-muted">kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* USER DISTRIBUTION & RECENT ASSESSMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* User Distribution Bar Chart */}
        <div className="lg:col-span-5 lc-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-card-title font-semibold text-light-text">
                Consumer Category Distribution
              </h3>
              <p className="text-helper text-light-muted">Active users by energy sector</p>
            </div>
          </div>
          <UserTypeDistributionChart distribution={summary?.userDistribution} />
        </div>

        {/* Recent Assessments Feed */}
        <div className="lg:col-span-7 lc-card p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-light-border">
            <div>
              <h3 className="text-card-title font-semibold text-light-text">
                Recent Solar Assessments
              </h3>
              <p className="text-helper text-light-muted">Latest sizing runs across the platform</p>
            </div>
            <Link
              to="/admin/reports"
              className="text-body font-medium text-brand-green hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-light-border overflow-x-auto text-body">
            {recentAssessments.length === 0 ? (
              <p className="text-center py-6 text-helper text-light-muted">No assessments executed yet.</p>
            ) : (
              recentAssessments.map((a) => (
                <div key={a._id} className="py-2.5 flex items-center justify-between gap-4 hover:bg-light-surface/50 px-2 rounded-btn transition-colors">
                  <div>
                    <p className="font-semibold text-light-text">{a.userId?.name || 'Consumer'}</p>
                    <p className="text-label text-light-muted">
                      {a.location?.city || '—'}, {a.location?.state || '—'} • <span className="capitalize">{a.userType}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-green text-body">{formatKW(a.recommendedCapacity)}</span>
                    <p className="text-label text-light-muted">{formatCurrency(a.netCost)} net</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RECENT USERS DIRECTORY PREVIEW */}
      <div className="lc-card p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-card-title font-semibold text-light-text">
              Recently Registered Consumers
            </h3>
            <p className="text-helper text-light-muted">Directory of user registrations</p>
          </div>
          <Link
            to="/admin/users"
            className="text-body font-medium text-brand-green hover:underline flex items-center gap-1"
          >
            <span>Manage All Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body border-collapse">
            <thead>
              <tr className="border-b border-light-border text-label uppercase font-semibold text-light-muted bg-light-surface tracking-wider">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border text-body text-light-text">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-light-surface/60 transition-colors">
                  <td className="py-3 px-3 font-semibold">{u.name}</td>
                  <td className="py-3 px-3 text-light-muted font-mono text-label">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="capitalize px-2 py-0.5 rounded-btn text-label font-medium lc-surface border border-light-border">
                      {u.userType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-light-muted">{u.location?.city || '—'}</td>
                  <td className="py-3 px-3 text-light-muted text-label">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
