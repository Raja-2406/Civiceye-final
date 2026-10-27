import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu whenever location/route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-xs text-slate-400">
        Authenticating CivicEye session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 overflow-y-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
