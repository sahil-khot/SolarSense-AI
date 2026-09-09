import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Menu, X, ArrowRight, LayoutDashboard, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import Logo from './Logo';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Solutions', path: '/solutions' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-light-border shadow-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Official Logo & Brand */}
          <Link to="/" className="flex items-center transition-transform hover:opacity-95">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-btn text-[16px] font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-brand font-semibold bg-brand/10'
                    : 'text-light-muted hover:text-light-text hover:bg-light-surface'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Controls: Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-light-border">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-btn bg-light-surface text-light-text hover:text-brand font-medium text-[16px] border border-light-border transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand" />
                  <span>Dashboard</span>
                </Link>
                <div className="w-9 h-9 rounded-full bg-light-surface border border-light-border text-brand flex items-center justify-center font-bold text-body overflow-hidden">
                  {user?.avatar ? (
                    <img
                      key={user.avatar}
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-btn text-light-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-btn text-[16px] font-medium text-light-text hover:text-brand hover:bg-light-surface transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="lc-btn-brand text-[16px] font-medium px-4 py-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle Buttons */}
          <div className="flex md:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn text-light-muted hover:text-light-text hover:bg-light-surface"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-light-border bg-white px-5 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-btn text-[16px] font-medium ${
                isActive(link.path)
                  ? 'text-brand font-semibold bg-brand/10'
                  : 'text-light-muted hover:bg-light-surface hover:text-light-text'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-light-border space-y-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn bg-brand text-white font-medium text-[16px]"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn text-rose-500 font-medium text-[16px] hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn border border-light-border text-light-text font-medium text-[16px] hover:bg-light-surface"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 lc-btn-brand text-[16px] font-medium py-2.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
