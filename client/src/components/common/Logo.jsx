import React from 'react';

const Logo = ({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  className = '',
  textClassName = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-[18px]', badge: 'text-[11px]' },
    md: { img: 'w-9 h-9', text: 'text-[22px]', badge: 'text-[12.5px]' },
    lg: { img: 'w-11 h-11', text: 'text-[26px]', badge: 'text-[14px]' },
    xl: { img: 'w-16 h-16', text: 'text-[32px]', badge: 'text-[15px]' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="SolarSense AI Official Logo"
        className={`${current.img} object-contain rounded-full shadow-xs shrink-0`}
      />
      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-light-text ${current.text} ${textClassName}`}>
            SolarSense
          </span>
          <span
            className={`uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 ${current.badge}`}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
