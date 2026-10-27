import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ImageModal from '../../components/common/ImageModal';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building, 
  UserCheck, 
  AlertTriangle, 
  Star, 
  Send,
  Shield,
  FileText,
  Calendar,
  Layers,
  CheckCircle,
  RotateCcw,
  CheckCheck,
  Maximize2
} from 'lucide-react';

const LIFECYCLE_STAGES = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED_AND_CLOSED'];

export default function TrackStatus() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialId = id || searchParams.get('query') || '#CMP62745974';

  const [searchId, setSearchId] = useState(initialId.startsWith('#') ? initialId : `#${initialId}`);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation feedback state
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');

  // Citizen Reopen State
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const [reopenSuccess, setReopenSuccess] = useState('');

  // Enlarged Image Lightbox State
  const [enlargedImage, setEnlargedImage] = useState(null);

  const handleReopenComplaint = async (e) => {
    e.preventDefault();
    if (!complaint || !reopenReason.trim()) return;

    setIsReopening(true);
    try {
      const res = await api.post(`/complaints/${complaint._id}/reopen`, {
        reason: reopenReason.trim(),
      });

      if (res.data.success) {
        setReopenModalOpen(false);
        setReopenSuccess('Grievance has been reopened and escalated to the Department Head.');
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setIsReopening(false);
    }
  };

  // Fetch complaint details
  const fetchComplaint = async (targetId) => {
    if (!targetId || targetId.trim() === '') return;
    setLoading(true);
    setError('');
    setConfirmSuccess('');

    try {
      const cleanId = targetId.trim().startsWith('#') ? targetId.trim() : `#${targetId.trim()}`;
      const res = await api.get(`/complaints/track/${cleanId.replace('#', '')}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      setComplaint(null);
      setError(err.response?.data?.message || `No civic complaint found with ID ${targetId}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchComplaint(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaint(searchId);
  };

  // Confirm resolution handler
  const handleConfirmResolution = async () => {
    if (!complaint) return;
    setIsConfirming(true);
    try {
      const res = await api.post(`/complaints/${complaint._id}/confirm-resolution`, {
        rating,
        feedback,
      });

      if (res.data.success) {
        setConfirmSuccess('Thank you! Resolution confirmed and grievance closed.');
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm resolution.');
    } finally {
      setIsConfirming(false);
    }
  };

  // Determine current lifecycle step index
  const getCurrentStepIndex = (status) => {
    if (status === 'CLOSED' || status === 'VERIFIED_AND_CLOSED') return 4;
    const idx = LIFECYCLE_STAGES.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tracking Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent lifecycle tracking for crowdsourced civic grievance resolution.
          </p>
        </div>

        {/* Search Bar for Tracking ID */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter #CMP tracking ID..."
            className="w-full pl-9 pr-16 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition"
          >
            Track
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading grievance records from Municipal Vault...
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Tracking Record Not Found</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <div className="pt-2">
            <button
              onClick={() => fetchComplaint('#CMP62745974')}
              className="text-xs text-brand-600 hover:underline font-medium"
            >
              Load Demo Incident (#CMP62745974)
            </button>
          </div>
        </div>
      )}

      {complaint && !loading && (
        <div className="space-y-6">
          {/* Complaint Lifecycle Progress Stepper (Figure 5.3 in Report) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Complaint Lifecycle Progress
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-base font-bold text-brand-600">
                    {complaint.trackingId}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status & SLA Badges */}
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  complaint.slaState === 'BREACHED'
                    ? 'bg-rose-100 text-rose-700'
                    : complaint.slaState === 'AT_RISK'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {complaint.slaState.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-brand-100 text-brand-700 rounded-lg">
                  {complaint.status}
                </span>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="relative pt-4 pb-2">
              <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
                {LIFECYCLE_STAGES.map((st, index) => {
                  const currentIdx = getCurrentStepIndex(complaint.status);
                  const isDone = currentIdx > index || ['CLOSED', 'VERIFIED_AND_CLOSED'].includes(complaint.status);
                  const isCurrent = currentIdx === index && !['CLOSED', 'VERIFIED_AND_CLOSED'].includes(complaint.status);

                  return (
                    <div
                      key={st}
                      className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-sky-50/80 border-brand-300 ring-2 ring-brand-500/20 shadow-sm'
                          : isDone
                          ? 'bg-white border-slate-200'
                          : 'bg-slate-50/60 border-slate-100 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-4 ring-brand-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={`text-[11px] font-bold ${isCurrent ? 'text-brand-900' : 'text-slate-700'}`}>
                        {st === 'VERIFIED_AND_CLOSED' ? 'Verified & Closed' : st.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                        {index === 0
                          ? 'Report Logged'
                          : index === 1
                          ? 'Officer Assigned'
                          : index === 2
                          ? 'Site Inspection'
                          : index === 3
                          ? 'Field Resolved'
                          : 'Dept Head Approved'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Complaint Details Card (Figure 5.3 in Report) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Info */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
                  {complaint.mainCategory} • {complaint.subcategory}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-3">{complaint.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {complaint.description}
                </p>
              </div>

              {/* Location Badge */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Geo-Tagged Location:</span>
                </div>
                <p className="font-semibold text-slate-800 pl-5">{complaint.formattedAddress}</p>
                {complaint.location?.coordinates && (
                  <p className="text-[10px] text-slate-400 pl-5">
                    Coordinates: {complaint.location.coordinates[1].toFixed(5)}, {complaint.location.coordinates[0].toFixed(5)}
                  </p>
                )}
              </div>

              {/* Uploaded Evidence Image */}
              {complaint.imageUrl && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-600" />
                      <span>Citizen Incident Evidence</span>
                    </h4>
                    <span className="text-[10px] text-brand-600 font-semibold">
                      🔍 Click to enlarge
                    </span>
                  </div>
                  <div
                    onClick={() => setEnlargedImage({
                      url: complaint.imageUrl,
                      title: `Citizen Evidence: ${complaint.title}`,
                      subtitle: `${complaint.trackingId} • ${complaint.formattedAddress || ''}`
                    })}
                    className="relative rounded-xl overflow-hidden border border-slate-200 max-w-sm cursor-zoom-in group shadow-sm hover:border-brand-400 transition"
                    title="Click to Enlarge Evidence Photo"
                  >
                    <img
                      src={complaint.imageUrl}
                      alt="Incident evidence"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1.5">
                      <Maximize2 className="w-5 h-5 drop-shadow" />
                      <span className="text-xs font-semibold drop-shadow">Enlarge Photo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* On-Site Field Resolution Proof Photo if available */}
              {complaint.verificationReport?.proofImageUrl && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Field Resolution Work Proof</span>
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      🔍 Click to enlarge
                    </span>
                  </div>
                  <div
                    onClick={() => setEnlargedImage({
                      url: complaint.verificationReport.proofImageUrl,
                      title: `Field Resolution Proof: ${complaint.trackingId}`,
                      subtitle: `Completed by ${complaint.verificationReport.verifierName || 'Field Officer'}`
                    })}
                    className="relative rounded-xl overflow-hidden border border-emerald-200 max-w-sm cursor-zoom-in group shadow-sm hover:border-emerald-400 transition"
                    title="Click to Enlarge Proof Photo"
                  >
                    <img
                      src={complaint.verificationReport.proofImageUrl}
                      alt="Resolution ground proof"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1.5">
                      <Maximize2 className="w-5 h-5 drop-shadow" />
                      <span className="text-xs font-semibold drop-shadow">Enlarge Proof Photo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit / Status History Timeline */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status History & Activity Trail
                </h4>
                <div className="space-y-3">
                  {complaint.statusHistory?.map((hist, i) => (
                    <div key={i} className="flex space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {hist.status} <span className="font-normal text-slate-500">by {hist.updatedByName} ({hist.role})</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(hist.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{hist.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Municipal Assignment & SLA Metadata */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Municipal Assignment
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Responsible Department</span>
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-brand-600" />
                      <span>{complaint.department}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Assigned Field Verifier</span>
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                      <span>{complaint.assignedVerifierName || 'Pending Assignment'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">Calculated Priority</span>
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded mt-1 ${
                      complaint.priority === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : complaint.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] block">SLA Resolution Target</span>
                    <span className="font-medium text-slate-700 text-xs block mt-0.5">
                      {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : 'Standard 48 Hours'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reopen Notification Banner if Citizen reopened */}
              {reopenSuccess && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{reopenSuccess}</span>
                </div>
              )}

              {/* Department Head Verified & Closed Block */}
              {complaint.status === 'VERIFIED_AND_CLOSED' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-950">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified & Closed by Department Head</span>
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Verified Officer: <strong>{complaint.deptHeadVerification?.verifiedByName || 'HOD'}</strong>
                  </div>
                  {complaint.deptHeadVerification?.remarks && (
                    <p className="text-[11px] text-emerald-700 italic bg-white p-2.5 rounded-xl border border-emerald-100">
                      "{complaint.deptHeadVerification.remarks}"
                    </p>
                  )}
                  <span className="text-[10px] text-emerald-600 block">
                    Verified on: {new Date(complaint.deptHeadVerification?.verifiedAt || complaint.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Reopened State Banner */}
              {complaint.status === 'REOPENED' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Grievance Reopened by Citizen</span>
                  </div>
                  <p className="text-[11px] text-rose-700 bg-white p-2.5 rounded-xl border border-rose-100">
                    Citizen Reason: "{complaint.reopenDetails?.reason || 'Issue still persists and requires re-inspection.'}"
                  </p>
                  <span className="text-[10px] text-rose-500 font-medium block">
                    Escalated back to Department Head queue for priority re-inspection.
                  </span>
                </div>
              )}

              {/* Citizen Reopen Complaint Action (Available on Verified, Resolved, or Closed cases) */}
              {['VERIFIED_AND_CLOSED', 'CLOSED', 'RESOLVED'].includes(complaint.status) && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                    <RotateCcw className="w-4 h-4 text-amber-700" />
                    <span>Issue Not Fully Resolved?</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    If the repaired fault re-occurred or the site condition remains defective, you have the right as a citizen to reopen this complaint.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReopenReason('');
                      setReopenModalOpen(true);
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen This Grievance</span>
                  </button>
                </div>
              )}

              {/* Citizen Confirmation Block (Section 3.4 & 4.3 in Report) */}
              {complaint.status === 'RESOLVED' && !complaint.citizenConfirmation?.isConfirmed && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Resolution Confirmation</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    The department has marked this issue as resolved. Please inspect the site and confirm closure with your feedback.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-emerald-800">
                      Satisfaction Rating:
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 text-base ${star <= rating ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback (e.g. Work quality is good)..."
                    className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl text-slate-800 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleConfirmResolution}
                    disabled={isConfirming}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isConfirming ? 'Closing...' : 'Confirm & Close Grievance'}</span>
                  </button>
                </div>
              )}

              {/* When Already Closed by Citizen */}
              {complaint.status === 'CLOSED' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Citizen Confirmed & Grievance Closed</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Rating: {complaint.citizenConfirmation?.rating || 5}/5 Stars
                  </p>
                  <p className="text-[11px] text-emerald-600 italic">
                    "{complaint.citizenConfirmation?.feedback || 'Satisfactorily resolved.'}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Citizen Reopen Complaint Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-amber-50 p-5 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-950">
                  Reopen Civic Complaint
                </h3>
              </div>
              <button
                onClick={() => setReopenModalOpen(false)}
                className="text-amber-500 hover:text-amber-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReopenComplaint} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Reopening this grievance will notify the <strong>{complaint?.department}</strong> Department Head immediately and flag the case for urgent escalation and re-inspection.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  State Specific Reason for Reopening *
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Ex: The water pipe started leaking again this morning, or the pothole filling has cracked open..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReopenModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReopening}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isReopening ? 'Reopening...' : 'Submit Reopening'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Enlarged Image Lightbox */}
      <ImageModal
        isOpen={!!enlargedImage}
        imageUrl={enlargedImage?.url}
        title={enlargedImage?.title}
        subtitle={enlargedImage?.subtitle}
        onClose={() => setEnlargedImage(null)}
      />
    </div>
  );
}
