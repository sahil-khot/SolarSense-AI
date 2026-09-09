import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Zap,
  ArrowRight,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Building2,
  HelpCircle,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { billService } from '../../services/billService';

const BillInsightsCard = ({ bill }) => {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [showHowWeGotNumbers, setShowHowWeGotNumbers] = useState(false);

  if (!bill) return null;

  const {
    unitsConsumed,
    totalAmount,
    tariff,
    billingMonth,
    billingYear,
    billingPeriodDays,
    discom,
    consumerName,
    consumerNumber,
    sanctionedLoadKW,
    meterNumber,
    previousReading,
    currentReading,
    fixedCharges,
    energyCharges,
    taxes,
    fileName,
    aiInsights,
  } = bill;

  // Normalized metrics
  const units = unitsConsumed || 0;
  const billAmt = totalAmount || 0;
  const effectiveTariff =
    tariff || (units > 0 ? (Math.round((billAmt / units) * 100) / 100).toFixed(2) : '7.50');
  const days = billingPeriodDays || 30;
  const dailyKwh = aiInsights?.dailyAverageKwh || (units > 0 ? (units / days).toFixed(1) : '0');

  // Solar sizing potential
  const solarPotential = aiInsights?.solarPotential || {};
  const calculatedKw = Math.max(1, Math.round(units / 112));
  const capacityRange =
    solarPotential.recommendedCapacityRange ||
    aiInsights?.recommendedCapacityRange ||
    `${calculatedKw} kW`;
  const annualGenKwh = Math.round(units * 12 * 1.15);
  const annualGeneration =
    solarPotential.estimatedAnnualGeneration || `~${annualGenKwh.toLocaleString('en-IN')} kWh/year`;
  const estimatedRooftopSqFt = Math.max(80, calculatedKw * 90);

  const handleRecommendClick = async () => {
    setGenerating(true);
    try {
      if (bill._id) {
        await billService.generateSolarRecommendationFromBill(bill._id);
      }
      navigate('/solar-recommendation', { state: { fromBill: true, billId: bill._id } });
    } catch (err) {
      console.error('Error generating recommendation from bill:', err);
      navigate('/solar-recommendation', { state: { fromBill: true, billId: bill._id } });
    } finally {
      setGenerating(false);
    }
  };

  const getFieldStatus = (fieldKey, value) => {
    if (bill.verifiedByUser) {
      return { label: 'User Verified', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (value === null || value === undefined || value === '' || value === 0 || value === '0') {
      return { label: 'Not available', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
    const isEst =
      (fieldKey === 'unitsConsumed' && bill.normalizedData?.isConsumptionEstimated) ||
      (fieldKey === 'totalAmount' && bill.normalizedData?.isAmountEstimated) ||
      (fieldKey === 'tariff' && !bill.tariff);

    const conf = bill.fieldConfidence?.[fieldKey] || (isEst ? 0.6 : 0.9);

    if (isEst || conf < 0.75) {
      return { label: 'Estimated', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Extracted', color: 'bg-brand/10 text-brand border-brand/20' };
  };

  return (
    <div className="space-y-6">
      {/* 1. SIMPLE SUMMARY CONTAINER */}
      <div className="lc-card p-6 sm:p-8">
        {/* Header with Document Name and Period */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-light-border gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded-btn border border-brand/20">
                Bill Summary
              </span>
              {discom && (
                <span className="text-xs font-medium text-light-muted flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-brand" />
                  <span>{discom}</span>
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-[28px] font-bold text-light-text tracking-tight">
              {billingMonth ? `${billingMonth} ${billingYear || ''}` : 'Electricity Bill Analysis'}
            </h3>
            <p className="text-sm text-light-muted mt-0.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand shrink-0" />
              <span>Document: <strong className="text-light-text">{fileName || 'Uploaded Bill'}</strong></span>
            </p>
          </div>

          <div>
            <span className="text-xs text-light-muted block sm:text-right">Extraction Confidence</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bill Processed Successfully</span>
            </span>
          </div>
        </div>

        {/* 4 PRIMARY DECISION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Electricity Used */}
          {(() => {
            const st = getFieldStatus('unitsConsumed', units);
            return (
              <div className="p-5 rounded-card bg-light-surface border border-light-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
                      Electricity Used
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-light-text mt-1">
                    {units ? units.toLocaleString('en-IN') : '0'}{' '}
                    <span className="text-base font-semibold text-light-muted">kWh</span>
                  </p>
                </div>
                <p className="text-xs text-light-muted mt-3 pt-2 border-t border-light-border">
                  Monthly units consumed
                </p>
              </div>
            );
          })()}

          {/* 2. Bill Amount */}
          {(() => {
            const st = getFieldStatus('totalAmount', billAmt);
            return (
              <div className="p-5 rounded-card bg-light-surface border border-light-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
                      Bill Amount
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-light-text mt-1">
                    {billAmt ? formatCurrency(billAmt) : '₹0'}
                  </p>
                </div>
                <p className="text-xs text-light-muted mt-3 pt-2 border-t border-light-border">
                  Total payable to utility
                </p>
              </div>
            );
          })()}

          {/* 3. Billing Period */}
          {(() => {
            const st = getFieldStatus('billingPeriodDays', days);
            return (
              <div className="p-5 rounded-card bg-light-surface border border-light-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-light-muted">
                      Billing Period
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-light-text mt-1">
                    {days}{' '}
                    <span className="text-base font-semibold text-light-muted">Days</span>
                  </p>
                </div>
                <p className="text-xs text-light-muted mt-3 pt-2 border-t border-light-border truncate">
                  {billingMonth ? `${billingMonth} cycle` : 'Cycle duration'}
                </p>
              </div>
            );
          })()}

          {/* 4. Recommended Solar Range */}
          <div className="p-5 rounded-card bg-brand/5 border border-brand/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand">
                  Recommended Solar
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand text-white">
                  Ideal
                </span>
              </div>
              <p className="text-3xl font-extrabold text-brand mt-1">
                {capacityRange}
              </p>
            </div>
            <p className="text-xs text-light-muted mt-3 pt-2 border-t border-brand/15">
              Covers ~100% of your energy
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="mt-8 pt-6 border-t border-light-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-light-text">
              Ready to see your customized system layout & savings?
            </p>
            <p className="text-xs text-light-muted mt-0.5">
              We'll calculate rooftop area requirements, equipment options, subsidies, and financial returns.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRecommendClick}
            disabled={generating}
            className="lc-btn-brand text-base py-3 px-6 flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 disabled:opacity-50"
          >
            {generating ? (
              <span>Calculating your solar recommendation...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Get Full Solar Recommendation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Progressive Disclosure: How we got these numbers */}
        <div className="mt-6 pt-5 border-t border-light-border">
          <button
            type="button"
            onClick={() => setShowHowWeGotNumbers(!showHowWeGotNumbers)}
            className="flex items-center justify-between w-full text-left py-2 px-3 rounded-btn hover:bg-light-surface text-sm font-bold text-light-text transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand" />
              <span>How we got these numbers</span>
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-brand">
              <span>{showHowWeGotNumbers ? 'Hide details' : 'View details'}</span>
              {showHowWeGotNumbers ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {showHowWeGotNumbers && (
            <div className="mt-4 p-5 rounded-card bg-light-surface border border-light-border space-y-4">
              <div className="text-xs text-light-muted leading-relaxed">
                <p className="font-semibold text-light-text text-sm mb-1">
                  Solar Sizing Calculation
                </p>
                <p>
                  Based on consuming <strong>{units} kWh</strong> in {days} days, your average daily demand is <strong>{dailyKwh} kWh/day</strong>.
                  In India, 1 kW of rooftop solar produces approximately 4 units (kWh) per day.
                  Therefore, a <strong>{capacityRange}</strong> system will generate ~<strong>{annualGeneration}</strong> per year and require approximately <strong>~{estimatedRooftopSqFt} sq.ft</strong> of shadow-free roof space.
                </p>
              </div>

              <div className="pt-3 border-t border-light-border">
                <p className="font-semibold text-light-text text-xs uppercase tracking-wider mb-3">
                  Extracted Bill Details & Confidence
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-light-muted block">Consumer Name</span>
                    <span className="font-bold text-light-text text-sm">{consumerName || 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{consumerName ? '✓ Extracted' : '○ Not available'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">Consumer / CA Number</span>
                    <span className="font-bold text-light-text text-sm">{consumerNumber || 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{consumerNumber ? '✓ Extracted' : '○ Not available'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">DISCOM Utility</span>
                    <span className="font-bold text-light-text text-sm">{discom || 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{discom ? '✓ Identified' : '○ Not available'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">Sanctioned Load</span>
                    <span className="font-bold text-light-text text-sm">{sanctionedLoadKW ? `${sanctionedLoadKW} kW` : 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{sanctionedLoadKW ? '✓ Extracted' : '○ Not available'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">Meter Number</span>
                    <span className="font-bold text-light-text text-sm">{meterNumber || 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{meterNumber ? '✓ Extracted' : '○ Not available'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">Average Rate / Tariff</span>
                    <span className="font-bold text-light-text text-sm">₹{effectiveTariff}/unit</span>
                    <span className="text-[11px] text-light-muted">{tariff ? '✓ Tariff slab' : 'Estimated rate'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">Fixed / Demand Charges</span>
                    <span className="font-bold text-light-text text-sm">{fixedCharges ? formatCurrency(fixedCharges) : 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{fixedCharges ? '✓ Extracted' : '○ Not available'}</span>
                  </div>
                  <div>
                    <span className="text-light-muted block">Taxes & Electricity Duty</span>
                    <span className="font-bold text-light-text text-sm">{taxes ? formatCurrency(taxes) : 'Not available'}</span>
                    <span className="text-[11px] text-light-muted">{taxes ? '✓ Extracted' : '○ Not available'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillInsightsCard;
