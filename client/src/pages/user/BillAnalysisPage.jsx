import React, { useState, useEffect, useRef } from 'react';
import { Trash2, FileText, FileSpreadsheet, Eye, Zap, ArrowRight } from 'lucide-react';
import { billService } from '../../services/billService';
import BillUploadCard from '../../components/bill/BillUploadCard';
import BillInsightsCard from '../../components/bill/BillInsightsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

const BillAnalysisPage = () => {
  const [bills, setBills] = useState([]);
  const [activeBill, setActiveBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const analysisRef = useRef(null);

  const fetchBills = async () => {
    try {
      const res = await billService.getBills();
      if (res.success && res.bills) {
        setBills(res.bills);
        if (res.bills.length > 0 && !activeBill) {
          setActiveBill(res.bills[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAnalysisComplete = (newBill) => {
    setBills((prev) => [newBill, ...prev.filter((b) => b._id !== newBill._id)]);
    setActiveBill(newBill);
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleViewBill = (bill) => {
    setActiveBill(bill);
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm('Delete this bill analysis?')) {
      try {
        await billService.deleteBill(id);
        const updated = bills.filter((b) => b._id !== id);
        setBills(updated);
        if (activeBill?._id === id) {
          setActiveBill(updated[0] || null);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving electricity bill history..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Main Page Heading & Subhead */}
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-[34px] font-bold text-light-text tracking-tight">
          Upload your electricity bill
        </h2>
        <p className="text-base sm:text-secondary max-w-3xl">
          We'll read the bill and use the information to estimate your solar needs.
        </p>
      </div>

      {/* Bill Upload Card */}
      <BillUploadCard onAnalysisComplete={handleAnalysisComplete} />

      {/* Active Bill Mini-Dashboard */}
      {activeBill && (
        <div ref={analysisRef} id="active-analysis" className="scroll-mt-8">
          <BillInsightsCard bill={activeBill} />
        </div>
      )}

      {/* Analyzed Bills History */}
      <div className="lc-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-light-border gap-2">
          <div>
            <h3 className="text-2xl font-bold text-light-text tracking-tight">
              Past Bills ({bills.length})
            </h3>
            <p className="text-sm text-light-muted mt-1">
              Select any previously analyzed bill below to reload its summary and solar recommendation.
            </p>
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-light-surface flex items-center justify-center text-light-muted mb-3 border border-light-border">
              <FileSpreadsheet className="w-6 h-6 text-brand" />
            </div>
            <p className="text-lg font-bold text-light-text">
              No bills analyzed yet
            </p>
            <p className="text-sm text-light-muted max-w-md mt-1">
              Upload a bill above to see your electricity use and solar potential.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View: Clean Expandable Cards */}
            <div className="sm:hidden space-y-3">
              {bills.map((b) => {
                const isActive = activeBill?._id === b._id;
                const capacityRange =
                  b.aiInsights?.solarPotential?.recommendedCapacityRange ||
                  b.aiInsights?.recommendedCapacityRange ||
                  (b.unitsConsumed
                    ? `${Math.max(1, Math.floor(b.unitsConsumed / 112))} – ${Math.max(2, Math.ceil(b.unitsConsumed / 112))} kW`
                    : '2 – 3 kW');

                return (
                  <div
                    key={b._id}
                    onClick={() => handleViewBill(b)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-brand bg-brand/5 ring-1 ring-brand'
                        : 'border-light-border bg-white hover:border-brand/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand shrink-0" />
                        <span className="font-bold text-sm text-light-text truncate max-w-[180px]">
                          {b.fileName || 'Uploaded Bill'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                        {capacityRange}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-light-border my-2">
                      <div>
                        <span className="text-light-muted block">Period</span>
                        <span className="font-semibold text-light-text">{b.billingMonth} {b.billingYear || ''}</span>
                      </div>
                      <div>
                        <span className="text-light-muted block">Usage</span>
                        <span className="font-bold text-light-text">{b.unitsConsumed ? `${b.unitsConsumed} kWh` : 'Not available'}</span>
                      </div>
                      <div>
                        <span className="text-light-muted block">Amount</span>
                        <span className="font-bold text-light-text">{b.totalAmount ? formatCurrency(b.totalAmount) : 'Not available'}</span>
                      </div>
                      <div>
                        <span className="text-light-muted block">Rate</span>
                        <span className="font-semibold text-light-text">{b.tariff ? `₹${b.tariff}/u` : '₹7.50/u'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleViewBill(b)}
                        className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isActive ? 'Currently viewing' : 'View summary'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBill(b._id);
                        }}
                        className="p-1.5 text-light-muted hover:text-rose-600 rounded-lg"
                        title="Delete bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Standard Table */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-light-border">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-border text-xs uppercase font-bold text-light-muted bg-light-surface tracking-wider">
                    <th className="py-3 px-4">Bill Document</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Usage</th>
                    <th className="py-3 px-4">Bill Amount</th>
                    <th className="py-3 px-4">Estimated Rate</th>
                    <th className="py-3 px-4">Recommended Solar</th>
                    <th className="py-3 px-4 text-center">Action</th>
                    <th className="py-3 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border text-sm text-light-text">
                  {bills.map((b) => {
                    const isActive = activeBill?._id === b._id;
                    const capacityRange =
                      b.aiInsights?.solarPotential?.recommendedCapacityRange ||
                      b.aiInsights?.recommendedCapacityRange ||
                      (b.unitsConsumed
                        ? `${Math.max(1, Math.floor(b.unitsConsumed / 112))} – ${Math.max(2, Math.ceil(b.unitsConsumed / 112))} kW`
                        : '2 – 3 kW');
                    (b.unitsConsumed
                      ? `${Math.max(1, Math.floor(b.unitsConsumed / 112))} – ${Math.max(2, Math.ceil(b.unitsConsumed / 112))} kW`
                      : '2 – 3 kW');

                  return (
                    <tr
                      key={b._id}
                      onClick={() => handleViewBill(b)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#DCFCE7]/40 font-bold'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-[#16A34A] shrink-0" />
                          <span className="truncate max-w-[200px] font-extrabold text-[#111827] text-sm sm:text-base">
                            {b.fileName || 'Uploaded Bill'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#374151]">
                        {b.billingMonth} {b.billingYear || ''}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-[#111827]">
                        {b.unitsConsumed ? `${b.unitsConsumed.toLocaleString('en-IN')} kWh` : 'Not available'}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-[#111827]">
                        {b.totalAmount ? formatCurrency(b.totalAmount) : 'Not available'}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#374151]">
                        {b.tariff ? `₹${b.tariff}/unit` : (b.totalAmount && b.unitsConsumed ? `₹${(Math.round((b.totalAmount / b.unitsConsumed) * 100) / 100)}/unit` : '₹7.50/unit')}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                          <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>{capacityRange}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleViewBill(b)}
                          className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                            isActive
                              ? 'bg-[#16A34A] text-white'
                              : 'bg-white text-[#111827] hover:bg-[#DCFCE7] hover:text-[#15803D] hover:border-[#86EFAC] border border-[#D1D5DB]'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          <span>{isActive ? 'Active' : 'View'}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleDeleteBill(b._id)}
                          className="p-2 rounded-xl text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                          title="Delete bill record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  </div>
  );
};

export default BillAnalysisPage;
