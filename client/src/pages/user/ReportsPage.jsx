import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Sun, Leaf, Sparkles } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { exportElementToPDF } from '../../utils/pdfExport';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatKW, formatKWh, formatNumber } from '../../utils/formatters';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await reportService.getReports();
        if (res.success && res.reports) {
          setReports(res.reports);
          if (res.reports.length > 0) {
            setSelectedReport(res.reports[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownloadPDF = async () => {
    if (!selectedReport) return;
    setDownloading(true);
    try {
      await exportElementToPDF('printable-report-container', `SolarSense_Audit_${selectedReport.reportNumber}.pdf`);
    } catch (err) {
      alert('PDF generation error: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Compiling formal engineering reports..." />
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="text-center py-16 px-4 max-w-md mx-auto flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-light-surface flex items-center justify-center text-light-muted mb-3.5 border border-light-border">
          <FileText className="w-7 h-7 text-brand" />
        </div>
        <h3 className="text-card-title font-semibold text-light-text">No Reports Generated Yet</h3>
        <p className="text-helper text-light-muted mt-1.5 mb-5 max-w-sm">
          Complete a solar assessment to generate an official engineering and cost optimization audit report.
        </p>
        <Link to="/onboarding" className="lc-btn-brand text-body font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Start Solar Assessment</span>
        </Link>
      </div>
    );
  }

  const { summaryData } = selectedReport;
  const { inputs, outputs, assumptions } = summaryData;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Executive Summary & Download Card */}
      <div className="lc-card p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-light-border gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-btn text-xs font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                Official Report
              </span>
              <span className="text-xs text-light-muted">
                Reference: #{selectedReport.reportNumber}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-light-text tracking-tight">
              Solar Feasibility & Audit Report
            </h2>
            <p className="text-sm text-light-muted mt-0.5">
              Generated on {new Date(selectedReport.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="lc-btn-brand text-sm py-2.5 px-5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing PDF...' : 'Download Report (PDF)'}</span>
          </button>
        </div>

        {/* 2 Simple Highlight Cards: Solar Recommendation & Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-card bg-light-surface border border-light-border">
            <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
              Solar Recommendation
            </span>
            <p className="text-xl font-extrabold text-light-text mt-1">
              {formatKW(outputs.recommendedCapacity)} Grid-Tied System
            </p>
            <p className="text-xs text-light-muted mt-0.5">
              Generates ~{formatKWh(outputs.estimatedAnnualGeneration)} clean solar energy per year
            </p>
          </div>

          <div className="p-4 rounded-card bg-brand/5 border border-brand/20">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Financial Summary
            </span>
            <p className="text-xl font-extrabold text-brand mt-1">
              {formatCurrency(outputs.annualSavings)}/yr Savings
            </p>
            <p className="text-xs text-light-muted mt-0.5">
              Net investment: {formatCurrency(outputs.netCost)} • Payback: {outputs.paybackPeriod} years
            </p>
          </div>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="printable-report-container"
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 text-slate-900 space-y-6"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SolarSense AI Logo"
              className="w-10 h-10 rounded-full object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  SolarSense AI
                </span>
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Solar Audit
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Intelligent Solar Energy Recommendation and Cost Optimization Platform
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <p className="font-bold text-slate-900 text-sm">Report #{selectedReport.reportNumber}</p>
            <p>Issue Date: {new Date(selectedReport.generatedAt).toLocaleDateString('en-IN')}</p>
            <p className="text-emerald-700 font-bold uppercase text-[11px] mt-0.5">Status: Verified Feasibility</p>
          </div>
        </div>

        {/* User & Property Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Client / Consumer</p>
            <p className="font-bold text-slate-900 mt-0.5">{summaryData.userName}</p>
            <p className="text-xs text-slate-500">{summaryData.userEmail}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Location & Category</p>
            <p className="font-bold text-slate-900 mt-0.5 capitalize">
              {summaryData.userType ? summaryData.userType.replace('_', ' ') : 'Residential'}
            </p>
            <p className="text-xs text-slate-500">{summaryData.location?.city || 'Pune'}, {summaryData.location?.state || 'Maharashtra'}</p>
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Rooftop Footprint</p>
            <p className="font-bold text-slate-900 mt-0.5">{inputs?.roofArea || Math.round(outputs.recommendedCapacity * 90)} sq.ft</p>
            <p className="text-xs text-slate-500">{inputs?.roofType || 'Flat Concrete RCC'} • Unshaded</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Executive Summary & Sizing Rationale
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed p-4 rounded-xl bg-slate-50 border border-slate-200">
            {summaryData.aiExplanation}
          </p>
        </div>

        {/* Key Technical Sizing Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Recommended PV System Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold">Recommended Capacity</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{formatKW(outputs.recommendedCapacity)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Optimal DC Peak</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold">PV Modules Required</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{outputs.panelCount} <span className="text-xs font-normal">Panels</span></p>
              <p className="text-xs text-slate-500 mt-0.5">540W Mono PERC</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold">Annual Solar Yield</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">{formatKWh(outputs.annualGeneration)}</p>
              <p className="text-xs text-slate-500 mt-0.5">~{formatNumber(outputs.annualGeneration / 365, 1)} kWh/day</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-bold">Inverter Sizing</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{outputs.inverterCapacity || outputs.recommendedCapacity} kW AC</p>
              <p className="text-xs text-slate-500 mt-0.5">Dual MPPT String</p>
            </div>
          </div>
        </div>

        {/* Financial Investment Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Financial & Return Projections
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
            <div className="grid grid-cols-2 p-3 border-b border-slate-200 bg-slate-50 font-bold text-slate-900">
              <span>Financial Metric</span>
              <span className="text-right">Value</span>
            </div>
            <div className="divide-y divide-slate-100 text-slate-800">
              <div className="grid grid-cols-2 p-3">
                <span className="text-slate-600">Gross Turnkey System Cost</span>
                <span className="text-right font-semibold">{formatCurrency(outputs.systemCost)}</span>
              </div>
              <div className="grid grid-cols-2 p-3 text-emerald-700 font-medium bg-emerald-50/50">
                <span>Government Direct Subsidy (PM Surya Ghar DBT)</span>
                <span className="text-right font-bold">- {formatCurrency(outputs.subsidy)}</span>
              </div>
              <div className="grid grid-cols-2 p-3 font-bold bg-slate-50">
                <span>Net Out-of-Pocket Capital Outlay</span>
                <span className="text-right text-slate-900">{formatCurrency(outputs.netCost)}</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-slate-600">Estimated Annual Electricity Bill Savings</span>
                <span className="text-right font-bold text-emerald-700">{formatCurrency(outputs.annualSavings)} / year</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-slate-600">Capital Payback Period</span>
                <span className="text-right font-semibold">{outputs.paybackPeriod} Years</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-slate-600">25-Year Lifecycle Return on Investment (ROI)</span>
                <span className="text-right font-bold text-emerald-700">+{outputs.roi}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Environmental Contribution</p>
              <p className="text-xs text-slate-500">Displacing coal-fired grid generation over 25-year lifecycle</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="font-extrabold text-lg text-slate-900">{formatNumber(outputs.co2AvoidedKg)} kg</p>
              <p className="text-xs text-slate-500">CO₂ Avoided / Year</p>
            </div>
            <div>
              <p className="font-extrabold text-lg text-emerald-700">{outputs.treesPlanted} Trees</p>
              <p className="text-xs text-slate-500">Forest Equivalent</p>
            </div>
          </div>
        </div>

        {/* Technical Assumptions & Engineering Disclaimer */}
        <div className="pt-4 border-t border-slate-200 space-y-2.5 text-xs text-slate-500">
          <div>
            <strong className="text-slate-700 font-semibold">Modeling Assumptions: </strong>
            Peak Sun Hours: {assumptions?.peakSunHours || '4.8'} hrs/day • Performance Ratio: {assumptions?.performanceRatio || '0.78'} • Panel Degradation: 0.7% / year • Useful life: 25 years • Electricity Tariff: ₹{inputs?.tariff || (outputs.annualSavings && outputs.annualGeneration ? (outputs.annualSavings / outputs.annualGeneration).toFixed(2) : '—')} / kWh.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed">
            <strong className="text-slate-700 font-semibold">Engineering Disclaimer: </strong>
            This document is a deterministic preliminary feasibility audit generated by the SolarSense AI platform for planning purposes. Final generation outputs, shadow analysis, and grid interconnection feasibility require an on-site physical survey and DISCOM net-metering validation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
