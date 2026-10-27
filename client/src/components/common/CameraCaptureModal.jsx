import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, SwitchCamera } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Stop camera tracks cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream
  const startCamera = async (mode = facingMode) => {
    stopStream();
    setCameraError('');
    setCapturedBlob(null);
    setCapturedPreview('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      // Check device cameras count
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (e) {
        // ignore device enum error
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('[CivicEye Camera Error]', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(err.message || 'Unable to access device camera.');
      }
    }
  };

  // Launch camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedBlob(null);
      setCapturedPreview('');
      setCameraError('');
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Snap photo from video frame
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Convert to JPEG blob
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const previewUrl = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedPreview(previewUrl);
        stopStream(); // Freeze/stop camera once snapped
      },
      'image/jpeg',
      0.9
    );
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedBlob(null);
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
      setCapturedPreview('');
    }
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirmPhoto = () => {
    if (!capturedBlob) return;
    const filename = `civiceye-live-${Date.now()}.jpg`;
    const file = new File([capturedBlob], filename, { type: 'image/jpeg' });
    onCapture(file, capturedPreview);
    onClose();
  };

  // Mobile native camera fallback
  const handleNativeCameraFallback = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onCapture(file, preview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Live Camera Evidence</h3>
              <p className="text-[11px] text-slate-400">Capture geo-referenced photo of civic fault</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-rose-300 font-semibold">{cameraError}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can use your device's native camera application below:
                </p>
              </div>
              <label className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow transition">
                <Camera className="w-4 h-4" />
                <span>Launch Native Device Camera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraFallback}
                  className="hidden"
                />
              </label>
            </div>
          ) : capturedPreview ? (
            /* Captured Snapshot Preview */
            <img
              src={capturedPreview}
              alt="Live Snapshot Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            /* Live Stream Video Viewfinder */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Reticle / Viewfinder Frame Overlay */}
              <div className="absolute inset-4 pointer-events-none border-2 border-white/20 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-brand-400"></div>
                  <div className="w-4 h-4 border-t-2 border-r-2 border-brand-400"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-brand-400"></div>
                  <div className="w-4 h-4 border-b-2 border-r-2 border-brand-400"></div>
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-sm text-[10px] text-emerald-400 px-2 py-0.5 rounded-md flex items-center space-x-1.5 border border-emerald-500/30 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE FEED</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {capturedPreview ? (
            /* Retake or Confirm */
            <div className="w-full flex items-center justify-between space-x-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </div>
          ) : !cameraError ? (
            /* Shutter & Camera Flip Controls */
            <div className="w-full flex items-center justify-between">
              {/* Flip Camera Button */}
              {hasMultipleCameras ? (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 flex items-center space-x-1.5 text-xs"
                  title="Switch Front/Rear Camera"
                >
                  <SwitchCamera className="w-4 h-4" />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              ) : (
                <div className="w-10"></div>
              )}

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="group relative w-14 h-14 rounded-full border-4 border-white flex items-center justify-center bg-brand-600 hover:bg-brand-500 shadow-xl transition-all active:scale-95 mx-auto"
                title="Capture Live Photo"
              >
                <div className="w-10 h-10 rounded-full bg-white group-hover:scale-90 transition-transform"></div>
              </button>

              {/* Native Camera input alternative */}
              <label
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 cursor-pointer text-xs flex items-center space-x-1.5"
                title="Use Native Phone App Camera"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Native App</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraFallback}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            /* If error, close option */
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
