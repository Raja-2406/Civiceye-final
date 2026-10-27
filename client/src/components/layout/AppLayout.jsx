import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { user, loading } = useAuth();

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
