import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AlertCircle, ExternalLink, X } from 'lucide-react';

const GoogleAuthButton = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}) => {
  const [showConfigNotice, setShowConfigNotice] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleConfigNoticeClick = () => {
    setShowConfigNotice(true);
  };

  // If a real Google Client ID is configured, use official Google Identity Services
  if (googleClientId && googleClientId.trim().length > 5) {
    return (
      <div className="w-full flex justify-center google-auth-wrapper">
        <GoogleOAuthProvider clientId={googleClientId.trim()}>
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse && credentialResponse.credential) {
                  onSuccess(credentialResponse.credential);
                } else {
                  onError?.('Failed to obtain Google authentication token.');
                }
              }}
              onError={() => {
                onError?.('Google authentication was cancelled or closed.');
              }}
              text={text}
              theme="outline"
              size="large"
              shape="rectangular"
              width="100%"
            />
          </div>
        </GoogleOAuthProvider>
      </div>
    );
  }

  // When Client ID is not configured yet in .env, render professional button with setup guidance modal
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleConfigNoticeClick}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-[15.5px] font-semibold text-slate-800 dark:text-slate-100 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Setup Guidance Dialog (Zero Fake Accounts) */}
      {showConfigNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Google OAuth 2.0 Setup
                  </h3>
                  <p className="text-xs text-slate-500">Real Google authentication configuration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigNotice(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <p className="font-medium">
                To sign in with a real Google account, your Google Cloud OAuth Client ID is required.
              </p>
              <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 space-y-1">
                <div># In client/.env</div>
                <div className="text-blue-600 dark:text-blue-400 font-bold">VITE_GOOGLE_CLIENT_ID=&lt;your_client_id&gt;</div>
                <div className="pt-1"># In server/.env</div>
                <div className="text-blue-600 dark:text-blue-400 font-bold">GOOGLE_CLIENT_ID=&lt;your_client_id&gt;</div>
              </div>
              <p className="text-[11px] text-slate-500">
                You can create an OAuth 2.0 Web Client ID in the{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigNotice(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-95 cursor-pointer transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
