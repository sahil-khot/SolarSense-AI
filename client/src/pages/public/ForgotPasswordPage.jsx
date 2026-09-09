import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Lock, AlertCircle, KeyRound } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { authService } from '../../services/authService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'completed'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.forgotPassword(email);
      setResetToken(data.resetToken || '');
      setSuccessMessage(data.message || 'Reset token generated successfully.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find an account with that email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.resetPassword(resetToken, newPassword);
      setStep('completed');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-[440px] space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-3.5">
            <Logo size="lg" />
          </Link>
          <h1 className="text-page-title font-semibold text-slate-900 tracking-tight">
            {step === 'reset' ? 'Set New Password' : step === 'completed' ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p className="text-helper text-slate-600 mt-1 max-w-xs mx-auto">
            {step === 'reset'
              ? 'Enter your new password below to secure your account.'
              : step === 'completed'
              ? 'Your password has been changed. Redirecting to dashboard...'
              : 'Enter your registered email address to verify your account.'}
          </p>
        </div>

        <div className="lc-card p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-label font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="lc-input pl-9 text-body w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full lc-btn-brand text-body font-medium flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying Account...' : 'Generate Reset Token'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Token active for <strong>{email}</strong> (valid 15 mins).</span>
              </div>

              <div>
                <label className="block text-label font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="lc-input pl-9 text-body w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label font-medium text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="lc-input pl-9 text-body w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full lc-btn-brand text-body font-medium flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Updating Password...' : 'Save New Password & Log In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'completed' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-body font-semibold text-slate-900">Password Reset Successfully</h3>
              <p className="text-helper text-slate-600">
                You are now securely logged in. Redirecting to your dashboard...
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-body text-slate-600">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-label font-medium text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Log In</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
