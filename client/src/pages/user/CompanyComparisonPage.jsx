import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Scale,
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  Award,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CompanyComparisonPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [allAvailableCompanies, setAllAvailableCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all companies for quick add/swap dropdown
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await companyService.getCompanies({ sort: 'rating' });
        setAllAvailableCompanies(res.companies || []);
      } catch (err) {
        console.warn('Could not load company dropdown list:', err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      loadSelectedCompanies(ids);
    } else {
      // Default to top 3 companies
      loadDefaultTopCompanies();
    }
  }, [searchParams]);

  const loadSelectedCompanies = async (ids) => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await Promise.all(
        ids.map((id) => companyService.getCompanyById(id).catch(() => null))
      );
      const valid = fetched.filter((f) => f && f.company).map((f) => f.company);
      if (valid.length === 0) {
        // Fallback to top companies if bad IDs
        loadDefaultTopCompanies();
      } else {
        setCompanies(valid);
      }
    } catch (err) {
      console.error('Comparison load error:', err);
      setError('Failed to load comparison data.');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultTopCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await companyService.getCompanies({ sort: 'rating' });
      const top = (res.companies || []).slice(0, 3);
      setCompanies(top);
      if (top.length > 0) {
        setSearchParams({ ids: top.map((c) => c._id).join(',') });
      }
    } catch (err) {
      console.error('Default comparison error:', err);
      setError('Failed to load comparison data.');
    } finally {
      setLoading(false);
    }
  };

  const removeCompany = (id) => {
    const remaining = companies.filter((c) => c._id !== id);
    setCompanies(remaining);
    setSearchParams({ ids: remaining.map((c) => c._id).join(',') });
  };

  const addCompany = (id) => {
    if (!id) return;
    const target = allAvailableCompanies.find((c) => c._id === id);
    if (!target) return;
    if (companies.some((c) => c._id === id)) return;
    if (companies.length >= 3) {
      alert('You can compare a maximum of 3 solar brands side-by-side.');
      return;
    }
    const updated = [...companies, target];
    setCompanies(updated);
    setSearchParams({ ids: updated.map((c) => c._id).join(',') });
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner text="Building technical side-by-side brand comparison matrix..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Solar Companies Directory</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-light-text flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-brand" />
            <span>Side-by-Side Solar Brand Comparison Matrix</span>
          </h2>
          <p className="text-sm text-light-muted mt-0.5">
            Objective engineering comparison across pricing, warranties, panel efficiency, <strong>advantages</strong>, and <strong>disadvantages</strong>.
          </p>
        </div>

        {/* Quick Add Company Selector */}
        {companies.length < 3 && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-light-surface p-2 rounded-lg border border-light-border shadow-xs">
            <Plus className="w-4 h-4 text-brand" />
            <select
              onChange={(e) => {
                addCompany(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="lc-select text-xs py-1 px-2"
            >
              <option value="" disabled>
                + Add Company to Compare ({companies.length}/3)
              </option>
              {allAvailableCompanies
                .filter((c) => !companies.some((existing) => existing._id === c._id))
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.type})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {error ? (
        <div className="lc-card p-6 text-rose-600 text-center font-medium">{error}</div>
      ) : companies.length < 2 ? (
        <div className="lc-card p-8 text-center text-light-text space-y-4 max-w-md mx-auto">
          <Scale className="w-12 h-12 mx-auto text-brand opacity-60" />
          <h3 className="text-lg font-bold">Select at Least 2 Brands</h3>
          <p className="text-xs text-light-muted">
            Choose at least 2 solar brands to evaluate technical specifications, pricing, and pros/cons side-by-side.
          </p>
          <div className="flex justify-center gap-2">
            <Link to="/companies" className="lc-btn-brand text-xs px-4 py-2">
              Browse All Brands
            </Link>
            <button
              onClick={loadDefaultTopCompanies}
              className="lc-btn-secondary text-xs px-4 py-2"
            >
              Compare Top 3 Brands
            </button>
          </div>
        </div>
      ) : (
        <div className="lc-card overflow-hidden shadow-sm border border-slate-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4.5 w-1/4 text-xs font-bold uppercase tracking-wider text-slate-500 align-top">
                    Brand & Rating
                  </th>
                  {companies.map((c) => (
                    <th key={c._id} className="p-4.5 text-center min-w-[240px] relative align-top">
                      {companies.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCompany(c._id)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="font-bold text-lg text-slate-900">
                        {c.name}
                      </div>
                      <div className="text-xs text-brand-green font-bold mt-0.5">
                        {c.bestFor}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-2xs">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{c.evaluation?.overallScore} / 10</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-sm">
                {/* SECTION 1: PROS & ADVANTAGES */}
                <tr className="bg-emerald-50/40">
                  <td className="p-4.5 font-bold text-emerald-900 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <span>Key Advantages (Pros)</span>
                    </div>
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4.5 align-top">
                      <ul className="space-y-2 text-left">
                        {c.advantages && c.advantages.length > 0 ? (
                          c.advantages.map((adv, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-800 text-[13.5px] leading-relaxed">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic text-xs">Standard Tier-1 manufacturing benchmarks.</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* SECTION 2: CONS & DISADVANTAGES */}
                <tr className="bg-amber-50/40">
                  <td className="p-4.5 font-bold text-amber-900 text-sm">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                      <span>Trade-offs & Watchouts (Cons)</span>
                    </div>
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4.5 align-top">
                      <ul className="space-y-2 text-left">
                        {c.disadvantages && c.disadvantages.length > 0 ? (
                          c.disadvantages.map((dis, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700 text-[13.5px] leading-relaxed">
                              <span className="text-amber-600 font-bold shrink-0">•</span>
                              <span>{dis}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic text-xs">No major adverse trade-offs reported.</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Business Model */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Business Model
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center text-light-text">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {c.type}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Turnkey Price / kW */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Turnkey Price / kW
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center font-bold text-sm text-light-text">
                      {c.priceDisplay}
                      <div className="text-[10px] text-light-muted font-normal mt-0.5">
                        Verified {c.lastVerified}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Est. 3 kW Gross Outlay */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Est. 3 kW Residential System Outlay
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center text-light-text font-medium">
                      {c.pricePerKWMin && c.pricePerKWMax
                        ? `₹${(c.pricePerKWMin * 3).toLocaleString('en-IN')} – ₹${(c.pricePerKWMax * 3).toLocaleString('en-IN')}`
                        : 'Quotation required'}
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        Eligible for ₹78,000 Surya Ghar DBT
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Est. 5 kW Outlay */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Est. 5 kW System Outlay
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center text-light-text font-medium">
                      {c.pricePerKWMin && c.pricePerKWMax
                        ? `₹${(c.pricePerKWMin * 5).toLocaleString('en-IN')} – ₹${(c.pricePerKWMax * 5).toLocaleString('en-IN')}`
                        : 'Quotation required'}
                    </td>
                  ))}
                </tr>

                {/* Cell & Panel Technology */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Cell Architecture
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center font-medium text-light-text">
                      {c.cellTechnology || c.panelTechnology?.join(', ')}
                    </td>
                  ))}
                </tr>

                {/* Peak Module Efficiency */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Module Conversion Efficiency (%)
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center font-bold text-slate-900">
                      {c.efficiencyPercent ? `${c.efficiencyPercent}%` : 'Standard ALMM (>21%)'}
                    </td>
                  ))}
                </tr>

                {/* Annual Linear Degradation */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Annual Degradation Rate
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center font-semibold text-emerald-600">
                      {c.annualDegradation || 'Standard (<0.6%/yr)'}
                    </td>
                  ))}
                </tr>

                {/* Product Warranty */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Product Workmanship Warranty
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center font-semibold text-light-text">
                      {c.productWarrantyYears} Years
                    </td>
                  ))}
                </tr>

                {/* Performance Warranty */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Linear Performance Warranty
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center font-bold text-brand">
                      {c.performanceWarrantyYears} Years Guaranteed
                    </td>
                  ))}
                </tr>

                {/* Inverter Compatibility */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Inverter Ecosystem & Partners
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center text-slate-600 text-xs">
                      {c.inverterPartners?.join(', ') || 'Universal ALMM String Inverters'}
                    </td>
                  ))}
                </tr>

                {/* Installation Availability */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Geographic Service Coverage
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center text-light-text font-medium">
                      {c.installationAvailability}
                    </td>
                  ))}
                </tr>

                {/* PM Surya Ghar Subsidy Support */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    PM Surya Ghar Subsidy Assistance
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center">
                      {c.subsidySupport ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <X className="w-4 h-4" /> No (RFP Only)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* DISCOM Net Metering Liaison */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    DISCOM Net-Metering Liaison
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center">
                      {c.netMeteringSupport ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <X className="w-4 h-4" /> No (Via 3rd Party)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Bank Financing */}
                <tr>
                  <td className="p-4 font-semibold text-light-text bg-slate-50/50">
                    Bank Solar Loan / EMI Available
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center">
                      {c.financingAvailable ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                          <Check className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <X className="w-4 h-4" /> No
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Official Quote Action */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-semibold text-light-text">
                    Official Quotation Portal
                  </td>
                  {companies.map((c) => (
                    <td key={c._id} className="p-4 text-center">
                      <a
                        href={c.quoteUrl || c.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lc-btn-brand text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Request Official Quote</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Source Attribution Disclaimer */}
          <div className="p-4 bg-slate-50 border-t border-light-border text-xs text-light-muted flex items-start gap-2">
            <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p>
              Data derived from MNRE ALMM published lists, company investor disclosures, and warranty datasheets.
              SolarSense ratings reflect independent engineering assessments and not paid commercial endorsements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyComparisonPage;
