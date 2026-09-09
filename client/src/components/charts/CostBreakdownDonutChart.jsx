import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#2cbb5d', '#38bdf8', '#fbbf24', '#a855f7'];

const CostBreakdownDonutChart = ({ totalCost = 240000 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    { name: 'Solar PV Modules (52%)', value: Math.round(totalCost * 0.52) },
    { name: 'Inverter & Protection (20%)', value: Math.round(totalCost * 0.20) },
    { name: 'Mounting Structure (15%)', value: Math.round(totalCost * 0.15) },
    { name: 'BOS, Wiring & Net-Meter (13%)', value: Math.round(totalCost * 0.13) },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke={isDark ? '#262626' : '#FFFFFF'}
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(value), 'Estimated Cost']}
            contentStyle={{
              backgroundColor: isDark ? '#262626' : '#FFFFFF',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#3A3A3A' : '#E2E4E8'}`,
              fontSize: '13px',
              color: isDark ? '#F5F5F5' : '#1A1A1A',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={48}
            iconType="circle"
            formatter={(value) => (
              <span className="text-label font-medium text-light-muted dark:text-dark-muted">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostBreakdownDonutChart;
