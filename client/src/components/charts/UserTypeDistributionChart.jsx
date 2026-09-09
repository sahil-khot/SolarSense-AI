import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#2cbb5d', '#10b981', '#38bdf8', '#818cf8'];

const UserTypeDistributionChart = ({ distribution }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    { name: 'Residential', count: distribution?.residential || 0 },
    { name: 'Farm / Agri', count: distribution?.farm || 0 },
    { name: 'Small Business', count: distribution?.small_business || 0 },
    { name: 'Large Comm', count: distribution?.large_business || 0 },
  ];

  const gridColor = isDark ? '#2D2D2D' : '#E2E4E8';
  const axisColor = isDark ? '#A0A0A0' : '#6B7280';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} />
          <YAxis stroke={axisColor} fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#262626' : '#FFFFFF',
              border: `1px solid ${isDark ? '#3A3A3A' : '#E2E4E8'}`,
              borderRadius: '8px',
              fontSize: '13px',
              color: isDark ? '#F5F5F5' : '#1A1A1A',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            itemStyle={{ color: '#2cbb5d' }}
            formatter={(val) => [`${val} Users`, 'Total Registered']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserTypeDistributionChart;
