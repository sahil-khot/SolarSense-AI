import React, { useState, useEffect } from 'react';
import { X, Camera, Trash2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { compressImage } from '../../utils/imageUtils';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('residential');
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [avatar, setAvatar] = useState('');

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setUserType(user.userType || 'residential');
      setCity(user.location?.city || 'Pune');
      setState(user.location?.state || 'Maharashtra');
      setAvatar(user.avatar || '');
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompressing(true);
      setError('');
      try {
        const compressed = await compressImage(file, 320, 320, 0.85);
        setAvatar(compressed);
      } catch (err) {
        console.error('Modal photo compression error:', err);
        setError(err.message || 'Error processing photo.');
      } finally {
        setCompressing(false);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name,
        email,
        phone,
        userType,
        location: { city, state },
        avatar,
      };

      const res = await api.put('/users/profile', payload);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white border border-light-border rounded-card p-6 sm:p-7 shadow-card max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-light-border">
          <div>
            <h2 className="text-[22px] font-bold text-light-text tracking-tight">
              Edit Profile
            </h2>
            <p className="text-[15px] text-light-muted mt-0.5">
              Update photo, contact details, and energy preferences
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-btn text-light-muted hover:text-light-text hover:bg-light-surface transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-btn bg-rose-500/10 border border-rose-500/20 text-[15px] text-rose-600 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 rounded-btn bg-brand/10 border border-brand/30 text-[15px] text-brand font-medium flex items-center gap-2.5">
            <Check className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Avatar Section */}
          <div className="p-4 rounded-card bg-light-surface border border-light-border flex items-center gap-4">
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand shadow-subtle"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand/15 text-brand font-bold text-2xl flex items-center justify-center border border-brand/40">
                  {name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <label className="block text-[15.5px] font-semibold text-light-text">
                Profile Photo
              </label>
              <div className="flex items-center gap-2.5">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-btn bg-white hover:border-brand border border-light-border text-[14.5px] font-medium text-light-text transition-colors shadow-subtle ${compressing ? 'opacity-60 pointer-events-none' : ''}`}>
                  {compressing ? (
                    <RefreshCw className="w-4 h-4 text-brand animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-brand" />
                  )}
                  <span>{compressing ? 'Optimizing...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={compressing}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {avatar && !compressing && (
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-rose-50 hover:bg-rose-100 text-[14px] font-medium text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="text-[13.5px] text-light-muted">PNG, JPG, WEBP • Auto-compressed</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full lc-input text-[16px]"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full lc-input text-[16px]"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full lc-input text-[16px]"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Consumer Energy Category
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full lc-input text-[16px] cursor-pointer"
              >
                <option value="residential">Residential / Home</option>
                <option value="farm">Farm / Agricultural</option>
                <option value="small_business">Small Business</option>
                <option value="large_business">Commercial / Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                City / District
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full lc-input text-[16px]"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full lc-input text-[16px]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-light-border">
            <button
              type="button"
              onClick={onClose}
              className="lc-btn-secondary text-[16px] py-2.5 px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="lc-btn-brand text-[16px] py-2.5 px-6 font-medium"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
