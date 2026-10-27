import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LocationPicker from '../../components/common/LocationPicker';
import DuplicateWarningModal from '../../components/common/DuplicateWarningModal';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import ImageModal from '../../components/common/ImageModal';
import { 
  Sparkles, 
  Upload, 
  Camera,
  MapPin, 
  AlertCircle, 
  ShieldCheck, 
  Radio, 
  Compass, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';

const TAXONOMY_OPTIONS = {
  'Roads & Infrastructure': [
    'Pothole',
    'Damaged Road Surface',
    'Broken Footpath/Pavement',
    'Missing Manhole Cover',
    'Bridge/Flyover Defect',
    'Illegal Road Cutting',
  ],
  'Streetlights & Electricity': [
    'Streetlight Outage',
    'Exposed/Hanging Electric Wire',
    'Sparking Electric Pole',
    'Damaged Transformer',
    'Open Distribution Box',
  ],
  'Waste Management & Sanitation': [
    'Garbage Dump Accumulation',
    'Overflowing Community Bin',
    'Dead Animal Removal',
    'Sewage Overflow / Clogged Drain',
    'Public Toilet Sanitation',
    'Littering Hotspot',
  ],
  'Water Supply': [
    'Pipeline Leakage / Burst',
    'Contaminated Drinking Water',
    'Low Water Pressure',
    'No Water Supply',
    'Borewell Malfunction',
  ],
  'Public Safety & Other Civic Hazards': [
    'Fallen Tree / Heavy Branches',
    'Dangerous Open Trench',
    'Stray Dog / Animal Menace',
    'Unauthorized Encroachment',
    'Structural Collapse Risk',
  ],
};

export default function ReportIncident() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainCategory, setMainCategory] = useState('Roads & Infrastructure');
  const [subcategory, setSubcategory] = useState('Pothole');
  const [locationData, setLocationData] = useState({
    latitude: 11.5034,
    longitude: 77.2764,
    formattedAddress: 'Sathy – Athani – Bhavani Road, Satyamangalam',
    locality: 'Athani Road',
    city: 'Satyamangalam',
    pincode: '638401',
    gpsAccuracy: 8,
  });

  // Media
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState('');

  // AI & Duplicate states
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nearbyComplaints, setNearbyComplaints] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update subcategories when main category changes
  useEffect(() => {
    if (TAXONOMY_OPTIONS[mainCategory]) {
      setSubcategory(TAXONOMY_OPTIONS[mainCategory][0]);
    }
  }, [mainCategory]);

  // Live duplicate check whenever location or title changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!locationData.latitude || !locationData.longitude) return;
      try {
        const res = await api.post('/complaints/check-duplicate', {
          title,
          description,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          mainCategory,
        });

        if (res.data.success) {
          setNearbyComplaints(res.data.nearbyComplaints || []);
          if (res.data.isDuplicate && !duplicateDismissed && title.trim().length > 3) {
            setDuplicateWarning(res.data);
          }
        }
      } catch (err) {
        // silent fail for live check
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, description, locationData.latitude, locationData.longitude, mainCategory, duplicateDismissed]);

  // Handle AI Auto-Classification assist
  const handleAiAutoClassify = async () => {
    if (!title.trim() && !description.trim()) {
      alert('Please enter an incident title or narrative first for AI classification.');
      return;
    }

    setIsClassifying(true);
    try {
      const res = await api.post('/complaints/classify-preview', {
        title,
        description,
      });

      if (res.data.success && res.data.aiResult) {
        const result = res.data.aiResult;
        setAiResult(result);
        if (TAXONOMY_OPTIONS[result.predictedCategory]) {
          setMainCategory(result.predictedCategory);
          setSubcategory(result.predictedSubcategory);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  // Image file handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5 MB limit. Please select a smaller image.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide an incident title.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please describe the observed civic issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('mainCategory', mainCategory);
      formData.append('subcategory', subcategory);
      formData.append('latitude', locationData.latitude);
      formData.append('longitude', locationData.longitude);
      formData.append('formattedAddress', locationData.formattedAddress);
      formData.append('locality', locationData.locality);
      formData.append('city', locationData.city);
      formData.append('pincode', locationData.pincode);
      formData.append('gpsAccuracy', locationData.gpsAccuracy);
      formData.append('duplicateWarningDismissed', duplicateDismissed);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const trackingId = res.data.complaint.trackingId;
        navigate(`/track/${trackingId.replace('#', '')}`);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit complaint. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Report Incident</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit a civic grievance with geotagged evidence for municipal resolution.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid: Left Intelligence Panel (Figure 5.1) + Right Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Intelligence, Guide & Nearby Radius (Figure 5.1 & 5.2) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Citizen Reporting Intelligence Card */}
          <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 text-sky-300">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-white tracking-tight">
              Citizen Reporting Intelligence
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Our platform automatically checks for duplicate complaints, secures media uploads, and routes issues to the municipal response team.
            </p>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-[11px] font-semibold tracking-wide uppercase">
              <div className="flex items-center space-x-2 text-sky-300">
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Intelligent Duplicate Detection</span>
              </div>
              <div className="flex items-center space-x-2 text-sky-300">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>High-Precision GPS Sampling</span>
              </div>
              <div className="flex items-center space-x-2 text-sky-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Building-Level Reverse Geocoding</span>
              </div>
            </div>
          </div>

          {/* Submission Guide Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Submission Guide
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-800">Incident Title:</strong> Concise description of the observed defect.
                </div>
              </div>
              <div className="flex space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-800">Interactive Geo-Location:</strong> Drag the map marker, use GPS, or search for precise coordinates.
                </div>
              </div>
              <div className="flex space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-800">Media Evidence:</strong> Secure image upload (JPG, PNG or WEBP, maximum 5 MB).
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Complaints (500m Radius) Panel (Figure 5.2 in Report) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-brand-600" />
                <span>Nearby Complaints (10m Radius)</span>
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {nearbyComplaints.length} found
              </span>
            </div>

            {nearbyComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No active complaints reported within 10m of this location. Your report is clean!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {nearbyComplaints.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => navigate(`/track/${c.trackingId.replace('#', '')}`)}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-xs cursor-pointer transition space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-700 text-[11px]">
                        {c.trackingId}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                        {c.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate">{c.title}</div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{c.mainCategory}</span>
                      <span className="text-brand-600 font-semibold">{c.distanceMeters}m away</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Incident Submission Form (Figure 5.1) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & AI Assist */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Incident Title *
                </label>
                <button
                  type="button"
                  onClick={handleAiAutoClassify}
                  disabled={isClassifying}
                  className="flex items-center space-x-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold px-2.5 py-1 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin' : ''}`} />
                  <span>{isClassifying ? 'Analyzing NLP...' : 'AI Auto-Classify'}</span>
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Large Pothole Near Bus Stop, Broken Streetlight Pole..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            {/* AI Classification Feedback Banner */}
            {aiResult && (
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-900 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>AI Classifier Recommendation</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-200/60 text-sky-800">
                    {Math.round(aiResult.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <p className="text-sky-800 text-[11px]">{aiResult.explanation}</p>
                <div className="text-[11px] text-sky-900 pt-1 flex items-center space-x-3">
                  <span>Category: <strong>{aiResult.predictedCategory}</strong></span>
                  <span>Subcategory: <strong>{aiResult.predictedSubcategory}</strong></span>
                  <span>Severity: <strong>{aiResult.predictedSeverity}</strong></span>
                </div>
              </div>
            )}

            {/* Category and Subcategory (Figure 5.1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Main Category *
                </label>
                <select
                  value={mainCategory}
                  onChange={(e) => setMainCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {Object.keys(TAXONOMY_OPTIONS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subcategory *
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {TAXONOMY_OPTIONS[mainCategory]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Incident Narrative (Figure 5.1) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Incident Narrative *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a clear description of the observed issue, affected public safety, landmarks..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                required
              />
            </div>

            {/* Geo-Location Section with Interactive Map (Figure 5.2) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Interactive Geo-Location & Coordinates</span>
              </label>
              <LocationPicker
                initialLat={locationData.latitude}
                initialLng={locationData.longitude}
                onLocationSelected={setLocationData}
              />
            </div>

            {/* Media Evidence (Live Camera Capture or File Upload) */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span>Media Evidence (Live Camera or Gallery, max 5 MB)</span>
                </label>
                {imagePreview && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Photo Attached
                  </span>
                )}
              </div>

              {!imagePreview ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Live Camera Button */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-brand-300 hover:border-brand-500 rounded-xl bg-brand-50/50 hover:bg-brand-50 text-brand-700 transition group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 group-hover:scale-110 flex items-center justify-center mb-1.5 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-brand-900">
                      📷 Take Live Photo
                    </span>
                    <span className="text-[10px] text-brand-600/80">
                      Use device camera (Front/Back)
                    </span>
                  </button>

                  {/* Option 2: Upload from Device / Gallery */}
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl bg-slate-50 hover:bg-slate-100/70 text-slate-600 transition group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-500 group-hover:scale-110 flex items-center justify-center mb-1.5 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      📁 Upload from Device
                    </span>
                    <span className="text-[10px] text-slate-400">
                      JPG, PNG, WEBP up to 5 MB
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                /* Attached Image Preview Card with Enlarge & Retake */
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      onClick={() => setEnlargedImageUrl(imagePreview)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-sm cursor-zoom-in group shrink-0"
                      title="Click to Enlarge Photo"
                    >
                      <img
                        src={imagePreview}
                        alt="Evidence preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {imageFile?.name || 'Live Captured Photo.jpg'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {imageFile?.size ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                        <button
                          type="button"
                          onClick={() => setEnlargedImageUrl(imagePreview)}
                          className="text-brand-600 hover:text-brand-700 font-semibold underline underline-offset-2"
                        >
                          Enlarge preview
                        </button>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-brand-600" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Registering Complaint...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Incident Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={!!duplicateWarning}
        duplicateData={duplicateWarning}
        onProceedAnyway={() => {
          setDuplicateDismissed(true);
          setDuplicateWarning(null);
          handleSubmit();
        }}
        onClose={() => setDuplicateWarning(null)}
      />

      {/* Live Device Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onCapture={(file, previewUrl) => {
          setImageFile(file);
          setImagePreview(previewUrl);
        }}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* Enlarged Image Lightbox */}
      <ImageModal
        isOpen={!!enlargedImageUrl}
        imageUrl={enlargedImageUrl}
        title="Incident Evidence Preview"
        subtitle={locationData.address || 'Geo-Tagged Photo'}
        onClose={() => setEnlargedImageUrl('')}
      />
    </div>
  );
}
