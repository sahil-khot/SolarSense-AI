import React, { useState, useEffect } from 'react';
import { Camera, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { compressImage } from '../../utils/imageUtils';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    location: {
      state: user?.location?.state || 'Maharashtra',
      city: user?.location?.city || 'Pune',
      pincode: user?.location?.pincode || '',
    },
    userType: user?.userType || 'residential',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep form data in sync with authenticated user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name ?? prev.name,
        phone: user.phone ?? prev.phone,
        avatar: user.avatar ?? prev.avatar,
        location: {
          state: user.location?.state ?? prev.location.state,
          city: user.location?.city ?? prev.location.city,
          pincode: user.location?.pincode ?? prev.location.pincode,
        },
        userType: user.userType ?? prev.userType,
      }));
    }
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Compress image to clean lightweight avatar (max 320x320 px JPEG)
      const compressedAvatar = await compressImage(file, 320, 320, 0.85);

      // 2. Immediately update local preview
      setFormData((prev) => ({ ...prev, avatar: compressedAvatar }));

      // 3. Persist immediately to backend & sync AuthContext so top-right corner updates instantly
      const res = await api.put('/users/profile', { avatar: compressedAvatar });
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setSuccessMsg('Profile photo updated and saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setErrorMsg(err.message || 'Failed to process profile image.');
    } finally {
      setUploadingPhoto(false);
      // Reset input value to allow re-uploading the same file
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setFormData((prev) => ({ ...prev, avatar: '' }));
      const res = await api.put('/users/profile', { avatar: '' });
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setSuccessMsg('Profile photo removed.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Avatar remove failed:', err);
      setErrorMsg(err.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccessMsg('Profile information updated successfully.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text tracking-tight">
          User Account & Energy Profile
        </h2>
        <p className="text-[16px] text-light-muted mt-1 leading-relaxed">
          Manage your personal details, profile photo, location coordinates, and primary consumer energy category.
        </p>
      </div>

      <div className="lc-card p-7 space-y-6">
        {successMsg && (
          <div className="p-4 rounded-card bg-brand-green/10 border border-brand-green/20 text-[16px] text-brand-green font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-card bg-rose-500/10 border border-rose-500/20 text-[16px] text-rose-600 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Photo Section */}
          <div className="flex items-center gap-5 p-4 rounded-card lc-surface border border-light-border">
            <div className="w-16 h-16 rounded-full bg-white border border-light-border flex items-center justify-center text-2xl font-bold text-brand-green overflow-hidden shrink-0 relative shadow-subtle">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                />
              ) : (
                formData.name?.charAt(0) || 'U'
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="text-[17px] font-semibold text-light-text mb-1">Profile Photo</p>
              <div className="flex items-center gap-2.5">
                <label className={`flex items-center gap-2 px-3.5 py-2 rounded-btn lc-btn-secondary text-[15px] font-medium cursor-pointer ${uploadingPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-brand-green" />
                  )}
                  <span>{uploadingPhoto ? 'Saving Photo...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPhoto}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {formData.avatar && !uploadingPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-btn border border-light-border text-[14.5px] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="text-[14px] text-light-muted mt-1.5">
                PNG, JPG, WEBP • Automatically saved and updated in top-right header
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="lc-input text-[16px] w-full"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="lc-input text-[16px] w-full opacity-60 cursor-not-allowed bg-slate-100"
              />
              <p className="text-[14px] text-light-muted mt-1">Email is permanently tied to account</p>
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="lc-input text-[16px] w-full"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                Consumer Energy Category
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="lc-input text-[16px] w-full cursor-pointer"
              >
                <option value="residential">Residential / Home</option>
                <option value="farm">Farm / Agricultural</option>
                <option value="small_business">Small Business</option>
                <option value="large_business">Commercial / Large Business</option>
              </select>
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                value={formData.location.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, state: e.target.value },
                  })
                }
                className="lc-input text-[16px] w-full"
              />
            </div>

            <div>
              <label className="block text-[15.5px] font-semibold text-light-text mb-1.5">
                City / District
              </label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value },
                  })
                }
                className="lc-input text-[16px] w-full"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-light-border">
            <button
              type="submit"
              disabled={loading}
              className="lc-btn-brand text-[16.5px] font-medium py-3 px-7 disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
