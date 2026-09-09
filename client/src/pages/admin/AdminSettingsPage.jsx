import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await adminService.getSettings();
      if (res.success) {
        setSettings(res.settings);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleValueChange = (id, newValue) => {
    setSettings((prev) =>
      prev.map((s) => (s._id === id ? { ...s, value: newValue } : s))
    );
  };

  const handleSave = async (setting) => {
    setSavingId(setting._id);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await adminService.updateSetting(setting._id, Number(setting.value));
      if (res.success) {
        setSuccessMsg(`Updated "${setting.label}" successfully.`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error updating parameter.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving dynamic system parameters..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text tracking-tight">
          Dynamic System Parameters & Engineering Constants
        </h2>
        <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
          Adjust platform-wide solar calculation defaults, subsidy ceilings, and turnkey installation costs in real-time.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-card bg-brand-green/10 border border-brand-green/20 text-body text-brand-green font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-card bg-rose-500/10 border border-rose-500/25 text-body text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="lc-card p-5 sm:p-6 space-y-4">
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {settings.map((setting) => (
            <div key={setting._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-md">
                <span className="text-label font-medium uppercase tracking-wider text-brand-green px-2 py-0.5 rounded-btn bg-brand-green/10 border border-brand-green/20">
                  {setting.category}
                </span>
                <h4 className="text-body font-semibold text-light-text dark:text-dark-text mt-1">{setting.label}</h4>
                <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">{setting.description}</p>
                <p className="text-label text-light-muted dark:text-dark-muted font-mono mt-0.5">Key: {setting.key}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={setting.value}
                    onChange={(e) => handleValueChange(setting._id, e.target.value)}
                    className="w-32 lc-input text-body text-right font-semibold"
                  />
                  {setting.unit && (
                    <span className="block text-label text-light-muted dark:text-dark-muted text-right mt-0.5 font-normal">
                      {setting.unit}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleSave(setting)}
                  disabled={savingId === setting._id}
                  className="p-2.5 rounded-btn lc-btn-brand disabled:opacity-50 cursor-pointer shadow-xs"
                  title="Save change"
                >
                  {savingId === setting._id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
