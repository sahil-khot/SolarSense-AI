import React from 'react';
import { Menu } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminHeader = ({ title, subtitle, onOpenMobileMenu }) => {
  const { adminUser } = useAdminAuth();

  return (
    <header className="bg-white border-b border-light-border px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-btn text-light-muted hover:text-light-text hover:bg-light-surface"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-card-title font-semibold text-light-text tracking-tight">{title}</h1>
          {subtitle && <p className="text-helper text-light-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* System Liveness Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-btn bg-brand-green/10 border border-brand-green/20 text-helper font-medium text-brand-green">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
          <span>Engine Online</span>
        </div>

        {/* Current Admin Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-light-border">
          <div className="w-8 h-8 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green font-semibold text-body flex items-center justify-center">
            {adminUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-right">
            <p className="text-body font-semibold text-light-text leading-tight">{adminUser?.name || 'Administrator'}</p>
            <p className="text-meta text-brand-green font-medium uppercase tracking-wider">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
