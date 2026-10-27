import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';

export default function CitizenOverview() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const res = await api.get('/complaints/my');
        if (res.data.success) {
          setComplaints(res.data.complaints);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, []);

  const total = complaints.length;
  const inProgress = complaints.filter(c => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
  const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const submitted = complaints.filter(c => c.status === 'SUBMITTED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-700 to-sky-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-sky-200 font-semibold">
            Citizen Grievance Portal
          </span>
          <h1 className="text-xl font-bold mt-1">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            You are empowered as an active civic sensor for Sathyamangalam municipality. 
            Report road hazards, power faults, sanitation concerns and track their live resolution.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/report"
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-sky-50 font-semibold text-xs rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
          <Link
            to="/track"
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-800/60 hover:bg-brand-800 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
          >
            <Search className="w-4 h-4" />
            <span>Track Status</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reported</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">{total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime grievances</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-bold text-amber-600 mt-2">{inProgress}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active field work</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved / Closed</span>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{resolved}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Completed issues</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Submitted</span>
          <div className="text-2xl font-bold text-sky-600 mt-2">{submitted}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting assignment</span>
        </div>
      </div>

      {/* Recent Submissions List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            My Submitted Complaints
          </h2>
          <Link to="/report" className="text-xs text-brand-600 hover:underline font-semibold">
            + File Another Grievance
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">You haven't reported any civic issues yet.</p>
            <Link
              to="/report"
              className="inline-block mt-2 text-xs font-semibold text-brand-600 hover:underline"
            >
              Report your first civic issue
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-3 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {c.trackingId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{c.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'RESOLVED' || c.status === 'CLOSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{c.formattedAddress}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link
                  to={`/track/${c.trackingId.replace('#', '')}`}
                  className="flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition self-start sm:self-center"
                >
                  <span>Track Lifecycle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
