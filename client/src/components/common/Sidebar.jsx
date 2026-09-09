import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  SunMedium,
  TrendingUp,
  FileText,
  User,
  LogOut,
  Sparkles,
  X,
  Award,
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserTypeBadge } from '../../utils/formatters';
import Logo from './Logo';

const MIN_WIDTH = 220;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 260;

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('solarsense_sidebar_collapsed') === 'true';
  });

  // Resizable width state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('solarsense_sidebar_width');
    const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed));
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    localStorage.setItem('solarsense_sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    if (!isCollapsed) {
      localStorage.setItem('solarsense_sidebar_width', sidebarWidth);
    }
  }, [sidebarWidth, isCollapsed]);

  // Handle Drag to Resize
  const handleMouseDown = (e) => {
    if (isCollapsed) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartXRef.current;
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidthRef.current + delta));
    setSidebarWidth(newWidth);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Clean 5-Category Navigation structure with everyday labels (no clutter badges)
  const navSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Solar Planning',
      items: [
        { name: 'Analyze Bill', path: '/bill-analysis', icon: FileSpreadsheet },
        { name: 'Solar Assessment', path: '/onboarding', icon: Sparkles },
        { name: 'Recommendation', path: '/solar-recommendation', icon: SunMedium },
      ],
    },
    {
      title: 'Money & Savings',
      items: [
        { name: 'Financial Analysis', path: '/cost-analysis', icon: TrendingUp },
        { name: 'Subsidies', path: '/subsidies', icon: Award },
      ],
    },
    {
      title: 'Resources',
      items: [
        { name: 'Companies', path: '/companies', icon: Building2 },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'AI Assistant', path: '/chat', icon: Bot },
      ],
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile', path: '/profile', icon: User },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const badge = getUserTypeBadge(user?.userType);

  const renderContent = (collapsed = false) => (
    <div className="flex flex-col h-full justify-between bg-[#E2E8F0] border-r border-[#CBD5E1] p-3 select-none overflow-y-auto overflow-x-hidden">
      <div className="space-y-3">
        {/* Brand Header & Toggle */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#CBD5E1]">
          <NavLink
            to="/dashboard"
            className="flex items-center transition-opacity hover:opacity-90 overflow-hidden"
          >
            {collapsed ? (
              <img
                src="/logo.png"
                alt="SolarSense AI"
                className="w-9 h-9 rounded-full object-contain mx-auto"
                title="SolarSense AI"
              />
            ) : (
              <div className="flex items-center gap-2.5 pl-1">
                <img
                  src="/logo.png"
                  alt="SolarSense Logo"
                  className="w-8 h-8 rounded-full object-contain shrink-0"
                />
                <span className="font-bold text-[18px] tracking-tight text-slate-900">
                  SolarSense<span className="text-brand ml-0.5">AI</span>
                </span>
              </div>
            )}
          </NavLink>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse/Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-300/60 transition-colors cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-brand" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Close Button */}
            {setMobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-300/60"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* User Card */}
        <div
          className={`rounded-xl bg-white border border-[#CBD5E1] shadow-xs transition-all ${
            collapsed ? 'p-1.5 flex flex-col items-center' : 'p-2.5'
          }`}
        >
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-brand font-bold text-sm flex items-center justify-center border border-emerald-200 shrink-0">
              {user?.avatar ? (
                <img
                  key={user.avatar}
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-slate-900 truncate leading-tight">
                  {user?.name || 'Consumer'}
                </p>
                <p className="text-[12px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
              <span className="font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-brand border border-emerald-200">
                {badge?.label || 'Residential'}
              </span>
              <span className="text-slate-400">Active</span>
            </div>
          )}
        </div>

        {/* Categorized Navigation */}
        <nav className="space-y-3 pt-1">
          {navSections.map((section, sIdx) => (
            <div key={section.title} className="space-y-0.5">
              {!collapsed ? (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2.5 pt-1.5 pb-0.5">
                  {section.title}
                </p>
              ) : (
                sIdx > 0 && <div className="h-px bg-[#CBD5E1] my-1.5 mx-1" />
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                      title={collapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `relative flex items-center ${
                          collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
                        } rounded-lg text-[14.5px] transition-colors group ${
                          isActive
                            ? 'bg-white text-brand font-bold border border-[#CBD5E1] shadow-xs'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50 font-medium'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                      {!collapsed && <span className="truncate">{item.name}</span>}

                      {/* Tooltip for collapsed desktop view */}
                      {collapsed && (
                        <span className="absolute left-full ml-2.5 px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-2.5 mt-3 border-t border-[#CBD5E1]">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Log Out' : undefined}
          className={`w-full flex items-center ${
            collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2'
          } rounded-lg text-[14px] font-medium text-rose-600 hover:bg-rose-100/60 hover:text-rose-700 transition-colors cursor-pointer group relative`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
          {collapsed && (
            <span className="absolute left-full ml-2.5 px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Log Out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Resizable & Collapsible Sidebar */}
      <aside
        style={{
          width: isCollapsed ? 68 : `${sidebarWidth}px`,
          transition: isDragging ? 'none' : 'width 200ms ease',
        }}
        className="hidden md:block shrink-0 h-screen sticky top-0 z-20 relative select-none"
      >
        {renderContent(isCollapsed)}

        {/* Drag Resize Handle (only visible when not collapsed) */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-emerald-500/40 transition-colors z-30 ${
              isDragging ? 'bg-emerald-500 w-2' : ''
            }`}
            title="Drag to resize sidebar"
          />
        )}
      </aside>

      {/* Mobile Drawer (Responsive < 768px) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-[#E2E8F0] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {renderContent(false)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
