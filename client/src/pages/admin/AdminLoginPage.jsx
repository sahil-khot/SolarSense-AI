import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Logo from '../../components/common/Logo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const AdminLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const trimmed = identifier.trim();

    if (!trimmed) {
      errors.identifier = 'Please enter admin username or email.';
    } else if (trimmed.includes('@')) {
      if (!EMAIL_REGEX.test(trimmed)) {
        errors.identifier = 'Please enter a valid email address.';
      }
    } else {
      if (trimmed.length < 3 || !USERNAME_REGEX.test(trimmed)) {
        errors.identifier = 'Invalid username format.';
      }
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await adminLogin({
        identifier: identifier.trim(),
        email: identifier.trim(),
        password,
      });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.field) {
        setFieldErrors({ [resp.field]: resp.message });
      } else {
        setGeneralError(
          resp?.message ||
            err.message ||
            'Invalid administrator credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 antialiased">
      <div className="w-full max-w-[480px] space-y-6">
        {/* Enterprise Shield Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-3">
            <Logo size="lg" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
            </div>
            <h1 className="text-[32px] sm:text-[34px] font-extrabold text-[#111827] dark:text-white tracking-tight">
              Admin Portal
            </h1>
          </div>
          <p className="text-[16px] font-medium text-[#374151] dark:text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Restricted Enterprise Console • Role-Based Control
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 p-7 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
          {/* General Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-[14.5px] font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5 leading-snug">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
            {/* Admin Username or Email Field */}
            <div>
              <label
                htmlFor="admin-identifier"
                className="block text-[15.5px] font-semibold text-[#111827] dark:text-slate-100 mb-1.5"
              >
                Administrator Username or Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-identifier"
                  type="text"
                  autoComplete="username email"
                  required
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) {
                      setFieldErrors((prev) => ({ ...prev, identifier: '' }));
                    }
                    if (generalError) setGeneralError('');
                  }}
                  className={`w-full h-[50px] pl-11 pr-4 text-[16px] font-medium text-[#111827] dark:text-white rounded-xl border bg-white dark:bg-slate-850 placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    fieldErrors.identifier
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
              </div>

              {/* Inline Error Directly Below Identifier */}
              {fieldErrors.identifier && (
                <div className="mt-1.5 text-[14px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fieldErrors.identifier}</span>
                </div>
              )}
            </div>

            {/* Master Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-[15.5px] font-semibold text-[#111827] dark:text-slate-100 mb-1.5"
              >
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }
                    if (generalError) setGeneralError('');
                  }}
                  className={`w-full h-[50px] pl-11 pr-11 text-[16px] font-medium text-[#111827] dark:text-white rounded-xl border bg-white dark:bg-slate-850 placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-300 dark:border-slate-700 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1"
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Inline Error Directly Below Password */}
              {fieldErrors.password && (
                <div className="mt-1.5 text-[14px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[16px] font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Authorization…</span>
                </>
              ) : (
                <>
                  <span>Access Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Client App */}
        <p className="text-center text-[16px] font-medium text-[#374151] dark:text-slate-300">
          Not an administrator?{' '}
          <Link
            to="/login"
            className="font-bold text-[#16A34A] hover:text-[#15803D] dark:text-emerald-400 hover:underline ml-1 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4 inline" />
            <span>Return to User Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
