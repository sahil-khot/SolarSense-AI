import React, { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        search: search || undefined,
        userType: userTypeFilter !== 'all' ? userTypeFilter : undefined,
      });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-light-text tracking-tight">
            Registered Consumers Directory ({users.length})
          </h2>
          <p className="text-helper text-light-muted dark:text-dark-muted mt-0.5">
            Browse and inspect user accounts across Residential, Farm, Small Business, and Commercial sectors.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-light-muted dark:text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lc-input pl-9 text-body"
            />
          </form>

          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value)}
            className="lc-input text-body w-full sm:w-auto"
          >
            <option value="all">All Consumer Types</option>
            <option value="residential">Residential</option>
            <option value="farm">Farm / Agricultural</option>
            <option value="small_business">Small Business</option>
            <option value="large_business">Commercial</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="lc-card overflow-hidden">
        {loading ? (
          <div className="py-16">
            <LoadingSpinner text="Querying user directory..." />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 px-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-light-surface flex items-center justify-center text-light-muted mb-3 border border-light-border">
              <Users className="w-6 h-6 text-light-muted" />
            </div>
            <p className="text-[16px] font-semibold text-light-text">No registered users found</p>
            <p className="text-[14px] text-light-muted max-w-sm mt-1">
              No consumers match your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body border-collapse">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-label uppercase font-semibold text-light-muted dark:text-dark-muted tracking-wider">
                  <th className="py-3 px-4">Consumer Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Energy Category</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-4 text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border text-light-text dark:text-dark-text">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-light-surface/60 dark:hover:bg-dark-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 font-semibold text-label flex items-center justify-center">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-light-muted dark:text-dark-muted font-mono text-label">{u.email}</td>
                    <td className="py-3.5 px-3 text-light-muted dark:text-dark-muted">{u.phone || '—'}</td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-btn text-label font-medium lc-surface border border-light-border dark:border-dark-border">
                        {u.userType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-light-muted dark:text-dark-muted">
                      {u.location?.city || 'Pune'}, {u.location?.state || 'Maharashtra'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-light-muted dark:text-dark-muted text-label">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
