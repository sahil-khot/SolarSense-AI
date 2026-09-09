import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Globe, Check, AlertCircle, ArrowRight, Scale, ShieldCheck } from 'lucide-react';

const TopSolarCompaniesCard = () => {
  const [activeTab, setActiveTab] = useState('india'); // 'india' | 'world'

  const companiesIndia = [
    {
      name: 'Tata Power Solar',
      country: 'India (Mumbai, Maharashtra)',
      tag: 'Most Trusted Brand',
      tier: 'Tier-1',
      rating: '9.3/10',
      pros: '35+ yrs legacy, end-to-end turnkey EPC, DISCOM net-metering liaison, nationwide service.',
      cons: 'Premium turnkey price (₹58k–₹65k/kW), stricter roof structural criteria.',
      specialty: 'Integrated EPC Solutions & High-Reliability Modules',
      website: 'https://www.tatapowersolar.com',
      compareSlug: 'tata-power-solar',
    },
    {
      name: 'Waaree Energies',
      country: 'India (Surat / Mumbai)',
      tag: 'Largest Capacity',
      tier: 'Tier-1',
      rating: '9.1/10',
      pros: "India's largest manufacturer (12+ GW), generous 30-yr bifacial warranty, 500+ franchise stores.",
      cons: 'Installation craftsmanship depends on local franchisee partner.',
      specialty: 'High-Volume Module Manufacturing & Export',
      website: 'https://www.waaree.com',
      compareSlug: 'waaree-energies',
    },
    {
      name: 'Adani Solar',
      country: 'India (Mundra, Gujarat)',
      tag: 'Gigafactory Scale',
      tier: 'Tier-1',
      rating: '8.9/10',
      pros: 'Vertically integrated Mundra plant, up to 22.8% TOPCon efficiency, heavy wind resistance.',
      cons: 'Focused on large developers; residential requires 3rd-party EPC contractors.',
      specialty: 'Vertically Integrated Solar Cells & Bifacial Modules',
      website: 'https://www.adanisolar.com',
      compareSlug: 'adani-solar',
    },
    {
      name: 'Vikram Solar',
      country: 'India (Kolkata, West Bengal)',
      tag: 'Durability Benchmark',
      tier: 'Tier-1',
      rating: '8.8/10',
      pros: 'Tier-1 BloombergNEF, low temperature coefficient for Indian summers, 27-yr warranty.',
      cons: 'Suryava TOPCon series has higher price tag; smaller retail footprint.',
      specialty: 'Tier-1 Mono PERC & Bifacial Modules',
      website: 'https://www.vikramsolar.com',
      compareSlug: 'vikram-solar',
    },
    {
      name: 'Loom Solar',
      country: 'India (Faridabad, Haryana)',
      tag: 'Compact Roof Specialist',
      tier: 'Tier-1',
      rating: '8.7/10',
      pros: 'Shark Bifacial modules generate from front and back, space-saving for smaller urban rooftops.',
      cons: 'Slightly higher cost per watt; specialized mounting required for maximum bifacial gain.',
      specialty: 'High-Efficiency Bifacial & Monocrystalline Panels',
      website: 'https://www.loomsolar.com',
      compareSlug: 'loom-solar',
    },
  ];

  const companiesWorld = [
    {
      name: 'LONGi Solar',
      country: 'Global (Xi\'an, China)',
      tag: 'Global Volume Leader',
      tier: 'Tier-1 BNEF',
      rating: '9.4/10',
      pros: 'World’s highest R&D expenditure, Hi-MO 6 series sets efficiency world records, lowest degradation.',
      cons: 'Subject to Indian BCD customs tariff; availability fluctuates with import quota.',
      specialty: 'Ultra-High Efficiency Monocrystalline PV Cells',
      website: 'https://www.longi.com',
    },
    {
      name: 'JinkoSolar',
      country: 'Global (Shanghai, China)',
      tag: 'N-Type Pioneer',
      tier: 'Tier-1 BNEF',
      rating: '9.2/10',
      pros: 'Tiger Neo N-type modules achieve 22.5%+ efficiency with superior high-heat tolerance.',
      cons: 'Import duties make domestic Indian panels more cost-effective for subsidized residential.',
      specialty: 'N-Type TOPCon Cell & Panel Technology',
      website: 'https://www.jinkosolar.com',
    },
    {
      name: 'Enphase Energy',
      country: 'Global / USA (Fremont, CA)',
      tag: 'Premium Microinverters',
      tier: 'Premium Tech',
      rating: '9.5/10',
      pros: 'Panel-level MPPT eliminates shade loss, 25-yr microinverter warranty, zero high-voltage DC on roof.',
      cons: 'Higher initial hardware investment compared to centralized string inverters.',
      specialty: 'Microinverter Systems & Smart Home Energy Management',
      website: 'https://www.enphase.com',
    },
    {
      name: 'SolarEdge',
      country: 'Global / Israel (Herzliya)',
      tag: 'DC Optimizer Specialist',
      tier: 'Tier-1 Tech',
      rating: '9.1/10',
      pros: 'Individual module monitoring, built-in arc-fault protection, excellent safety shutdown.',
      cons: 'Proprietary power optimizers required for each panel.',
      specialty: 'DC Optimized Inverter Systems & EV Charging',
      website: 'https://www.solaredge.com',
    },
    {
      name: 'Sungrow Power',
      country: 'Global (Hefei, China)',
      tag: 'Global Inverter Giant',
      tier: 'Tier-1 BNEF',
      rating: '9.0/10',
      pros: 'World’s most bankable inverter brand, extensive Indian support network, 98.6% efficiency.',
      cons: 'Residential monitoring software requires technical familiarization.',
      specialty: 'High-Reliability String & Hybrid Inverters',
      website: 'https://www.sungrowpower.com',
    },
  ];

  const currentList = activeTab === 'india' ? companiesIndia : companiesWorld;

  return (
    <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D1D5DB]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-2xl sm:text-[25px] font-extrabold text-[#111827] tracking-tight">
              Famous Solar Companies & Trade-off Analysis
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              ALMM & Tier-1 Evaluated
            </span>
          </div>
          <p className="text-base text-[#374151] mt-1 font-normal">
            Independent engineering breakdown of advantages (pros) and trade-offs (cons) for leading solar brands
          </p>
        </div>

        {/* Tab Switcher & Directory Link */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-[#F8FAFC] border border-[#D1D5DB] rounded-xl">
            <button
              onClick={() => setActiveTab('india')}
              className={`px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                activeTab === 'india'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              India 🇮🇳
            </button>
            <button
              onClick={() => setActiveTab('world')}
              className={`px-4 py-2 rounded-lg text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                activeTab === 'world'
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              World 🌍
            </button>
          </div>

          <Link
            to="/companies"
            className="text-base font-bold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1.5 hidden sm:inline-flex"
          >
            <span>Full Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentList.map((comp, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-[#D1D5DB] hover:border-[#16A34A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-[#15803D] px-2.5 py-1 rounded-lg bg-[#DCFCE7] border border-[#86EFAC]">
                  {comp.tag}
                </span>
                <span className="text-sm font-extrabold text-[#111827] bg-[#F8FAFC] border border-[#D1D5DB] px-3 py-1 rounded-full">
                  {comp.rating}
                </span>
              </div>

              <h4 className="text-xl font-extrabold text-[#111827]">{comp.name}</h4>
              <p className="text-sm font-semibold text-[#4B5563] mt-0.5">{comp.country}</p>

              <div className="my-3.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#D1D5DB] text-sm">
                <p className="text-xs text-[#6B7280] uppercase font-bold tracking-wider">Core Specialty:</p>
                <p className="text-[#111827] font-extrabold mt-0.5">{comp.specialty}</p>
              </div>

              {/* ADVANTAGES PROS */}
              <div className="mt-3 text-sm space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#15803D] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Key Advantage (Pros):</span>
                </p>
                <p className="text-sm font-medium text-[#111827] leading-relaxed pl-5">
                  {comp.pros}
                </p>
              </div>

              {/* TRADE-OFFS CONS */}
              <div className="mt-3 text-sm space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Trade-off (Cons):</span>
                </p>
                <p className="text-sm font-medium text-[#374151] leading-relaxed pl-5">
                  {comp.cons}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#D1D5DB] flex items-center justify-between gap-2">
              <Link
                to="/companies"
                className="text-sm font-bold text-[#111827] hover:text-[#16A34A] flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4 text-[#16A34A]" />
                <span>Compare</span>
              </Link>

              <a
                href={comp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#16A34A] hover:text-[#15803D] hover:underline"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#D1D5DB] text-sm font-medium text-[#4B5563] leading-relaxed flex items-center gap-2.5">
        <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
        <span>
          <strong className="text-[#111827] font-bold">Independent Assessment: </strong>
          SolarSense AI does not accept sponsored rankings. Pros and cons are aggregated from MNRE ALMM registries, BIS certifications, and verified customer warranty terms.
        </span>
      </div>
    </div>
  );
};

export default TopSolarCompaniesCard;
