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

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-light-card dark:bg-dark-card p-3 border border-light-border dark:border-dark-border rounded-card shadow-lg text-helper space-y-1 text-light-text dark:text-dark-text">
        <p className="font-semibold">{label}</p>
        <p className="text-brand-green font-medium">
          Solar Generation: {payload[0]?.value} kWh
        </p>
        <p className="text-light-muted dark:text-dark-muted font-medium">
          Grid Consumption: {payload[1]?.value} kWh
        </p>
        {payload[0] && payload[1] && (
          <p className="pt-1.5 text-label text-brand-green border-t border-light-border dark:border-dark-border font-semibold">
            Solar Offset: {Math.min(100, Math.round((payload[0].value / (payload[1].value || 1)) * 100))}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

const GenerationVsConsumptionChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!data || !data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-helper text-light-muted dark:text-dark-muted">
        No generation data available. Complete an assessment to see projections.
      </div>
    );
  }

  const gridColor = isDark ? '#2D2D2D' : '#E2E4E8';
  const axisColor = isDark ? '#A0A0A0' : '#6B7280';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} />
          <YAxis stroke={axisColor} fontSize={12} tickLine={false} />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-label font-medium text-light-muted dark:text-dark-muted">
                {value}
              </span>
            )}
          />
          <Bar dataKey="solarGeneration" name="Solar Generation (kWh)" fill="#2cbb5d" radius={[4, 4, 0, 0]} />
          <Bar dataKey="consumption" name="Estimated Consumption (kWh)" fill={isDark ? '#4B5563' : '#94A3B8'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenerationVsConsumptionChart;
