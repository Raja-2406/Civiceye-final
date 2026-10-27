import React from 'react';
import { AlertTriangle, MapPin, ExternalLink, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DuplicateWarningModal({
  isOpen,
  duplicateData,
  onProceedAnyway,
  onClose,
}) {
  const navigate = useNavigate();

  if (!isOpen || !duplicateData) return null;

  const matched = duplicateData.matchedComplaint;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-amber-50 p-5 border-b border-amber-200/80 flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900">
              Potential Duplicate Complaint Detected
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">
              CivicEye Semantic & Geospatial Intelligence detected an existing active report within 500m of this location.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-amber-500 hover:text-amber-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                {matched?.trackingId || '#CMP...'}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {Math.round(duplicateData.similarityScore * 100)}% Semantic Match
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-800">{matched?.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Category: {matched?.mainCategory}</p>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center space-x-2 pt-1 border-t border-slate-200">
              <span className="font-medium">Status:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded text-[10px]">
                {matched?.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Consolidating complaints prevents duplicate municipal work orders and accelerates issue resolution. 
            Would you like to track the existing report, or proceed if your issue is distinct?
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (matched?.trackingId) {
                navigate(`/track/${matched.trackingId.replace('#', '')}`);
              }
            }}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Track Existing Report</span>
          </button>

          <button
            type="button"
            onClick={onProceedAnyway}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/20 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Proceed (Submit New Issue)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
