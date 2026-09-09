import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    const originalBill = payload.find((p) => p.dataKey === 'originalBill')?.value || 0;
    const withSolar = payload.find((p) => p.dataKey === 'withSolar')?.value || 0;
    const savings = Math.max(0, originalBill - withSolar);
    const savingsPercent = originalBill > 0 ? Math.round((savings / originalBill) * 100) : 0;

    return (
      <div className="bg-white dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs space-y-1.5 text-slate-800 dark:text-slate-100 min-w-[210px]">
        <p className="font-bold text-sm text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-700">
          {label}
        </p>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span>Actual Past Bill:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(originalBill)}</span>
        </div>
        <div className="flex justify-between items-center text-emerald-600 font-medium">
          <span>Bill With Solar:</span>
          <span className="font-bold">{formatCurrency(withSolar)}</span>
        </div>
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400">
          <span>You Save From Past:</span>
          <span>{formatCurrency(savings)} ({savingsPercent}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

const PastSavingsComparisonChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || !data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No bill history available yet. Upload electricity bills to see your past savings analysis.
      </div>
    );
  }

  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const axisColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="period" stroke={axisColor} fontSize={12} tickLine={false} />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {value}
              </span>
            )}
          />
          <Bar
            dataKey="originalBill"
            name="Actual Past Light Bill (₹)"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
          <Bar
            dataKey="withSolar"
            name="Bill With Rooftop Solar (₹)"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PastSavingsComparisonChart;
