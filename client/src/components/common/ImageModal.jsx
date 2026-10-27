import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Download } from 'lucide-react';

export default function ImageModal({
  isOpen,
  imageUrl,
  title = 'Enlarged Image Evidence',
  subtitle = '',
  onClose,
}) {
  const [zoom, setZoom] = useState(1);

  // Reset zoom whenever modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen, imageUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between text-white z-10 py-2 px-3 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>{title}</span>
          </h3>
          {subtitle && (
            <span className="text-[11px] text-slate-400 font-mono">{subtitle}</span>
          )}
        </div>

        {/* Toolbar & Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-white/10 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-700 rounded-lg hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-700 rounded-lg hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-brand-400 hover:text-white transition ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Open full-res original */}
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-white/10 transition"
            title="Open Original Cloudinary Asset in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white bg-rose-600/80 hover:bg-rose-600 rounded-xl transition shadow-sm ml-2"
            title="Close Preview (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto my-3 p-2 cursor-zoom-out"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-150 cursor-default select-none border border-white/10 bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom Hint */}
      <div
        className="text-[11px] text-slate-400 bg-slate-900/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        Click anywhere outside or press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200">ESC</kbd> to exit. Use zoom tools to inspect details.
      </div>
    </div>
  );
}
