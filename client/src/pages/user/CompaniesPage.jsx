import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Scale,
  Sparkles,
  Award,
  ArrowRight,
  Filter,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  Plus,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { DEFAULT_COMPANIES } from '../../data/defaultCompanies';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedTech, setSelectedTech] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Comparison selection
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // Expanded card IDs for full details
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchCompanies();
  }, [selectedType, selectedTier, selectedTech, sortBy]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedTier !== 'all') params.tier = selectedTier;
      if (selectedTech !== 'all') params.technology = selectedTech;
      if (search) params.search = search;
      if (sortBy) params.sort = sortBy;

      const data = await companyService.getCompanies(params);
      let list = Array.isArray(data) ? data : (data?.companies || []);

      if (list.length === 0 && !search && selectedType === 'all' && selectedTier === 'all' && selectedTech === 'all') {
        list = DEFAULT_COMPANIES;
      }

      if (sortBy === 'efficiency') {
        list = [...list].sort((a, b) => (b.efficiencyPercent || 0) - (a.efficiencyPercent || 0));
      }

      setCompanies(list);
    } catch (err) {
      console.warn('Recovered with default solar companies:', err);
      setCompanies(DEFAULT_COMPANIES);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const toggleCompare = (company) => {
    if (selectedForCompare.some((c) => c._id === company._id)) {
      setSelectedForCompare(selectedForCompare.filter((c) => c._id !== company._id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 solar brands side-by-side.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, company]);
    }
  };

  const toggleExpandCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const goToComparison = () => {
    if (selectedForCompare.length < 2) {
      alert('Please select at least 2 companies to compare.');
      return;
    }
    const ids = selectedForCompare.map((c) => c._id).join(',');
    navigate(`/companies/compare?ids=${ids}`);
  };

  const hasActiveFilters =
    selectedType !== 'all' ||
    selectedTier !== 'all' ||
    selectedTech !== 'all' ||
    search !== '' ||
    sortBy !== 'rating';

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedTier('all');
    setSelectedTech('all');
    setSearch('');
    setSortBy('rating');
  };

  const topMatch = companies.length > 0 ? companies[0] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-14">
      {/* 1. TOP SPOTLIGHT: "RECOMMENDED FOR YOU" */}
      {topMatch && !hasActiveFilters && (
        <div className="bg-gradient-to-r from-emerald-50/50 via-white to-white border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended For You
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Top engineering & reliability score
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {topMatch.name}
              </h2>
              <p className="text-base text-slate-700 font-medium">
                {topMatch.bestFor}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 pt-1">
                <span>📍 {topMatch.headquarters}</span>
                <span className="text-emerald-800 font-bold">⭐ {topMatch.evaluation?.overallScore || '9.4'}/10 Overall Rating</span>
                <span className="text-slate-900 font-bold">💰 {topMatch.priceDisplay}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => toggleCompare(topMatch)}
                className={`flex-1 lg:flex-initial text-sm py-2.5 px-5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedForCompare.some((c) => c._id === topMatch._id)
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {selectedForCompare.some((c) => c._id === topMatch._id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Comparison</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Compare</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => toggleExpandCard(topMatch._id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLOATING / INLINE COMPARISON BAR */}
      {selectedForCompare.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-500/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {selectedForCompare.length} of 3 brands selected for comparison
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                {selectedForCompare.map((c) => (
                  <span
                    key={c._id}
                    className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white/20 text-white"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="text-xs font-semibold text-white/70 hover:text-white px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={goToComparison}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>Compare Companies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. SEARCH & FILTERS */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search solar companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Models</option>
              <option value="Both">Turnkey EPC</option>
              <option value="Manufacturer">Manufacturers</option>
              <option value="Installer/EPC">Installers Only</option>
            </select>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Tiers</option>
              <option value="Tier-1">Tier-1 Bankable</option>
              <option value="Premium">Premium</option>
              <option value="Value">Value</option>
            </select>

            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="all">All Technologies</option>
              <option value="TOPCon">N-Type TOPCon</option>
              <option value="Bifacial">Bifacial</option>
              <option value="Mono PERC">Mono PERC</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="rating">Sort: Rating</option>
              <option value="efficiency">Sort: Efficiency</option>
              <option value="warranty">Sort: Warranty</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:underline px-2 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. COMPANY CARDS (STREAMLINED & EXPANDABLE) */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Loading solar companies..." />
        </div>
      ) : error ? (
        <div className="bg-white border border-slate-300 rounded-2xl p-8 text-center text-rose-600 shadow-sm">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchCompanies}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl mt-3"
          >
            Retry
          </button>
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded-2xl p-12 text-center text-slate-500 shadow-sm space-y-2">
          <Building2 className="w-10 h-10 mx-auto text-slate-400" />
          <p className="text-lg font-bold text-slate-900">No solar companies match your filters.</p>
          <p className="text-sm">Try clearing your search terms or filters.</p>
          <button
            onClick={resetFilters}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl mt-2"
          >
            Show All Companies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companies.map((company) => {
            const isSelected = selectedForCompare.some((c) => c._id === company._id);
            const isExpanded = !!expandedCards[company._id];
            const isTopRecommended = company._id === topMatch?._id;

            return (
              <div
                key={company._id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                  isTopRecommended
                    ? 'bg-gradient-to-br from-emerald-50/40 via-white to-white border-2 border-emerald-400/80 shadow-md'
                    : 'bg-white border border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  {/* Company Header & Overall Rating */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {company.type}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {company.tier}
                        </span>
                        {isTopRecommended && (
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                            ★ Recommended
                          </span>
                        )}
                      </div>
                      <h3 className="text-[19px] sm:text-[20px] font-bold text-slate-900 tracking-tight leading-snug">
                        {company.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        📍 {company.headquarters} • Est. {company.establishedYear}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl font-extrabold text-sm border border-emerald-200 shadow-xs">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>{company.evaluation?.overallScore || '8.5'}/10</span>
                      </div>
                      <span className="text-[12px] text-slate-400 mt-0.5">Overall Rating</span>
                    </div>
                  </div>

                  {/* Recommendation/Best-For Label */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                    <p className="text-[14.5px] font-semibold text-emerald-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{company.bestFor}</span>
                    </p>
                  </div>

                  {/* Key Strength & Pricing Positioning */}
                  <div className="space-y-2.5 text-sm pt-1">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 text-sm">Key Strength:</span>
                      <span className="font-semibold text-slate-900 text-sm text-right max-w-[260px] truncate">
                        {company.advantages?.[0] || 'High bankability & performance'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 text-sm">Indicative Pricing:</span>
                      <span className="text-[15.5px] font-extrabold text-slate-900">
                        {company.priceDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Progressive Disclosure Toggle */}
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => toggleExpandCard(company._id)}
                      className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? 'Hide specifications' : 'View specifications & details'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 text-sm animate-fade-in">
                      <div className="grid grid-cols-2 gap-3.5 pb-3 border-b border-slate-200">
                        <div>
                          <span className="text-xs text-slate-500 block">Efficiency</span>
                          <span className="font-bold text-slate-900 text-base">
                            {company.efficiencyPercent ? `${company.efficiencyPercent}%` : '21.8%'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Warranty</span>
                          <span className="font-bold text-emerald-700 text-base">
                            {company.performanceWarrantyYears} Years
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Cell Technology</span>
                          <span className="font-semibold text-slate-900 text-sm">
                            {company.cellTechnology || company.panelTechnology?.join(', ') || 'Mono PERC'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Service Scope</span>
                          <span className="font-semibold text-slate-900 text-sm">
                            {company.installationAvailability}
                          </span>
                        </div>
                      </div>

                      {/* Advantages */}
                      <div>
                        <span className="font-bold text-slate-900 text-sm block mb-1.5">Key Advantages:</span>
                        <ul className="space-y-1.5 text-sm">
                          {company.advantages?.slice(0, 3).map((adv, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-800">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trade-offs */}
                      {company.disadvantages?.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-200">
                          <span className="font-bold text-amber-800 text-xs uppercase tracking-wider block mb-1">Things to note:</span>
                          <ul className="space-y-1 text-sm text-slate-600">
                            {company.disadvantages.map((dis, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{dis}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Compare Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    Verified {company.lastVerified || '2026'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(company)}
                    className={`text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Selected to Compare</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Compare</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
