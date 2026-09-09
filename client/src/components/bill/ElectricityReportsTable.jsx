import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ElectricityReportsTable = ({ bills = [], onDeleteBill }) => {
  const [selectedReport, setSelectedReport] = useState(null);

  if (!bills || bills.length === 0) {
    return (
      <div className="lc-card p-8 text-center">
        <FileText className="w-10 h-10 text-light-muted dark:text-dark-muted mx-auto mb-3 opacity-60" />
        <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">No electricity reports yet</h3>
        <p className="text-helper text-light-muted dark:text-dark-muted mt-1 mb-5 max-w-sm mx-auto">
          Upload an electricity bill to diagnose your tariff rate, seasonal spikes, and calculate potential savings.
        </p>
        <Link
          to="/bill-analysis"
          className="inline-flex items-center gap-2 lc-btn-brand text-body font-medium"
        >
          <span>Upload Your First Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="lc-card p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-light-border dark:border-dark-border">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">
              My Electricity Reports
            </h3>
            <span className="text-label font-medium text-light-muted dark:text-dark-muted px-2 py-0.5 rounded-btn lc-surface">
              {bills.length} Records
            </span>
          </div>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
            Previous monthly bills and diagnostic solar suitability evaluations
          </p>
        </div>

        <Link
          to="/bill-analysis"
          className="inline-flex items-center gap-1.5 text-body font-medium text-brand-green hover:text-brand-green/80 transition-colors"
        >
          <span>Analyze Another Bill</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body border-collapse">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-label uppercase font-semibold text-light-muted dark:text-dark-muted tracking-wider">
              <th className="py-3 px-3">Month & Year</th>
              <th className="py-3 px-3">Bill Amount</th>
              <th className="py-3 px-3">Units Used</th>
              <th className="py-3 px-3">Solar Potential</th>
              <th className="py-3 px-3">Uploaded Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {bills.map((bill) => (
              <tr key={bill._id} className="hover:bg-light-surface/70 dark:hover:bg-dark-surface/70 transition-colors">
                <td className="py-3 px-3 font-medium text-light-text dark:text-dark-text">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-green shrink-0" />
                    <span>{bill.billingMonth} {bill.billingYear}</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-semibold text-light-text dark:text-dark-text">
                  {formatCurrency(bill.totalAmount)}
                </td>
                <td className="py-3 px-3 text-light-muted dark:text-dark-muted">
                  {bill.unitsConsumed} units
                </td>
                <td className="py-3 px-3">
                  <span className="text-label font-medium px-2 py-0.5 rounded-btn bg-brand-green/10 text-brand-green border border-brand-green/20">
                    {bill.aiInsights?.solarSuitability || 'Good'}
                  </span>
                </td>
                <td className="py-3 px-3 text-light-muted dark:text-dark-muted text-label">
                  {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="py-3 px-3">
                  <span className="text-label font-medium text-brand-green flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Analyzed
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedReport(bill)}
                      className="px-2.5 py-1 rounded-btn lc-btn-secondary text-label font-medium transition-colors cursor-pointer"
                    >
                      View Report
                    </button>
                    {onDeleteBill && (
                      <button
                        onClick={() => onDeleteBill(bill._id)}
                        className="p-1 rounded-btn text-light-muted dark:text-dark-muted hover:text-rose-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg lc-card p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <h3 className="text-card-title font-semibold text-light-text dark:text-dark-text">
                Electricity Diagnostic: {selectedReport.billingMonth} {selectedReport.billingYear}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text p-1 rounded-btn transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label text-light-muted dark:text-dark-muted uppercase font-medium">Total Bill Paid</p>
                <p className="text-stat font-bold text-light-text dark:text-dark-text mt-0.5">{formatCurrency(selectedReport.totalAmount)}</p>
              </div>
              <div className="p-3 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label text-light-muted dark:text-dark-muted uppercase font-medium">Electricity Used</p>
                <p className="text-stat font-bold text-light-text dark:text-dark-text mt-0.5">{selectedReport.unitsConsumed} <span className="text-helper font-normal">units</span></p>
              </div>
              <div className="p-3 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label text-light-muted dark:text-dark-muted uppercase font-medium">Effective Tariff</p>
                <p className="text-body font-semibold text-brand-green mt-0.5">₹{selectedReport.tariff}/unit</p>
              </div>
              <div className="p-3 rounded-card lc-surface border border-light-border dark:border-dark-border">
                <p className="text-label text-light-muted dark:text-dark-muted uppercase font-medium">Recommended Size</p>
                <p className="text-body font-semibold text-light-text dark:text-dark-text mt-0.5">{selectedReport.aiInsights?.recommendedCapacityRange || '3 – 5 kW'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-card lc-surface border border-light-border dark:border-dark-border text-body text-light-text dark:text-dark-text space-y-1.5 leading-relaxed">
              <p className="font-semibold flex items-center gap-1.5 text-brand-green">
                <Sparkles className="w-4 h-4" />
                SolarSense Recommendation:
              </p>
              <p className="text-helper text-light-muted dark:text-dark-muted">{selectedReport.aiInsights?.recommendation || selectedReport.aiInsights?.summary}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to="/solar-recommendation"
                onClick={() => setSelectedReport(null)}
                className="lc-btn-brand text-body font-medium"
              >
                Run Sizing Engine with This Bill →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricityReportsTable;
