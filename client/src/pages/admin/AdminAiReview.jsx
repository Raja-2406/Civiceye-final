import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Edit2, 
  RefreshCw,
  Building
} from 'lucide-react';

const TAXONOMY_OPTIONS = {
  'Roads & Infrastructure': [
    'Pothole',
    'Damaged Road Surface',
    'Broken Footpath/Pavement',
    'Missing Manhole Cover',
    'Bridge/Flyover Defect',
  ],
  'Streetlights & Electricity': [
    'Streetlight Outage',
    'Exposed/Hanging Electric Wire',
    'Sparking Electric Pole',
    'Damaged Transformer',
  ],
  'Waste Management & Sanitation': [
    'Garbage Dump Accumulation',
    'Overflowing Community Bin',
    'Dead Animal Removal',
    'Sewage Overflow / Clogged Drain',
  ],
  'Water Supply': [
    'Pipeline Leakage / Burst',
    'Contaminated Drinking Water',
    'Low Water Pressure',
    'No Water Supply',
  ],
  'Public Safety & Other Civic Hazards': [
    'Fallen Tree / Heavy Branches',
    'Dangerous Open Trench',
    'Stray Dog / Animal Menace',
    'Structural Collapse Risk',
  ],
};

export default function AdminAiReview() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Correction modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [correctedCategory, setCorrectedCategory] = useState('Roads & Infrastructure');
  const [correctedSubcategory, setCorrectedSubcategory] = useState('Pothole');
  const [correctionNote, setCorrectionNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints');
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
    fetchComplaints();
  }, []);

  const openCorrection = (c) => {
    setSelectedComplaint(c);
    setCorrectedCategory(c.mainCategory || 'Roads & Infrastructure');
    setCorrectedSubcategory(c.subcategory || 'Pothole');
    setCorrectionNote('');
    setModalOpen(true);
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSaving(true);
    try {
      const res = await api.patch(`/admin/correct-category/${selectedComplaint._id}`, {
        correctedCategory,
        correctedSubcategory,
        notes: correctionNote,
      });

      if (res.data.success) {
        setModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
            Machine Learning Oversight
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
            AI Classification Review & Manual Correction
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise NLP category predictions, inspect confidence scores, and re-route misclassified grievances.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading AI metadata...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {complaints.map((c) => {
            const ai = c.aiClassification || {};
            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                      {c.trackingId}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate max-w-xs">{c.title}</span>
                  </div>

                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{ai.isAiAssisted ? 'Google Gemini' : 'Rule Engine'}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>

                {/* AI Classification Block */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">Assigned Taxonomy:</span>
                    <span className="font-bold text-brand-700">{c.mainCategory} ({c.subcategory})</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Target Department:</span>
                    <span className="font-semibold text-slate-800 flex items-center space-x-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{c.department}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Confidence Score:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {ai.confidenceScore ? `${Math.round(ai.confidenceScore * 100)}%` : '92%'}
                    </span>
                  </div>

                  {ai.explanation && (
                    <div className="text-[10px] text-slate-500 italic border-t border-slate-200 pt-1">
                      "{ai.explanation}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400">
                    {ai.reviewedByAdmin ? '✓ Reviewed by Admin' : 'Unreviewed'}
                  </span>

                  <button
                    onClick={() => openCorrection(c)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Correct Taxonomy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Correction Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Manual Taxonomy & Routing Correction
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Complaint: {selectedComplaint.trackingId}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Corrected Main Category *
                </label>
                <select
                  value={correctedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setCorrectedCategory(cat);
                    if (TAXONOMY_OPTIONS[cat]) setCorrectedSubcategory(TAXONOMY_OPTIONS[cat][0]);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  {Object.keys(TAXONOMY_OPTIONS).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Corrected Subcategory *
                </label>
                <select
                  value={correctedSubcategory}
                  onChange={(e) => setCorrectedSubcategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                >
                  {TAXONOMY_OPTIONS[correctedCategory]?.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Correction Audit Note
                </label>
                <textarea
                  rows={2}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="Reason for overriding NLP categorization..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow"
                >
                  {isSaving ? 'Re-routing...' : 'Update & Re-route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
