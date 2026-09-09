import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import GovernmentSubsidiesCard from '../../components/solar/GovernmentSubsidiesCard';

const GovernmentSubsidiesPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const stateSubsidies = [
    {
      state: 'Uttar Pradesh',
      central: 'Up to ₹78,000',
      stateExtra: 'Up to ₹30,000',
      total: 'Up to ₹1,08,000',
      notes: '₹15,000 for 1 kW, ₹30,000 for ≥ 2 kW via UPNEDA.',
    },
    {
      state: 'Delhi',
      central: 'Up to ₹78,000',
      stateExtra: '₹3.00 / kWh GBI',
      total: '₹78,000 + Monthly Credit',
      notes: 'Generation-Based Incentive on monthly bill for 3 years.',
    },
    {
      state: 'Gujarat',
      central: 'Up to ₹78,000',
      stateExtra: 'Fast-Track Net Metering',
      total: 'Up to ₹78,000',
      notes: 'High penetration with digitized DISCOM interconnection.',
    },
    {
      state: 'Maharashtra',
      central: 'Up to ₹78,000',
      stateExtra: 'Solar Banking',
      total: 'Up to ₹78,000',
      notes: 'Annual net-metering credit banking settlement every March.',
    },
  ];

  const faqs = [
    {
      q: 'How long does it take for the subsidy to hit my bank account?',
      a: 'After net-meter commissioning by DISCOM, the certificate is uploaded to the National Portal. The DBT subsidy is credited directly to your bank account within 30 days.',
    },
    {
      q: 'Are batteries covered under PM Surya Ghar?',
      a: 'No. Subsidies apply only to grid-connected rooftop solar systems with bi-directional net meters. Battery storage must be purchased separately without subsidy.',
    },
    {
      q: 'What is DCR (Domestic Content Requirement)?',
      a: 'To qualify for subsidy, both solar cells and modules must be manufactured in India and certified on the MNRE ALMM list. Imported panels are ineligible.',
    },
    {
      q: 'Can tenants apply for rooftop subsidy?',
      a: 'The meter must be in the name of the property owner or family. Tenants must ask the property owner to apply through their electricity account.',
    },
    {
      q: 'How does the 300 free units monthly benefit work?',
      a: 'A standard 3 kW system generates ~360 kWh/month. For homes consuming up to 300 units, solar offsets 100% of the bill, leaving only fixed meter charges.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-btn bg-brand/10 border border-brand/20 text-brand text-[13.5px] font-semibold uppercase tracking-wider mb-3">
          <Award className="w-4 h-4" />
          <span>MNRE Official Guidelines</span>
        </div>
        <h1 className="text-[32px] font-bold text-light-text tracking-tight">
          Government Solar Subsidies & Schemes
        </h1>
        <p className="text-[16px] text-light-muted mt-2 leading-relaxed">
          PM Surya Ghar: Muft Bijli Yojana provides up to ₹78,000 direct bank transfer subsidy for residential rooftop solar installations.
        </p>
      </div>

      {/* 4 Quick Stat Callouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="lc-card text-center p-5 shadow-subtle">
          <p className="text-[14px] text-light-muted uppercase font-semibold">Max Subsidy</p>
          <p className="text-[30px] font-bold text-brand mt-1">₹78,000</p>
          <p className="text-[14px] text-light-muted mt-0.5">Direct to bank</p>
        </div>

        <div className="lc-card text-center p-5 shadow-subtle">
          <p className="text-[14px] text-light-muted uppercase font-semibold">Free Energy</p>
          <p className="text-[30px] font-bold text-light-text mt-1">300 Units</p>
          <p className="text-[14px] text-light-muted mt-0.5">Per month offset</p>
        </div>

        <div className="lc-card text-center p-5 shadow-subtle">
          <p className="text-[14px] text-light-muted uppercase font-semibold">Disbursement</p>
          <p className="text-[30px] font-bold text-sky-500 mt-1">30 Days</p>
          <p className="text-[14px] text-light-muted mt-0.5">Post inspection</p>
        </div>

        <div className="lc-card text-center p-5 shadow-subtle">
          <p className="text-[14px] text-light-muted uppercase font-semibold">Scheme Budget</p>
          <p className="text-[30px] font-bold text-amber-500 mt-1">₹75,021 Cr</p>
          <p className="text-[14px] text-light-muted mt-0.5">1 Crore homes</p>
        </div>
      </div>

      {/* Embedded Subsidies Card */}
      <div>
        <div className="mb-4">
          <h2 className="text-[24px] font-bold text-light-text tracking-tight">
            Subsidy Slabs & Calculator
          </h2>
          <p className="text-[15.5px] text-light-muted mt-1">
            Explore subsidies across Residential, Housing Societies, Agricultural, and Commercial sectors.
          </p>
        </div>
        <GovernmentSubsidiesCard systemCapacity={3.5} />
      </div>

      {/* State-Level Additional Subsidies */}
      <div className="lc-card space-y-5 p-6 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-brand/10 text-brand flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-light-text">
              State Government Top-Up Subsidies
            </h3>
            <p className="text-[14.5px] text-light-muted mt-0.5">
              Select states offer supplementary grants or generation-based incentives above Central DBT.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15.5px] border-collapse">
            <thead>
              <tr className="border-b border-light-border text-[13.5px] uppercase font-bold text-light-muted">
                <th className="py-3 px-4">State / Agency</th>
                <th className="py-3 px-4">Central Subsidy</th>
                <th className="py-3 px-4">State Top-Up</th>
                <th className="py-3 px-4">Total Benefit</th>
                <th className="py-3 px-4">Conditions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {stateSubsidies.map((s, idx) => (
                <tr key={idx} className="hover:bg-light-surface transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-light-text">{s.state}</td>
                  <td className="py-3.5 px-4 text-light-muted">{s.central}</td>
                  <td className="py-3.5 px-4 font-bold text-brand">{s.stateExtra}</td>
                  <td className="py-3.5 px-4 font-bold text-light-text">{s.total}</td>
                  <td className="py-3.5 px-4 text-[14.5px] text-light-muted">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="lc-card space-y-4 p-6 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-btn bg-brand/10 text-brand flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-[19px] font-bold text-light-text">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="divide-y divide-light-border">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-[16px] font-medium text-light-text group-hover:text-brand transition-colors">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-brand shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-light-muted shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-[15px] text-light-muted mt-2.5 pl-3 border-l-2 border-brand leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Banner */}
      <div className="lc-card p-8 text-center space-y-4 shadow-subtle">
        <h3 className="text-[24px] font-bold text-light-text">
          Check Your Exact Rooftop Subsidy
        </h3>
        <p className="text-[16px] text-light-muted max-w-lg mx-auto leading-relaxed">
          Calculate your recommended solar capacity, net investment after subsidy, and payback timeline in minutes.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/onboarding"
            className="lc-btn-brand text-[16px] py-3 px-6 font-medium"
          >
            <span>Run Solar Sizing Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://pmsuryaghar.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="lc-btn-secondary text-[16px] py-3 px-6 font-medium"
          >
            <span>National Portal (pmsuryaghar.gov.in)</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

    </div>
  );
};

export default GovernmentSubsidiesPage;
