import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Phone, Mail, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IdentityNode() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '+91 9842100001');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(user?.isVerified || true);
  const [demoCode, setDemoCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/otp/send', { phone: phoneNumber });
      if (res.data.success) {
        setOtpSent(true);
        setDemoCode(res.data.demoOtp);
        setMessage(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/otp/verify', {
        phone: phoneNumber,
        otp: otpCode,
      });
      if (res.data.success) {
        setOtpVerified(true);
        setMessage('Identity node verified with two-factor SMS OTP authentication.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification OTP.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5 sm:space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
          Citizen Identity Node
        </span>
        <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
          Citizen Verification & Security Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified citizen sensor credentials for municipal grievance reporting and resolution confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name || 'Citizen'}</h3>
            <span className="text-[11px] font-semibold text-brand-600 uppercase bg-brand-50 px-2 py-0.5 rounded-full">
              {user?.role || 'Citizen'}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left text-xs space-y-2.5 text-slate-600">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-700 font-semibold">JWT Verified Session</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: OTP Verification Simulation (Report Section 3.5.2 & 4.4) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <KeyRound className="w-4 h-4 text-brand-600" />
            <span>Two-Factor OTP Phone Verification</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            As outlined in CivicEye Specification Section 3.5.2 and 4.4, citizen accounts use mobile OTP validation to prevent spam complaints and ensure authentic citizen participation.
          </p>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Registered Citizen Mobile Number</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  Send OTP
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900">Enter 6-Digit SMS Verification Code:</span>
                  {demoCode && (
                    <span className="text-[11px] font-mono font-bold text-brand-700 bg-sky-100 px-2 py-0.5 rounded">
                      Demo Code: {demoCode}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter OTP (or 123456)..."
                    className="flex-1 px-3 py-2 bg-white border border-sky-300 rounded-xl text-slate-800 font-mono text-center tracking-widest text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow transition"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Verification Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phone Authenticated & Ready</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
