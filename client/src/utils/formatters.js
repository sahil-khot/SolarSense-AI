/**
 * Formatting utility functions for currencies, energy, and metrics
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatLakh = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 100000) {
    const inLakhs = (num / 100000).toFixed(2);
    const cleanLakhs = inLakhs.endsWith('.00') ? inLakhs.slice(0, -3) : inLakhs.replace(/0$/, '');
    return `₹${cleanLakhs} Lakh`;
  }
  return formatCurrency(num);
};

export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num);
};

export const formatKW = (kw) => {
  if (!kw) return '0 kW';
  return `${Number(kw).toFixed(1)} kW`;
};

export const formatKWh = (kwh) => {
  if (!kwh) return '0 kWh';
  return `${formatNumber(Math.round(kwh))} kWh`;
};

export const getUserTypeBadge = (type) => {
  switch (type) {
    case 'residential':
      return { label: 'Residential / Home', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'farm':
      return { label: 'Farm / Agricultural', bg: 'bg-lime-50 text-lime-700 border-lime-200' };
    case 'small_business':
      return { label: 'Small Business', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'large_business':
      return { label: 'Commercial / Large Business', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    default:
      return { label: 'General Consumer', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};
