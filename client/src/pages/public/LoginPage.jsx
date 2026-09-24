import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/common/Logo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // Accepts username OR email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const errors = {};
    const trimmedId = identifier.trim();

    if (!trimmedId) {
      errors.identifier = 'Please enter your username or email.';
    } else if (trimmedId.includes('@')) {
      if (!EMAIL_REGEX.test(trimmedId)) {
        errors.identifier = 'Please enter a valid email address.';
      }
    } else {
      if (trimmedId.length < 3 || !USERNAME_REGEX.test(trimmedId)) {
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
      await login({
        identifier: identifier.trim(),
        password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.field) {
        setFieldErrors({ [resp.field]: resp.message });
      } else {
        setGeneralError(
          resp?.message ||
            err.message ||
            'Incorrect username/email or password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-[480px] space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-3">
            <Logo size="lg" />
          </Link>
          <h1 className="text-[32px] sm:text-[34px] font-extrabold text-slate-900 tracking-tight">
            Log In
          </h1>
          <p className="text-[16px] font-medium text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Access your solar assessments, bills, proposals, and personalized dashboard
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-8 shadow-sm space-y-5">
          {/* General Server Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[14.5px] font-semibold text-red-600 flex items-start gap-2.5 leading-snug">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
            {/* Username or Email Field */}
            <div>
              <label
                htmlFor="login-identifier"
                className="block text-[15.5px] font-semibold text-slate-900 mb-1.5"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-identifier"
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
                  className={`w-full h-[50px] pl-11 pr-4 text-[16px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    fieldErrors.identifier
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
              </div>

              {/* Inline Error Directly Below Identifier */}
              {fieldErrors.identifier && (
                <div className="mt-1.5 text-[14px] font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fieldErrors.identifier}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-[15.5px] font-semibold text-slate-900"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[14px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
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
                  className={`w-full h-[50px] pl-11 pr-11 text-[16px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    fieldErrors.password
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Inline Error Directly Below Password */}
              {fieldErrors.password && (
                <div className="mt-1.5 text-[14px] font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[16px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch Link */}
        <p className="text-center text-[16px] font-medium text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline ml-1"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
