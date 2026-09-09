import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Leaf, Lock } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-light-border pt-14 pb-10 text-light-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-light-border">
          
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3.5">
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <p className="text-[15px] text-light-muted leading-relaxed">
              Intelligent Solar Energy Recommendation and Cost Optimization Platform. Transparent solar engineering intelligence.
            </p>
            <div className="flex items-center gap-2 text-[14px] text-brand font-semibold">
              <Leaf className="w-4 h-4 text-brand" />
              <span>Clean Energy Intelligence</span>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div>
            <h4 className="text-[16px] font-semibold uppercase tracking-wider text-light-text mb-3.5">
              Consumer Categories
            </h4>
            <ul className="space-y-2.5 text-[15px]">
              <li>
                <Link to="/solutions" className="text-light-muted hover:text-brand transition-colors">Residential Rooftop</Link>
              </li>
              <li>
                <Link to="/solutions" className="text-light-muted hover:text-brand transition-colors">Farm & Solar Irrigation</Link>
              </li>
              <li>
                <Link to="/solutions" className="text-light-muted hover:text-brand transition-colors">Small & Commercial Businesses</Link>
              </li>
              <li>
                <Link to="/solutions" className="text-light-muted hover:text-brand transition-colors">Large Commercial & Industrial</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Tools */}
          <div>
            <h4 className="text-[16px] font-semibold uppercase tracking-wider text-light-text mb-3.5">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-[15px]">
              <li>
                <Link to="/how-it-works" className="text-light-muted hover:text-brand transition-colors">How Sizing Engine Works</Link>
              </li>
              <li>
                <Link to="/govt-schemes" className="text-light-muted hover:text-brand transition-colors">Government Solar Subsidies</Link>
              </li>
              <li>
                <Link to="/onboarding" className="text-light-muted hover:text-brand transition-colors">Solar Feasibility Assessment</Link>
              </li>
              <li>
                <Link to="/bill-analysis" className="text-light-muted hover:text-brand transition-colors">Analyse your electricity bill</Link>
              </li>
              <li>
                <Link to="/cost-analysis" className="text-light-muted hover:text-brand transition-colors">Cost & Subsidy Calculator</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Project Info */}
          <div>
            <h4 className="text-[16px] font-semibold uppercase tracking-wider text-light-text mb-3.5">
              Capstone Project
            </h4>
            <p className="text-[15px] text-light-muted mb-3 leading-relaxed">
              Final Year B.Tech Computer Engineering Project. Built with full MERN stack, mathematical solar yield physics, and MNRE/CEA baseline algorithms.
            </p>
            <div className="flex items-center gap-2 text-[14px] text-light-text font-medium">
              <Shield className="w-4 h-4 text-brand" />
              <span>Transparent algorithmic physics</span>
            </div>
          </div>

        </div>

        {/* Engineering Disclaimer */}
        <div className="p-5 my-8 rounded-card bg-white border border-light-border text-[14.5px] text-light-muted leading-relaxed shadow-subtle">
          <strong className="font-semibold text-light-text">Engineering Disclaimer: </strong>
          All solar capacities, annual generation (kWh), cost projections, and PM Surya Ghar subsidies are mathematical estimates based on regional solar irradiance models. Final grid interconnection requires on-site physical survey and local DISCOM net-metering approval.
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[14.5px] text-light-muted">
          <div>
            © {new Date().getFullYear()} SolarSense AI. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-light-text transition-colors">About Project</Link>
            <span className="text-light-border">|</span>
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 hover:text-brand transition-colors font-medium text-light-text"
              title="Restricted Administrative Access"
            >
              <Lock className="w-3.5 h-3.5 text-brand" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
