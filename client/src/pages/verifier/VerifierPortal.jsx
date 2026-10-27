import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ImageModal from '../../components/common/ImageModal';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import { 
  CheckSquare, 
  MapPin, 
  Clock, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Camera,
  MessageSquare,
  Play,
  ArrowRight,
  ShieldAlert,
  CheckCheck,
  Maximize2
} from 'lucide-react';

export default function VerifierPortal() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [inspectionTargetStatus, setInspectionTargetStatus] = useState('IN_PROGRESS');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Enlarged Image Modal & Camera States
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isVerifierCameraOpen, setIsVerifierCameraOpen] = useState(false);

  // Department Head Remarks Details Modal
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [activeRemarkComplaint, setActiveRemarkComplaint] = useState(null);

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const res = await api.get('/verifier/assigned');
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
    fetchAssigned();
  }, []);

  // Step 1: Start Inspection (ASSIGNED -> IN_PROGRESS)
  const openStartInspection = (c) => {
    setSelectedComplaint(c);
    setInspectionTargetStatus('IN_PROGRESS');
    setInspectionNotes('Site inspection initiated by field officer.');
    setProofFile(null);
    setProofPreview('');
    setErrorMessage('');
    setInspectModalOpen(true);
  };

  // Step 2: Complete & Mark Resolved (IN_PROGRESS -> RESOLVED)
  const openCompleteResolution = (c) => {
    setSelectedComplaint(c);
    setInspectionTargetStatus('RESOLVED');
    setInspectionNotes('');
    setProofFile(null);
    setProofPreview('');
    setErrorMessage('');
    setInspectModalOpen(true);
  };

  const openRemarksModal = (c) => {
    setActiveRemarkComplaint(c);
    setRemarksModalOpen(true);
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5 MB limit.');
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setErrorMessage('');

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', inspectionTargetStatus);
      formData.append('notes', inspectionNotes);
      if (proofFile) {
        formData.append('proofImage', proofFile);
      }

      const res = await api.post(`/verifier/inspect/${selectedComplaint._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setInspectModalOpen(false);
        fetchAssigned();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update inspection status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
            Field Officer Operations
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
            Assigned Field Inspections Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict sequential process: <strong>Assigned $\rightarrow$ In Progress $\rightarrow$ Field Resolved</strong> $\rightarrow$ Dept Head Close
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading assigned tasks...</div>
      ) : complaints.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Queue is Clear!</h3>
          <p className="text-xs text-slate-500">
            You currently have no pending field inspections assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {complaints.map((c) => {
            const isAssignedOrReopened = ['ASSIGNED', 'REOPENED'].includes(c.status);
            const isInProgress = c.status === 'IN_PROGRESS';
            const isResolvedOrClosed = ['RESOLVED', 'VERIFIED_AND_CLOSED', 'CLOSED'].includes(c.status);

            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {c.trackingId}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      c.priority === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : c.priority === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.priority}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{c.description}</p>
                  </div>

                  {/* Department Head Remarks Card (Directly visible & clickable) */}
                  <div 
                    onClick={() => openRemarksModal(c)}
                    className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/70 transition space-y-1"
                    title="Click to view full Department Head instructions"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span className="flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        <span>HOD Remarks / Instructions:</span>
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold underline">
                        Read All
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950 font-medium line-clamp-2 pl-5 italic">
                      "{c.deptHeadInstructions || 'Standard municipal field inspection guidelines apply.'}"
                    </p>
                  </div>

                  {/* If Reopened, show Citizen's Grievance */}
                  {c.status === 'REOPENED' && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-rose-900 font-bold text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Citizen Reopen Reason:</span>
                      </div>
                      <p className="text-rose-950 text-[11px] italic pl-5 line-clamp-2">
                        "{c.reopenDetails?.reason || 'Issue still persists.'}"
                      </p>
                    </div>
                  )}

                  {/* Location & SLA Badge */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">{c.formattedAddress}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>SLA: {c.slaState.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Citizen Attached Evidence Photo */}
                  {c.imageUrl && (
                    <div
                      onClick={() => setEnlargedImage({
                        url: c.imageUrl,
                        title: `Citizen Evidence: ${c.title}`,
                        subtitle: `${c.trackingId} • ${c.formattedAddress || ''}`
                      })}
                      className="relative h-28 rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in group shadow-sm hover:border-brand-400 transition"
                      title="Click to Enlarge Evidence Photo"
                    >
                      <img src={c.imageUrl} alt="Citizen report evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1.5">
                        <Maximize2 className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">Enlarge</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workflow Enforcement Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    c.status === 'REOPENED'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : c.status === 'IN_PROGRESS'
                      ? 'bg-amber-100 text-amber-800'
                      : c.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {c.status.replace('_', ' ')}
                  </span>

                  {/* Step 1: Assigned/Reopened -> Can ONLY move to IN_PROGRESS */}
                  {isAssignedOrReopened && (
                    <button
                      onClick={() => openStartInspection(c)}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start Inspection</span>
                    </button>
                  )}

                  {/* Step 2: IN_PROGRESS -> Can now move to RESOLVED */}
                  {isInProgress && (
                    <button
                      onClick={() => openCompleteResolution(c)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  {/* Step 3: RESOLVED / VERIFIED_AND_CLOSED */}
                  {isResolvedOrClosed && (
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center space-x-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {c.status === 'VERIFIED_AND_CLOSED' ? 'HOD Closed' : 'Waiting HOD Review'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sequential Process Modal: Step 1 (In Progress) OR Step 2 (Resolved) */}
      {inspectModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className={`p-5 border-b flex items-center justify-between ${
              inspectionTargetStatus === 'IN_PROGRESS'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div>
                <h3 className="text-sm font-bold">
                  {inspectionTargetStatus === 'IN_PROGRESS'
                    ? 'Step 1: Start Field Inspection (Move to IN PROGRESS)'
                    : 'Step 2: Submit Completion & Resolution (Move to RESOLVED)'}
                </h3>
                <p className="text-xs font-mono mt-0.5 opacity-80">
                  Incident: {selectedComplaint.trackingId} • {selectedComplaint.title}
                </p>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="m-5 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitInspection} className="p-5 space-y-4 text-xs">
              {/* Department Head Remarks Banner inside modal for reference */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 text-[11px] block">
                  Department Head Instructions:
                </span>
                <p className="text-amber-950 text-[11px] italic">
                  "{selectedComplaint.deptHeadInstructions || 'Follow standard inspection protocols.'}"
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enforced Next State
                </label>
                <input
                  type="text"
                  disabled
                  value={inspectionTargetStatus}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {inspectionTargetStatus === 'IN_PROGRESS'
                    ? 'Sequential Workflow: You must start work first before completing resolution.'
                    : 'Final Step: You are marking field work complete for Department Head verification.'}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {inspectionTargetStatus === 'IN_PROGRESS'
                    ? 'Site Departure / Inspection Notes *'
                    : 'Resolution Findings & Work Done *'}
                </label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder={
                    inspectionTargetStatus === 'IN_PROGRESS'
                      ? 'Ex: Arrived at location. Mobilizing road patching crew and asphalt mix...'
                      : 'Ex: Pothole excavated, cold-mix asphalt laid and compacted with vibratory roller. Restored to level.'
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              {/* Upload Ground Proof Photo (Recommended on Resolved) */}
              {inspectionTargetStatus === 'RESOLVED' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">
                      Upload On-Site Ground Proof Photo (Cloudinary) *
                    </label>
                    {proofPreview && (
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Proof Ready
                      </span>
                    )}
                  </div>

                  {!proofPreview ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsVerifierCameraOpen(true)}
                        className="py-3 px-3 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                      >
                        <Camera className="w-4 h-4 text-brand-600" />
                        <span>Take Live Photo</span>
                      </button>

                      <label className="py-3 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer">
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div
                        onClick={() => setEnlargedImage({
                          url: proofPreview,
                          title: 'Verification Proof Preview',
                          subtitle: selectedComplaint?.trackingId || ''
                        })}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 cursor-zoom-in group shrink-0"
                        title="Click to Enlarge Proof"
                      >
                        <img src={proofPreview} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-800 block truncate">
                          {proofFile?.name || 'On-site Proof Photo'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEnlargedImage({
                            url: proofPreview,
                            title: 'Verification Proof Preview',
                            subtitle: selectedComplaint?.trackingId || ''
                          })}
                          className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold underline"
                        >
                          Enlarge preview
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreview('');
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 bg-rose-50 rounded-lg border border-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-white font-semibold rounded-xl shadow transition ${
                    inspectionTargetStatus === 'IN_PROGRESS'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : inspectionTargetStatus === 'IN_PROGRESS'
                    ? 'Confirm: Move to IN PROGRESS'
                    : 'Confirm: Mark RESOLVED'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Full Department Head Remarks Modal */}
      {remarksModalOpen && activeRemarkComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-amber-50 p-5 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-950">
                  Department Head Instructions
                </h3>
              </div>
              <button
                onClick={() => setRemarksModalOpen(false)}
                className="text-amber-500 hover:text-amber-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Complaint Reference</span>
                <span className="font-mono font-bold text-brand-700">{activeRemarkComplaint.trackingId}</span>
                <p className="font-semibold text-slate-800">{activeRemarkComplaint.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{activeRemarkComplaint.formattedAddress}</p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">
                  Official HOD Remarks:
                </span>
                <p className="text-amber-950 leading-relaxed font-medium">
                  {activeRemarkComplaint.deptHeadInstructions || 'No custom remarks provided. Follow standard field inspection and restoration protocol.'}
                </p>
              </div>

              {/* Status History Audit Trail for Department Head notes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Assignment Timeline & Notes
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeRemarkComplaint.statusHistory?.filter(h => h.role === 'dept_head' || h.role === 'system').map((h, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span>{h.status}</span>
                        <span className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setRemarksModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Live Camera Capture Modal for Verifier Ground Proof */}
      <CameraCaptureModal
        isOpen={isVerifierCameraOpen}
        onCapture={(file, previewUrl) => {
          setProofFile(file);
          setProofPreview(previewUrl);
        }}
        onClose={() => setIsVerifierCameraOpen(false)}
      />

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
