import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-label font-medium uppercase tracking-wider text-brand-green px-2.5 py-1 rounded-btn bg-brand-green/10 border border-brand-green/20">
          Academic Capstone & Mission
        </span>
        <h1 className="text-page-title font-semibold text-light-text dark:text-dark-text tracking-tight mt-2.5">
          About SolarSense AI
        </h1>
        <p className="text-helper text-light-muted dark:text-dark-muted mt-2 leading-relaxed">
          Intelligent Solar Energy Recommendation and Cost Optimization Platform — Final-Year B.Tech Computer Engineering Capstone Project.
        </p>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="lc-card p-6">
          <div className="w-8 h-8 rounded-btn bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3 border border-rose-500/20">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text mb-1.5">The Problem</h3>
          <p className="text-helper text-light-muted dark:text-dark-muted leading-relaxed">
            Homeowners, farmers, and commercial entities struggle to determine if solar is genuinely feasible for their property. Traditional installer quotes are often opaque, over-sized for higher commissions, and vague regarding real PM Surya Ghar subsidies and true breakeven payback timelines.
          </p>
        </div>

        <div className="lc-card p-6">
          <div className="w-8 h-8 rounded-btn bg-brand-green/10 text-brand-green flex items-center justify-center mb-3 border border-brand-green/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text mb-1.5">The SolarSense AI Solution</h3>
          <p className="text-helper text-light-muted dark:text-dark-muted leading-relaxed">
            An open, trustworthy full-stack platform that delivers transparent engineering sizing, multi-tier capacity optimization, automated bill diagnostics, and downloadable engineering audit reports without high-pressure sales bias or fabricated confidence scores.
          </p>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="lc-card p-6 sm:p-8 space-y-4">
        <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">Technical System Architecture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-helper">
          <div className="p-4 rounded-card lc-surface border border-light-border dark:border-dark-border">
            <h4 className="font-semibold text-light-text dark:text-dark-text mb-1 text-body">Frontend Engineering</h4>
            <p className="text-light-muted dark:text-dark-muted leading-relaxed">
              React 18, Vite, Tailwind CSS, React Router v6, Recharts for dynamic charts, and jsPDF for downloadable audit reports.
            </p>
          </div>
          <div className="p-4 rounded-card lc-surface border border-light-border dark:border-dark-border">
            <h4 className="font-semibold text-light-text dark:text-dark-text mb-1 text-body">Backend & REST APIs</h4>
            <p className="text-light-muted dark:text-dark-muted leading-relaxed">
              Node.js, Express.js, MongoDB/Mongoose, JWT authentication, bcrypt password hashing, Multer file upload handler, and strict Role-Based Access Control (RBAC).
            </p>
          </div>
          <div className="p-4 rounded-card lc-surface border border-light-border dark:border-dark-border">
            <h4 className="font-semibold text-light-text dark:text-dark-text mb-1 text-body">Modular AI/ML Layer</h4>
            <p className="text-light-muted dark:text-dark-muted leading-relaxed">
              Cleanly separated service layer in `server/ai/` implementing transparent mathematical physics models with pluggable hooks for external ML endpoints.
            </p>
          </div>
        </div>
      </div>

      {/* Standards & Guidelines */}
      <div className="p-5 rounded-card lc-card text-helper space-y-2.5">
        <h4 className="font-semibold text-light-text dark:text-dark-text text-body">Engineering Benchmarks & Standards Referenced</h4>
        <ul className="list-disc pl-5 space-y-1.5 text-light-muted dark:text-dark-muted">
          <li><strong className="text-light-text dark:text-dark-text font-medium">MNRE Guidelines:</strong> Ministry of New and Renewable Energy benchmark costs and technical specifications.</li>
          <li><strong className="text-light-text dark:text-dark-text font-medium">PM Surya Ghar Muft Bijli Yojana:</strong> Tiered rooftop subsidy slabs for residential installations.</li>
          <li><strong className="text-light-text dark:text-dark-text font-medium">CEA Grid Emission Factor:</strong> Central Electricity Authority average grid emission factor of ~0.82 kg CO2 / kWh.</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
