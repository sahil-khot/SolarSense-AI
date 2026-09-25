import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Logo from '../../components/common/Logo';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field-specific validation states
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [emailStatus, setEmailStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [serverErrors, setServerErrors] = useState({}); // { username, email, password, confirmPassword, general }

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Debounce timers for live availability checks
  const usernameTimerRef = useRef(null);
  const emailTimerRef = useRef(null);

  // Password criteria
  const passwordCriteria = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Confirm password check
  const isConfirmMatch = confirmPassword.length > 0 && confirmPassword === password;
  const isConfirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  // Live Username Validation with Debounced API Check
  useEffect(() => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);

    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }

    if (trimmed.length < 3) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Username must be at least 3 characters.',
      });
      return;
    }

    if (trimmed.length > 30) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Username cannot exceed 30 characters.',
      });
      return;
    }

    if (/\s/.test(trimmed)) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Username cannot contain spaces.',
      });
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Username can contain letters, numbers and underscores only.',
      });
      return;
    }

    // Format is valid, debounce check uniqueness against database
    setUsernameStatus({ state: 'checking', message: 'Checking availability...' });
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await authService.checkUsername(trimmed);
        if (res.available) {
          setUsernameStatus({ state: 'valid', message: 'Username available' });
        } else {
          setUsernameStatus({
            state: 'invalid',
            message: 'This username is already taken. Please choose another.',
          });
        }
      } catch (err) {
        // If server error on check, allow proceeding with valid format
        setUsernameStatus({ state: 'valid', message: '' });
      }
    }, 400);

    return () => clearTimeout(usernameTimerRef.current);
  }, [username]);

  // Live Email Validation with Debounced API Check
  useEffect(() => {
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailStatus({ state: 'idle', message: '' });
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailStatus({
        state: 'invalid',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setEmailStatus({ state: 'checking', message: 'Checking email...' });
    emailTimerRef.current = setTimeout(async () => {
      try {
        const res = await authService.checkEmail(trimmed);
        if (res.available) {
          setEmailStatus({ state: 'valid', message: 'Valid email' });
        } else {
          setEmailStatus({
            state: 'invalid',
            message: 'This email address is already registered. Please log in instead.',
          });
        }
      } catch (err) {
        // If server error on check, allow proceeding with valid format
        setEmailStatus({ state: 'valid', message: '' });
      }
    }, 400);

    return () => clearTimeout(emailTimerRef.current);
  }, [email]);

  // Helper to auto-populate demo test details
  const handleQuickFillDemo = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const demoUser = `solar_user_${randomSuffix}`;
    const demoEmail = `user_${randomSuffix}@solarsense.ai`;
    const demoPass = 'SolarUser@2026';

    setFullName('SolarSense Tester');
    setUsername(demoUser);
    setEmail(demoEmail);
    setPassword(demoPass);
    setConfirmPassword(demoPass);
    setServerErrors({});
    setUsernameStatus({ state: 'valid', message: 'Username ready' });
    setEmailStatus({ state: 'valid', message: 'Email ready' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    // Client side pre-submit validations
    const errors = {};

    if (!username.trim()) {
      errors.username = 'Please enter a username.';
    } else if (!USERNAME_REGEX.test(username.trim())) {
      errors.username = 'Username must be 3-30 characters with letters, numbers and underscores only.';
    } else if (usernameStatus.state === 'invalid') {
      errors.username = usernameStatus.message;
    }

    if (!email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    } else if (emailStatus.state === 'invalid') {
      errors.email = emailStatus.message;
    }

    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (!isPasswordValid) {
      errors.password = 'Password must meet all complexity requirements.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setServerErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const cleanUsername = username.trim();
      await register({
        username: cleanUsername,
        email: email.trim(),
        password,
        confirmPassword,
        name: fullName.trim() || cleanUsername,
        userType: 'residential',
        location: { state: 'Maharashtra', city: 'Pune' },
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.field) {
        setServerErrors({ [resp.field]: resp.message });
      } else {
        setServerErrors({
          general: resp?.message || err.message || 'Failed to create account. Please try again.',
        });
      }
    } finally {
      setLoading(false);
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
            Create Account
          </h1>
          <p className="text-[15.5px] font-medium text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
            Join SolarSense AI to analyze rooftop solar viability and maximize electricity savings
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4.5">
          {/* General Server Error */}
          {serverErrors.general && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[14.5px] font-semibold text-red-600 flex items-start gap-2.5 leading-snug">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{serverErrors.general}</span>
            </div>
          )}

          {/* Quick Demo Fill Helper Header */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-[14px] font-bold text-slate-800">
              Account Registration
            </span>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="text-[12px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Auto-fill sample valid credentials for quick testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fill Sample Test Details</span>
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Optional Full Name Field */}
            <div>
              <label
                htmlFor="reg-fullname"
                className="block text-[15px] font-semibold text-slate-900 mb-1"
              >
                Full Name <span className="text-slate-400 font-normal text-[13px]">(optional)</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-fullname"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Sahil Khot"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-[48px] pl-11 pr-4 text-[15.5px] font-medium text-slate-900 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 1. Username Field */}
            <div>
              <label
                htmlFor="reg-username"
                className="block text-[15px] font-semibold text-slate-900 mb-1"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Choose a username (e.g. sahil_khot)"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (serverErrors.username) {
                      setServerErrors((prev) => ({ ...prev, username: null }));
                    }
                  }}
                  className={`w-full h-[48px] pl-11 pr-10 text-[15.5px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    serverErrors.username || usernameStatus.state === 'invalid'
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : usernameStatus.state === 'valid'
                      ? 'border-emerald-500 focus:border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
                {/* Status Indicator Icon */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {usernameStatus.state === 'checking' && (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  )}
                  {usernameStatus.state === 'valid' && !serverErrors.username && (
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  )}
                  {(usernameStatus.state === 'invalid' || serverErrors.username) && (
                    <X className="w-4 h-4 text-red-500 font-bold" />
                  )}
                </div>
              </div>

              {/* Username Feedback */}
              {(serverErrors.username || usernameStatus.message) && (
                <div
                  className={`mt-1 text-[13px] font-medium flex items-center gap-1.5 ${
                    serverErrors.username || usernameStatus.state === 'invalid'
                      ? 'text-red-600'
                      : usernameStatus.state === 'valid'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                >
                  {serverErrors.username ? (
                    <>
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>{serverErrors.username}</span>
                    </>
                  ) : (
                    <>
                      {usernameStatus.state === 'valid' && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {usernameStatus.state === 'invalid' && (
                        <X className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{usernameStatus.message}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 2. Email Field */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-[15px] font-semibold text-slate-900 mb-1"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (serverErrors.email) {
                      setServerErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                  className={`w-full h-[48px] pl-11 pr-10 text-[15.5px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    serverErrors.email || emailStatus.state === 'invalid'
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : emailStatus.state === 'valid'
                      ? 'border-emerald-500 focus:border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
                {/* Status Indicator Icon */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {emailStatus.state === 'checking' && (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  )}
                  {emailStatus.state === 'valid' && !serverErrors.email && (
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                  )}
                  {(emailStatus.state === 'invalid' || serverErrors.email) && (
                    <X className="w-4 h-4 text-red-500 font-bold" />
                  )}
                </div>
              </div>

              {/* Email Feedback */}
              {(serverErrors.email || emailStatus.message) && (
                <div
                  className={`mt-1 text-[13px] font-medium flex items-center gap-1.5 ${
                    serverErrors.email || emailStatus.state === 'invalid'
                      ? 'text-red-600'
                      : emailStatus.state === 'valid'
                      ? 'text-emerald-600'
                      : 'text-slate-500'
                  }`}
                >
                  {serverErrors.email ? (
                    <>
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>{serverErrors.email}</span>
                    </>
                  ) : (
                    <>
                      {emailStatus.state === 'valid' && (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {emailStatus.state === 'invalid' && (
                        <X className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{emailStatus.message}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 3. Password Field */}
            <div>
              <label
                htmlFor="reg-password"
                className="block text-[15px] font-semibold text-slate-900 mb-1"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (serverErrors.password) {
                      setServerErrors((prev) => ({ ...prev, password: null }));
                    }
                  }}
                  className={`w-full h-[48px] pl-11 pr-11 text-[15.5px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    serverErrors.password
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : isPasswordValid
                      ? 'border-emerald-500 focus:border-emerald-500 ring-1 ring-emerald-500/20'
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

              {serverErrors.password && (
                <div className="mt-1 text-[13px] font-medium text-red-600 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 shrink-0" />
                  <span>{serverErrors.password}</span>
                </div>
              )}

              {/* Password Requirements Checklist */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] space-y-1.5">
                <p className="font-semibold text-slate-700">
                  Password must contain:
                </p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div
                    className={`flex items-center gap-1.5 font-medium ${
                      passwordCriteria.hasLength
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {passwordCriteria.hasLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                    ) : (
                      <span className="w-3.5 h-3.5 inline-block text-center text-slate-400 shrink-0">
                        ○
                      </span>
                    )}
                    <span>At least 8 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 font-medium ${
                      passwordCriteria.hasUpper
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {passwordCriteria.hasUpper ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                    ) : (
                      <span className="w-3.5 h-3.5 inline-block text-center text-slate-400 shrink-0">
                        ○
                      </span>
                    )}
                    <span>One uppercase letter</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 font-medium ${
                      passwordCriteria.hasLower
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {passwordCriteria.hasLower ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                    ) : (
                      <span className="w-3.5 h-3.5 inline-block text-center text-slate-400 shrink-0">
                        ○
                      </span>
                    )}
                    <span>One lowercase letter</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 font-medium ${
                      passwordCriteria.hasNumber
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {passwordCriteria.hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                    ) : (
                      <span className="w-3.5 h-3.5 inline-block text-center text-slate-400 shrink-0">
                        ○
                      </span>
                    )}
                    <span>One number</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Confirm Password Field */}
            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-[15px] font-semibold text-slate-900 mb-1"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (serverErrors.confirmPassword) {
                      setServerErrors((prev) => ({ ...prev, confirmPassword: null }));
                    }
                  }}
                  className={`w-full h-[48px] pl-11 pr-11 text-[15.5px] font-medium text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none transition-colors ${
                    serverErrors.confirmPassword || isConfirmMismatch
                      ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20'
                      : isConfirmMatch
                      ? 'border-emerald-500 focus:border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password Feedback */}
              {(serverErrors.confirmPassword || isConfirmMatch || isConfirmMismatch) && (
                <div
                  className={`mt-1 text-[13px] font-medium flex items-center gap-1.5 ${
                    serverErrors.confirmPassword || isConfirmMismatch
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {serverErrors.confirmPassword ? (
                    <>
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>{serverErrors.confirmPassword}</span>
                    </>
                  ) : isConfirmMismatch ? (
                    <>
                      <X className="w-3.5 h-3.5 shrink-0" />
                      <span>Passwords do not match.</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Passwords match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15.5px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Switch Link and Quick Login Prompt */}
        <div className="text-center space-y-1.5">
          <p className="text-[15.5px] font-medium text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline ml-1"
            >
              Log In
            </Link>
          </p>
          <p className="text-[13px] text-slate-500">
            Want to test immediately?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:underline"
            >
              Try Instant 1-Click Quick Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
