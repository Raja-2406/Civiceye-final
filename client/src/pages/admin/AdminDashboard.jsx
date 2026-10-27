import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Building, 
  Search, 
  Filter, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Edit3
} from 'lucide-react';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Priority Reassignment Modal
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [newPriority, setNewPriority] = useState('CRITICAL');
  const [reassignReason, setReassignReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCityComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints', {
        params: {
          department: deptFilter,
          priority: priorityFilter,
          search: searchQuery,
        },
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCityComplaints();
  }, [deptFilter, priorityFilter]);

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    if (!targetComplaint) return;

    setIsUpdating(true);
    try {
      const res = await api.patch(`/admin/reassign-priority/${targetComplaint._id}`, {
        newPriority,
        reason: reassignReason,
      });

      if (res.data.success) {
        setPriorityModalOpen(false);
        fetchCityComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign priority');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
            Super Administration & Oversight
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
            City-Wide Municipal Grievance Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-departmental monitoring, priority overrides, and operational audit trail
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/ai-review"
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition"
          >
            <Cpu className="w-4 h-4 text-brand-600" />
            <span>AI Model Review</span>
          </Link>
          <Link
            to="/analytics"
            className="flex items-center space-x-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-500/20 transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Civic Analytics</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Streetlights & Electricity">Streetlights & Electricity</option>
            <option value="Waste Management & Sanitation">Waste Management & Sanitation</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Public Safety & Other Civic Hazards">Public Safety & Other Civic Hazards</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCityComplaints();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking ID, title..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Priority (Override)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading municipal grievances...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-brand-600 whitespace-nowrap">
                      {c.trackingId}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{c.subcategory} • {c.formattedAddress}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                      {c.department}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div>{c.citizenName}</div>
                      <div className="text-[10px] text-slate-400">{c.citizenPhone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setTargetComplaint(c);
                          setNewPriority(c.priority);
                          setReassignReason('');
                          setPriorityModalOpen(true);
                        }}
                        className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center space-x-1 hover:ring-2 hover:ring-slate-300 transition ${
                          c.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : c.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title="Click to Reassign Priority"
                      >
                        <span>{c.priority}</span>
                        <Edit3 className="w-2.5 h-2.5" />
                      </button>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/track/${c.trackingId.replace('#', '')}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg inline-block transition text-[11px]"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Reassignment Modal (Section 4.9) */}
      {priorityModalOpen && targetComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Super Admin Priority Override
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Complaint: {targetComplaint.trackingId}
                </p>
              </div>
              <button
                onClick={() => setPriorityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePrioritySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Assign New Priority *
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-semibold"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Dispatch)</option>
                  <option value="HIGH">HIGH (Urgent Municipal Issue)</option>
                  <option value="MEDIUM">MEDIUM (Standard Queue)</option>
                  <option value="LOW">LOW (Deferred / Low Risk)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Administrative Reason *
                </label>
                <textarea
                  rows={3}
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="Enter reason for priority reassignment (e.g., VIP route, public protest hazard, school zone)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPriorityModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow transition"
                >
                  {isUpdating ? 'Updating...' : 'Save Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
