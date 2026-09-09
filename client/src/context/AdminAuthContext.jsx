import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));

  const adminLogin = async (credentials) => {
    const data = await authService.adminLogin(credentials);
    setAdminUser(data.user);
    setAdminToken(data.token);
    return data;
  };

  const adminLogout = () => {
    authService.adminLogout();
    setAdminUser(null);
    setAdminToken(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminAuthenticated: !!adminToken && !!adminUser && adminUser.role === 'admin',
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
