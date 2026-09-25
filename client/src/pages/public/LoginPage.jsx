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
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
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
  const [loggingInRole, setLoggingInRole] = useState(null); // 'residential' | 'farm' | 'business' | 'admin'

  const { login } = useAuth();
  const { setAdminSession } = useAdminAuth();
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
        errors.identifier = 'Username must be 3-30 characters (letters, numbers, underscore).';
      }
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    return errors;
  };

  const handleSuccessfulAuth = (authResponse, fallbackRole = 'user') => {
    const userRole = authResponse?.user?.role || fallbackRole;
    if (userRole === 'admin') {
      if (setAdminSession && authResponse?.user && authResponse?.token) {
        setAdminSession(authResponse.user, authResponse.token);
      }
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
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
      const res = await login({
        identifier: identifier.trim(),
        password,
      });
      handleSuccessfulAuth(res);
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

  // Instant 1-Click Quick Login (same UX flow as Project Match)
  const handleQuickLogin = async (demoIdentifier, demoPassword, roleKey) => {
    setGeneralError('');
    setFieldErrors({});
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    setLoggingInRole(roleKey);
    setLoading(true);

    try {
      const res = await login({
        identifier: demoIdentifier.trim(),
        password: demoPassword,
      });
      handleSuccessfulAuth(res, roleKey === 'admin' ? 'admin' : 'user');
    } catch (err) {
      const resp = err.response?.data;
      setGeneralError(
        resp?.message ||
          err.message ||
          'Quick login failed. Please ensure backend server is running.'
      );
    } finally {
      setLoading(false);
      setLoggingInRole(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-[500px] space-y-5">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-3">
            <Logo size="lg" />
          </Link>
          <h1 className="text-[32px] sm:text-[34px] font-extrabold text-slate-900 tracking-tight">
            Log In
          </h1>
          <p className="text-[15.5px] font-medium text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
            Access your solar assessments, bills, proposals, and dashboard
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          {/* General Server Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[14.5px] font-semibold text-red-600 flex items-start gap-2.5 leading-snug">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username or Email Field */}
            <div>
              <label
                htmlFor="login-identifier"
                className="block text-[15px] font-semibold text-slate-900 mb-1.5"
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
                  className={`w-full h-[48px] pl-11 pr-4 text-[15.5px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    fieldErrors.identifier
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
              </div>

              {/* Inline Error Directly Below Identifier */}
              {fieldErrors.identifier && (
                <div className="mt-1.5 text-[13.5px] font-semibold text-rose-600 flex items-center gap-1.5">
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
                  className="block text-[15px] font-semibold text-slate-900"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[13.5px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
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
                  className={`w-full h-[48px] pl-11 pr-11 text-[15.5px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
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
                <div className="mt-1.5 text-[13.5px] font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15.5px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-1"
            >
              {loading && !loggingInRole ? (
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

        {/* Instant 1-Click Quick Login (Matching Project Match pattern) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-900 font-bold text-[14px]">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Instant 1-Click Quick Login</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              ⚡ Click Role to Login Instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
            {/* 1. Residential User */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin(
                  'rahul.residential@solarsense.ai',
                  'User@12345',
                  'residential'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition-all flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                  👤 Rahul (User)
                </span>
                {loggingInRole === 'residential' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 font-semibold">
                    Login →
                  </span>
                )}
              </div>
              <span className="text-slate-600 font-mono text-[11px] mt-1.5 truncate">
                rahul.residential@solarsense.ai
              </span>
              <span className="text-slate-400 text-[10.5px] mt-0.5">
                Pass: <span className="font-mono text-slate-500">User@12345</span>
              </span>
            </button>

            {/* 2. Agriculture User */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin(
                  'ramesh.farm@solarsense.ai',
                  'User@12345',
                  'farm'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition-all flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                  🚜 Ramesh (Farmer)
                </span>
                {loggingInRole === 'farm' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 font-semibold">
                    Login →
                  </span>
                )}
              </div>
              <span className="text-slate-600 font-mono text-[11px] mt-1.5 truncate">
                ramesh.farm@solarsense.ai
              </span>
              <span className="text-slate-400 text-[10.5px] mt-0.5">
                Pass: <span className="font-mono text-slate-500">User@12345</span>
              </span>
            </button>

            {/* 3. Commercial User */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin(
                  'priya.business@solarsense.ai',
                  'User@12345',
                  'business'
                )
              }
              className="text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition-all flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
                  🏢 Priya (Business)
                </span>
                {loggingInRole === 'business' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 font-semibold">
                    Login →
                  </span>
                )}
              </div>
              <span className="text-slate-600 font-mono text-[11px] mt-1.5 truncate">
                priya.business@solarsense.ai
              </span>
              <span className="text-slate-400 text-[10.5px] mt-0.5">
                Pass: <span className="font-mono text-slate-500">User@12345</span>
              </span>
            </button>

            {/* 4. Administrator */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickLogin(
                  'admin@solarsense.ai',
                  'Admin@12345',
                  'admin'
                )
              }
              className="text-left p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 hover:border-emerald-400 border border-emerald-200 transition-all flex flex-col justify-between cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-emerald-900 group-hover:text-emerald-950 flex items-center gap-1.5">
                  ⚙️ System Admin
                </span>
                {loggingInRole === 'admin' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <span className="text-[11px] text-emerald-700 group-hover:text-emerald-900 font-bold">
                    Admin →
                  </span>
                )}
              </div>
              <span className="text-emerald-800 font-mono text-[11px] mt-1.5 truncate">
                admin@solarsense.ai
              </span>
              <span className="text-emerald-700/80 text-[10.5px] mt-0.5">
                Pass: <span className="font-mono text-emerald-800">Admin@12345</span>
              </span>
            </button>
          </div>
        </div>

        {/* Switch Link & Admin Portal Shortcut */}
        <div className="text-center space-y-2">
          <p className="text-[15.5px] font-medium text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline ml-1"
            >
              Create an account
            </Link>
          </p>

          <p className="text-[13.5px] text-slate-500">
            Enterprise staff?{' '}
            <Link
              to="/admin/login"
              className="font-semibold text-slate-700 hover:text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 inline text-emerald-600" />
              <span>Go to Admin Portal</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
