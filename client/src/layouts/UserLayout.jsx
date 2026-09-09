import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import ProfileDropdown from '../components/common/ProfileDropdown';
import EditProfileModal from '../components/common/EditProfileModal';
import { Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: 'Energy & Solar Dashboard',
          desc: 'Decision-oriented summary of your electricity profile, solar feasibility, and financial savings',
        };
      case '/subsidies':
        return {
          title: 'Government Solar Subsidies',
          desc: 'PM Surya Ghar scheme guidelines, subsidy slabs, and application roadmap',
        };
      case '/onboarding':
        return {
          title: 'Solar Assessment',
          desc: 'Guided 3-step calculator to size your ideal solar capacity and financial savings',
        };
      case '/bill-analysis':
        return {
          title: 'Analyze Electricity Bill',
          desc: 'Multimodal OCR extraction, tariff analysis, and energy profile validation',
        };
      case '/solar-recommendation':
        return {
          title: 'Your Solar Recommendation',
          desc: 'Breakdown of recommended system capacity, generation estimates, and investment recovery',
        };
      case '/cost-analysis':
        return {
          title: 'Financial Analysis',
          desc: 'Multi-tier system size and 25-year financial comparison for your rooftop and budget',
        };
      case '/companies':
        return {
          title: 'Solar Companies & EPC Installers',
          desc: 'Verified Indian solar manufacturers, turnkey pricing, warranties, and quotes',
        };
      case '/companies/compare':
        return {
          title: 'Company Comparison Matrix',
          desc: 'Side-by-side technical and financial breakdown across top Indian solar brands',
        };
      case '/reports':
        return {
          title: 'Solar Feasibility & Audit Reports',
          desc: 'Official solar feasibility documentation and one-click PDF export',
        };
      case '/chat':
        return {
          title: 'AI Assistant',
          desc: 'Intelligent solar engineering and financial advisory assistant powered by Google Gemini',
        };
      case '/profile':
        return {
          title: 'My Profile & Preferences',
          desc: 'Manage contact information, profile avatar, and property energy settings',
        };
      default:
        return {
          title: 'SolarSense AI',
          desc: 'Intelligent Solar Energy Recommendation Platform',
        };
    }
  };

  const pageMeta = getPageMeta();

  return (
    <div className="min-h-screen bg-light-bg text-light-text flex">
      {/* Persistent / Responsive Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header */}
        <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-btn text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-section-title font-semibold text-slate-900 tracking-tight">
                {pageMeta.title}
              </h1>
              <p className="hidden sm:block text-helper text-slate-500 mt-0.5">
                {pageMeta.desc}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/onboarding"
              className="hidden sm:inline-flex items-center gap-2 lc-btn-brand"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Assessment</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="pl-3 border-l border-slate-200">
              <ProfileDropdown onOpenEditModal={() => setIsEditModalOpen(true)} />
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-light-bg">
          <Outlet />
        </main>
      </div>

      {/* Global Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default UserLayout;
