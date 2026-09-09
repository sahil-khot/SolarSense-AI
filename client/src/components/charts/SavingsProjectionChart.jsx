import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

const SavingsProjectionChart = ({ netCost = 150000, annualSavings = 35000, paybackPeriod = 4.2 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [];
  let cumulative = 0;
  for (let year = 1; year <= 15; year++) {
    const yearSavings = annualSavings * Math.pow(1 - 0.007, year - 1);
    cumulative += yearSavings;
    data.push({
      year: `Yr ${year}`,
      cumulativeSavings: Math.round(cumulative),
      netInvestment: netCost,
      netProfit: Math.round(cumulative - netCost),
    });
  }

  const gridColor = isDark ? '#2D2D2D' : '#E2E4E8';
  const axisColor = isDark ? '#A0A0A0' : '#6B7280';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="year" stroke={axisColor} fontSize={12} tickLine={false} />
          <YAxis
            stroke={axisColor}
            fontSize={12}
            tickLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value),
              name === 'cumulativeSavings'
                ? 'Cumulative Savings'
                : name === 'netInvestment'
                ? 'Net Capital Cost'
                : 'Net Profit',
            ]}
            labelStyle={{ fontWeight: '600', color: isDark ? '#F5F5F5' : '#1A1A1A' }}
            contentStyle={{
              backgroundColor: isDark ? '#262626' : '#FFFFFF',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#3A3A3A' : '#E2E4E8'}`,
              color: isDark ? '#F5F5F5' : '#1A1A1A',
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-label font-medium text-light-muted dark:text-dark-muted">
                {value === 'cumulativeSavings'
                  ? 'Cumulative Savings'
                  : value === 'netInvestment'
                  ? 'Initial Net Cost'
                  : 'Net Return'}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="cumulativeSavings"
            stroke="#2cbb5d"
            strokeWidth={2.5}
            dot={{ fill: '#2cbb5d', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="step"
            dataKey="netInvestment"
            stroke="#f87171"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsProjectionChart;
