import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { billService } from '../../services/billService';

const PROCESSING_STEPS = [
  { id: 1, label: 'Reading bill document' },
  { id: 2, label: 'Finding electricity usage & bill amount' },
  { id: 3, label: 'Checking DISCOM tariff rates' },
  { id: 4, label: 'Calculating recommended solar system range' },
];

const BillUploadCard = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Progressive step animation during analysis
  useEffect(() => {
    let interval;
    if (loading) {
      setCurrentStep(1);
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < PROCESSING_STEPS.length ? prev + 1 : prev));
      }, 800);
    } else {
      setCurrentStep(1);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported format. Please upload a PDF, JPG, PNG, or WebP bill document.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please upload a smaller document.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError('Please select an electricity bill file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await billService.uploadBill(file);
      if (result.success && result.bill) {
        onAnalysisComplete(result.bill);
      } else {
        throw new Error(result.message || 'Could not analyze bill.');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'We were unable to read the consumption details from this electricity bill.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="lc-card p-6 sm:p-8">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-light-border gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-btn bg-brand/10 border border-brand/20 text-brand flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-light-text tracking-tight">
              Upload your electricity bill
            </h3>
            <p className="text-base text-secondary mt-0.5">
              We'll read the bill and use the information to estimate your solar needs.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-brand bg-brand/10 px-3 py-1.5 rounded-btn border border-brand/20">
          <Shield className="w-4 h-4 text-brand" />
          <span>Zero manual entry required</span>
        </div>
      </div>

      {/* Loading Overlay / Progress Indicator */}
      {loading ? (
        <div className="py-12 px-6 rounded-2xl bg-[#F8FAFC] border border-[#D1D5DB] flex flex-col items-center justify-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-[#DCFCE7] border-t-[#16A34A] animate-spin flex items-center justify-center" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#16A34A] animate-pulse" />
            </div>
          </div>

          <h4 className="text-2xl font-extrabold text-[#111827] mb-2">
            Analyzing your electricity bill...
          </h4>
          <p className="text-base sm:text-lg text-[#374151] max-w-xl mb-6 leading-relaxed">
            Our AI model is extracting your monthly units consumed, DISCOM tariff rates, and calculating your optimal solar sizing potential.
          </p>

          {/* Dynamic Progress Steps */}
          <div className="w-full max-w-lg space-y-3.5 text-left bg-white p-6 rounded-2xl border border-[#D1D5DB] shadow-sm">
            {PROCESSING_STEPS.map((step) => {
              const isDone = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center gap-3.5 text-base">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-5 h-5 text-[#16A34A] animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] shrink-0" />
                  )}
                  <span
                    className={`${
                      isDone
                        ? 'text-[#111827] font-semibold'
                        : isCurrent
                        ? 'text-[#15803D] font-extrabold'
                        : 'text-[#6B7280] font-normal'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : error ? (
        /* Friendly Error State with "Try Another Bill" */
        <div className="py-10 px-6 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-extrabold text-[#991B1B] mb-2">
            Unable to Read Bill
          </h4>
          <p className="text-base text-[#7F1D1D] max-w-lg mb-6 leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-base font-bold px-8 py-3.5 rounded-xl flex items-center gap-2.5 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Another Bill</span>
          </button>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            id="bill-file-input"
            accept=".pdf,image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-[#16A34A] bg-[#DCFCE7]/40 scale-[1.005]'
                  : 'border-[#D1D5DB] bg-white hover:bg-[#F8FAFC] hover:border-[#9CA3AF]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] flex items-center justify-center mb-4 shadow-sm">
                <UploadCloud className="w-8 h-8 text-[#16A34A]" />
              </div>

              <p className="text-xl sm:text-2xl font-bold text-[#111827] mb-2">
                Drag and drop your electricity bill here, or{' '}
                <span className="text-[#16A34A] hover:text-[#15803D] font-extrabold underline underline-offset-4">browse files</span>
              </p>
              <p className="text-base text-[#374151]">
                Upload your DISCOM bill as PDF, JPG, PNG, or WebP document (up to 10MB)
              </p>

              <div className="flex items-center gap-3 mt-6">
                <span className="text-sm font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] text-[#374151] border border-[#D1D5DB]">
                  PDF Document
                </span>
                <span className="text-sm font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] text-[#374151] border border-[#D1D5DB]">
                  JPG / PNG Image
                </span>
                <span className="text-sm font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] text-[#374151] border border-[#D1D5DB]">
                  WebP
                </span>
              </div>
            </div>
          ) : (
            /* Selected File Ready to Analyze */
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#D1D5DB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-[#16A34A]" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#111827] truncate max-w-md">
                    {file.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-sm font-semibold text-[#4B5563]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-[#9CA3AF]">•</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#86EFAC]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                      <span>Ready for AI extraction</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 sm:pt-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-base font-semibold text-[#4B5563] hover:text-[#DC2626] underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Choose Different File
                </button>
                <button
                  type="submit"
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-base sm:text-lg px-8 py-3.5 rounded-xl flex items-center gap-3 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <span>Analyze My Bill</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default BillUploadCard;
