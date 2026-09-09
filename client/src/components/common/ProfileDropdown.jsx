import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, LogOut, Edit3, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserTypeBadge } from '../../utils/formatters';

const ProfileDropdown = ({ onOpenEditModal }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Reset image error state when avatar changes
  useEffect(() => {
    setImgError(false);
  }, [user?.avatar]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const badge = getUserTypeBadge(user?.userType);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-btn hover:bg-light-surface transition-colors cursor-pointer border border-transparent"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Account Menu"
      >
        {user?.avatar && !imgError ? (
          <img
            key={user.avatar}
            src={user.avatar}
            alt={user?.name || 'Avatar'}
            onError={() => setImgError(true)}
            className="w-9 h-9 rounded-full object-cover border border-brand/50 shadow-subtle"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand/15 text-brand font-bold text-card-title flex items-center justify-center border border-brand/30">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}

        <div className="hidden md:block text-left">
          <p className="text-[16px] font-medium text-light-text leading-tight truncate max-w-[130px]">
            {user?.name || 'Account'}
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-light-muted transition-transform duration-150 hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-light-border rounded-card shadow-card py-2 z-50 divide-y divide-light-border">
          {/* Header Inside Dropdown */}
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3">
              {user?.avatar && !imgError ? (
                <img
                  key={user.avatar}
                  src={user.avatar}
                  alt={user?.name || 'Avatar'}
                  onError={() => setImgError(true)}
                  className="w-12 h-12 rounded-full object-cover border border-brand/50 shadow-subtle"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand text-white font-bold text-lg flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold text-light-text truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[14px] text-light-muted truncate mt-0.5">
                  {user?.email}
                </p>
                <span className="inline-block mt-1.5 text-[12.5px] font-semibold px-2.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1.5 px-1.5 space-y-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-[15.5px] font-medium text-light-text hover:bg-light-surface transition-colors"
            >
              <User className="w-4 h-4 text-brand" />
              <span>View Profile</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenEditModal) onOpenEditModal();
                else navigate('/profile');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-[15.5px] font-medium text-light-text hover:bg-light-surface transition-colors text-left cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-brand" />
              <span>Edit Profile & Photo</span>
            </button>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-[15.5px] font-medium text-light-text hover:bg-light-surface transition-colors"
            >
              <Settings className="w-4 h-4 text-brand" />
              <span>Energy Settings</span>
            </Link>
          </div>

          {/* Logout Action */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-[15.5px] font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
