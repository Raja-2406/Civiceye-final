import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  Search, 
  Filter, 
  UserPlus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building,
  UserCheck,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  Zap,
  CheckCheck,
} from 'lucide-react';

export default function CommandCenter() {
  const { user } = useAuth();
  const departmentName = user?.department || 'Roads & Infrastructure';

  // Data state
  const [complaints, setComplaints] = useState([]);
  const [kpis, setKpis] = useState({
    totalComplaints: 0,
    unassigned: 0,
    critical: 0,
    highPriority: 0,
    dueSoon: 0,
    slaBreached: 0,
    resolved: 0,
    escalated: 0,
  });
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unassigned', 'assigned'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Assign Verifier Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedVerifierId, setSelectedVerifierId] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAutoDispatching, setIsAutoDispatching] = useState(false);

  // Verify and Close Modal state (Department Head Step)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyComplaint, setVerifyComplaint] = useState(null);
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyAndClose = async (e) => {
    e.preventDefault();
    if (!verifyComplaint) return;
    setIsVerifying(true);
    try {
      const res = await api.post(`/department/verify-and-close/${verifyComplaint._id}`, {
        remarks: verifyRemarks,
      });
      if (res.data.success) {
        setVerifyModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify & close complaint.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAutoDispatchAll = async () => {
    setIsAutoDispatching(true);
    try {
      const res = await api.post('/department/auto-dispatch', { department: departmentName });
      if (res.data.success) {
        alert(res.data.message);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to auto-dispatch queue.');
    } finally {
      setIsAutoDispatching(false);
    }
  };

  // Fetch queue and staff
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        department: departmentName,
        tab: activeTab,
        status: statusFilter,
        slaStatus: slaFilter,
        priority: priorityFilter,
        search: searchQuery,
      };

      const [queueRes, staffRes] = await Promise.all([
        api.get('/department/queue', { params }),
        api.get('/department/staff', { params: { department: departmentName } }),
      ]);

      if (queueRes.data.success) {
        setComplaints(queueRes.data.complaints);
        setKpis(queueRes.data.kpis);
      }
      if (staffRes.data.success) {
        setStaffMembers(staffRes.data.staffMembers || []);
        if (staffRes.data.staffMembers?.length > 0) {
          setSelectedVerifierId(staffRes.data.staffMembers[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load department command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentName, activeTab, statusFilter, slaFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Open Assign Modal
  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignmentNote('');
    if (staffMembers.length > 0) {
      setSelectedVerifierId(complaint.assignedVerifier?._id || staffMembers[0]._id);
    }
    setAssignModalOpen(true);
  };

  // Execute Verifier Assignment
  const handleAssignVerifier = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedVerifierId) return;

    setIsAssigning(true);
    try {
      const res = await api.post('/department/assign-verifier', {
        complaintId: selectedComplaint._id,
        verifierId: selectedVerifierId,
        note: assignmentNote,
      });

      if (res.data.success) {
        setAssignModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign verifier');
    } finally {
      setIsAssigning(false);
    }
  };

  // Quick Status Transition
  const handleQuickStatusChange = async (complaintId, newStatus) => {
    try {
      const res = await api.patch(`/department/status/${complaintId}`, {
        status: newStatus,
        note: `Status updated to ${newStatus} from Command Center Operations Matrix.`,
      });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner (Figure 5.4 in Report) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
            Civic Operations Portal
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight uppercase">
            {departmentName} Department Head Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage complaints & assign verifiers • Role-based departmental scope isolation
          </p>
        </div>

        <Link
          to="/analytics"
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-500/20 transition self-start md:self-center"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Civic Analytics & Intelligence</span>
        </Link>
      </div>

      {/* 8 KPI Cards (Figure 5.4 in Report) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Total</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{kpis.totalComplaints}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-sky-600 uppercase">Unassigned</span>
          <div className="text-xl font-bold text-sky-600 mt-1">{kpis.unassigned}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-rose-600 uppercase">Critical</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{kpis.critical}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-amber-600 uppercase">High Priority</span>
          <div className="text-xl font-bold text-amber-600 mt-1">{kpis.highPriority}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-yellow-600 uppercase">Due Soon</span>
          <div className="text-xl font-bold text-yellow-600 mt-1">{kpis.dueSoon}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-red-600 uppercase">SLA Breached</span>
          <div className="text-xl font-bold text-red-600 mt-1">{kpis.slaBreached}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase">Resolved</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{kpis.resolved}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-purple-600 uppercase">Escalated</span>
          <div className="text-xl font-bold text-purple-600 mt-1">{kpis.escalated}</div>
        </div>
      </div>

      {/* Main Operations Matrix Card (Figure 5.4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Queue Tabs and Filters Header */}
        <div className="p-4 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* 3 Queue Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Complaints ({kpis.totalComplaints})
              </button>
              <button
                onClick={() => setActiveTab('unassigned')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'unassigned'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unassigned Queue ({kpis.unassigned})
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'assigned'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Assigned Queue ({kpis.totalComplaints - kpis.unassigned})
              </button>
            </div>

            {/* Auto-Dispatch Unassigned Complaints based on Availability */}
            {kpis.unassigned > 0 && (
              <button
                type="button"
                onClick={handleAutoDispatchAll}
                disabled={isAutoDispatching}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                title="Automatically assign all unassigned complaints to least-loaded available verifiers"
              >
                <Zap className={`w-3.5 h-3.5 ${isAutoDispatching ? 'animate-spin' : ''}`} />
                <span>{isAutoDispatching ? 'Auto-Dispatching...' : `Auto-Assign (${kpis.unassigned} Pending)`}</span>
              </button>
            )}

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matrix..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </form>
          </div>

          {/* Workflow Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED (Pending Dept Head Close)</option>
              <option value="VERIFIED_AND_CLOSED">VERIFIED & CLOSED</option>
              <option value="REOPENED">REOPENED BY CITIZEN</option>
            </select>

            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All SLA Statuses</option>
              <option value="ON_TRACK">ON TRACK</option>
              <option value="AT_RISK">AT RISK (Due Soon)</option>
              <option value="BREACHED">SLA BREACHED</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>

            <button
              onClick={() => {
                setStatusFilter('ALL');
                setSlaFilter('ALL');
                setPriorityFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Matrix Table (Figure 5.4: Roads Department Operations Matrix) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Issue Details</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Verifier</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">SLA State</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading department operations matrix...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No complaints matching the active queue criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const isAssigned = !!c.assignedVerifier;
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-brand-600 whitespace-nowrap">
                        {c.trackingId}
                      </td>

                      {/* Issue Details */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{c.description}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.formattedAddress}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {c.department}
                      </td>

                      {/* Assigned Verifier */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isAssigned ? (
                          <span className="font-semibold text-slate-800 flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{c.assignedVerifierName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 font-bold text-[10px] rounded ${
                          c.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : c.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {c.priority}
                        </span>
                      </td>

                      {/* SLA State Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 font-semibold text-[10px] rounded-full ${
                          c.slaState === 'BREACHED'
                            ? 'bg-rose-100 text-rose-700'
                            : c.slaState === 'AT_RISK'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.slaState.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 font-bold text-[10px] bg-slate-100 text-slate-800 rounded">
                          {c.status}
                        </span>
                      </td>

                      {/* Actions (Assign / Reassign / Verify & Close / Details) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        {c.status === 'RESOLVED' && (
                          <button
                            onClick={() => {
                              setVerifyComplaint(c);
                              setVerifyRemarks('');
                              setVerifyModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm inline-flex items-center space-x-1 transition"
                            title="Review Field Proof & Verify Closure"
                          >
                            <CheckCheck className="w-3 h-3" />
                            <span>Verify & Close</span>
                          </button>
                        )}

                        {['SUBMITTED', 'REOPENED'].includes(c.status) && !isAssigned && (
                          <button
                            onClick={() => openAssignModal(c)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                          >
                            Assign Verifier
                          </button>
                        )}

                        {isAssigned && c.status !== 'VERIFIED_AND_CLOSED' && (
                          <button
                            onClick={() => openAssignModal(c)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            Reassign Verifier
                          </button>
                        )}

                        <Link
                          to={`/track/${c.trackingId.replace('#', '')}`}
                          className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-block transition"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Verifier Modal */}
      {assignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {selectedComplaint.assignedVerifier ? 'Reassign Verifier' : 'Assign Field Verifier'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Incident: {selectedComplaint.trackingId}
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignVerifier} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Department Verifier *
                </label>
                <select
                  value={selectedVerifierId}
                  onChange={(e) => setSelectedVerifierId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  required
                >
                  {staffMembers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Field Inspection Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="Ex: Verify pothole depth and initiate patch repair before evening peak traffic..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow transition"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Verify & Close Modal (Department Head Step) */}
      {verifyModalOpen && verifyComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-50 p-5 border-b border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CheckCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Verify & Close Grievance
                  </h3>
                  <p className="text-xs text-emerald-700 font-mono">
                    Incident: {verifyComplaint.trackingId} • {verifyComplaint.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-emerald-500 hover:text-emerald-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyAndClose} className="p-5 space-y-4 text-xs">
              {/* Field Verifier Findings Inspection */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Field Officer: {verifyComplaint.assignedVerifierName || 'Verifier'}</span>
                  <span className="text-emerald-600">Field Work Completed</span>
                </div>

                {verifyComplaint.verificationReport?.notes && (
                  <p className="text-slate-600 text-[11px] italic bg-white p-2.5 rounded-lg border border-slate-100">
                    "{verifyComplaint.verificationReport.notes}"
                  </p>
                )}

                {verifyComplaint.verificationReport?.proofImageUrl && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">
                      On-Site Ground Proof Image:
                    </span>
                    <div className="h-32 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={verifyComplaint.verificationReport.proofImageUrl}
                        alt="Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Department Head Verification Remarks *
                </label>
                <textarea
                  rows={3}
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  placeholder="Ex: Inspected repair photo against road restoration specifications. Confirmed rectified and officially closed."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{isVerifying ? 'Verifying...' : 'Verify & Close Complaint'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
