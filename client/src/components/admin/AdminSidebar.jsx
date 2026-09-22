import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Sliders,
  ShieldCheck,
  LogOut,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'System Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Audit Reports', path: '/admin/reports', icon: FileText },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'System Settings', path: '/admin/settings', icon: Sliders },
  ];

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-[#E2E8F0] border-r border-[#CBD5E1] text-light-text p-3">
      <div>
        {/* Admin Brand */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-[#CBD5E1] pb-3">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="SolarSense AI"
              className="w-7 h-7 rounded-full object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-light-text text-[15px] tracking-tight">
                  SolarSense
                </span>
                <span className="text-[12px] font-bold uppercase px-1.5 py-0.5 rounded-btn bg-brand/10 text-brand border border-brand/20">
                  ADMIN
                </span>
              </div>
              <p className="text-[13px] text-light-muted font-normal">Console</p>
            </div>
          </div>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-btn text-light-muted hover:text-light-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Administrator Profile Tag */}
        <div className="mx-0.5 mb-3 p-2.5 rounded-card bg-white border border-[#CBD5E1] shadow-xs">
          <p className="text-[13px] uppercase font-bold tracking-wider text-brand mb-0.5">
            Administrator
          </p>
          <p className="text-[15px] font-bold text-light-text truncate">{adminUser?.name || 'Administrator'}</p>
          <p className="text-[13px] text-light-muted truncate font-mono mt-0.5">{adminUser?.email || 'admin@solarsense.ai'}</p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-brand font-bold border border-[#CBD5E1] shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
                  }`
                }
              >
                <Icon className="w-[17px] h-[17px] shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Sign Out */}
      <div className="pt-2 border-t border-[#CBD5E1]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[15px] font-semibold text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-[17px] h-[17px]" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 overflow-y-auto">
        {content}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-64 h-full bg-[#E2E8F0] shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
