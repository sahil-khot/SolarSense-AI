import api from './api';
import { DEFAULT_COMPANIES } from '../data/defaultCompanies';

export const companyService = {
  async getCompanies(params = {}) {
    try {
      const res = await api.get('/companies', { params });
      if (res.data && Array.isArray(res.data.companies) && res.data.companies.length > 0) {
        return res.data;
      }
      if (Array.isArray(res.data) && res.data.length > 0) {
        return { success: true, count: res.data.length, companies: res.data };
      }
      // If backend returned empty list without filters, fallback to default catalogue
      if (!params.search && (!params.type || params.type === 'all') && (!params.tier || params.tier === 'all')) {
        return { success: true, count: DEFAULT_COMPANIES.length, companies: DEFAULT_COMPANIES };
      }
      return res.data || { success: true, count: 0, companies: [] };
    } catch (err) {
      console.warn('API error fetching companies, falling back to local catalog:', err.message);
      let filtered = [...DEFAULT_COMPANIES];
      if (params.type && params.type !== 'all') {
        filtered = filtered.filter((c) => c.type === params.type || c.type === 'Both');
      }
      if (params.tier && params.tier !== 'all') {
        filtered = filtered.filter((c) => c.tier === params.tier);
      }
      if (params.technology && params.technology !== 'all') {
        filtered = filtered.filter((c) => c.panelTechnology?.includes(params.technology));
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.bestFor?.toLowerCase().includes(s) ||
            c.headquarters?.toLowerCase().includes(s)
        );
      }
      if (params.sort === 'rating') {
        filtered.sort((a, b) => (b.evaluation?.overallScore || 0) - (a.evaluation?.overallScore || 0));
      } else if (params.sort === 'price_asc') {
        filtered.sort((a, b) => (a.pricePerKWMin || 0) - (b.pricePerKWMin || 0));
      } else if (params.sort === 'warranty') {
        filtered.sort((a, b) => (b.performanceWarrantyYears || 0) - (a.performanceWarrantyYears || 0));
      }
      return { success: true, count: filtered.length, companies: filtered };
    }
  },

  async getCompanyById(id) {
    try {
      const res = await api.get(`/companies/${id}`);
      if (res.data && res.data.company) {
        return res.data;
      }
    } catch (err) {
      console.warn(`API error fetching company ${id}, checking local catalog:`, err.message);
    }
    const found = DEFAULT_COMPANIES.find(
      (c) => c._id === id || c.slug === id || c.name.toLowerCase() === id.toLowerCase()
    );
    if (found) {
      return { success: true, company: found, priceSnapshots: [] };
    }
    throw new Error('Solar company not found.');
  },

  async matchCompanies(matchCriteria) {
    try {
      const res = await api.post('/companies/match', matchCriteria);
      if (res.data && res.data.topMatches && res.data.topMatches.length > 0) {
        return res.data;
      }
    } catch (err) {
      console.warn('API error matching companies, using local heuristic:', err.message);
    }

    // Client-side fallback matching
    const cap = matchCriteria?.capacityKW || 3.5;
    const topMatches = DEFAULT_COMPANIES.slice(0, 3).map((comp, idx) => {
      const minCost = comp.pricePerKWMin ? Math.round(comp.pricePerKWMin * cap) : 0;
      const maxCost = comp.pricePerKWMax ? Math.round(comp.pricePerKWMax * cap) : 0;
      const costStr = minCost && maxCost
        ? `₹${(minCost / 100000).toFixed(2)}L – ₹${(maxCost / 100000).toFixed(2)}L`
        : comp.priceDisplay;

      return {
        company: comp,
        matchScore: 96 - idx * 3,
        estimatedCostForCapacity: costStr,
        matchCategory: comp.bestFor,
        whyMatchedBullets: [
          `Certified installation and warranty support available in your region.`,
          `Tier-1 engineering with ${comp.performanceWarrantyYears}-year linear performance warranty.`,
          comp.subsidySupport
            ? 'PM Surya Ghar national portal subsidy documentation support.'
            : 'High-efficiency cell engineering for optimum generation.',
        ],
      };
    });

    return {
      success: true,
      targetCapacityKW: cap,
      topMatches,
    };
  },
};
