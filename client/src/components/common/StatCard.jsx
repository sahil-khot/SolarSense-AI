import React from 'react';

const StatCard = ({
  title,
  value,
  unit = '',
  subtitle,
  icon: Icon,
  iconBg = 'bg-brand/10 text-brand',
  badge,
  badgeType = 'neutral',
}) => {
  const badgeStyles = {
    positive: 'bg-brand/10 text-brand border-brand/20',
    accent: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    neutral: 'bg-light-surface text-light-muted border-light-border',
  };

  return (
    <div className="lc-card flex flex-col justify-between shadow-subtle p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-light-muted">{title}</p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[30px] font-bold text-light-text tracking-tight">{value}</span>
            {unit && <span className="text-[16px] font-medium text-light-muted">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-btn flex items-center justify-center ${iconBg} border border-light-border shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-3.5 pt-3 border-t border-light-border flex items-center justify-between text-[14px] text-light-muted">
          {subtitle && <span className="font-medium text-light-muted">{subtitle}</span>}
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-[12.5px] ${badgeStyles[badgeType] || badgeStyles.neutral}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
