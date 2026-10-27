import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CitizenOverview from './pages/citizen/CitizenOverview';
import ReportIncident from './pages/citizen/ReportIncident';
import TrackStatus from './pages/citizen/TrackStatus';
import IdentityNode from './pages/citizen/IdentityNode';
import CommandCenter from './pages/department/CommandCenter';
import CivicAnalytics from './pages/analytics/CivicAnalytics';
import VerifierPortal from './pages/verifier/VerifierPortal';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAiReview from './pages/admin/AdminAiReview';
import UserManagement from './pages/admin/UserManagement';
import HelpCenter from './pages/common/HelpCenter';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Authenticated Portal Routes */}
      <Route path="/" element={<AppLayout />}>
        {/* Citizen Routes */}
        <Route index element={<CitizenOverview />} />
        <Route path="report" element={<ReportIncident />} />
        <Route path="track" element={<TrackStatus />} />
        <Route path="track/:id" element={<TrackStatus />} />
        <Route path="profile" element={<IdentityNode />} />

        {/* Department Head Routes */}
        <Route path="dept/dashboard" element={<CommandCenter />} />
        <Route path="dept/queue" element={<CommandCenter />} />

        {/* Verifier Routes */}
        <Route path="verifier" element={<VerifierPortal />} />

        {/* Super Admin Routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/complaints" element={<AdminDashboard />} />
        <Route path="admin/ai-review" element={<AdminAiReview />} />
        <Route path="admin/users" element={<UserManagement />} />

        {/* Shared Analytics & Knowledge Base */}
        <Route path="analytics" element={<CivicAnalytics />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
