import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  Building2, 
  CheckSquare, 
  UserCheck, 
  User, 
  AlertCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';

const PORTAL_ROLES = [
  {
    key: 'citizen',
    label: 'Citizen',
    icon: User,
    title: 'Citizen Grievance Portal',
    desc: 'Report civic faults, geotag incidents & track resolution vault.',
    emailPlaceholder: 'citizen@example.com',
    color: 'brand',
  },
  {
    key: 'dept_head',
    label: 'Department Head',
    icon: Building2,
    title: 'Department Head Command Center',
    desc: 'Access departmental work queue, monitor SLAs & assign verifiers.',
    emailPlaceholder: 'roads.head@civiceye.gov',
    color: 'sky',
  },
  {
    key: 'verifier',
    label: 'Field Verifier',
    icon: CheckSquare,
    title: 'Field Officer Inspection Portal',
    desc: 'Inspect assigned municipal tasks & submit on-site verification proofs.',
    emailPlaceholder: 'verifier.roads@civiceye.gov',
    color: 'amber',
  },
  {
    key: 'admin',
    label: 'Super Admin',
    icon: Shield,
    title: 'Super Administrator Console',
    desc: 'City-wide oversight, cross-department analytics & staff management.',
    emailPlaceholder: 'admin@civiceye.gov',
    color: 'purple',
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activePortal, setActivePortal] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentRoleConfig = PORTAL_ROLES.find((r) => r.key === activePortal) || PORTAL_ROLES[0];
  const CurrentIcon = currentRoleConfig.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route to role-specific workspace
      if (user.role === 'dept_head') navigate('/dept/queue');
      else if (user.role === 'verifier') navigate('/verifier');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/30">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">CivicEye Municipal Portal</h2>
        <p className="text-xs text-slate-400">
          Crowdsourced Civic Issue Reporting and Resolution System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white text-slate-800 shadow-2xl rounded-2xl border border-slate-100 overflow-hidden">
          
          {/* Role / Portal Switcher Tabs */}
          <div className="bg-slate-100/80 p-2 border-b border-slate-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 flex items-center justify-between">
              <span>Select Access Portal:</span>
              <span className="text-brand-600 font-semibold">{currentRoleConfig.label} Access</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
              {PORTAL_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = activePortal === role.key;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => {
                      setActivePortal(role.key);
                      setError('');
                    }}
                    className={`flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portal Description Banner */}
          <div className="p-6 pb-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{currentRoleConfig.title}</h3>
                <p className="text-[11px] text-slate-500">{currentRoleConfig.desc}</p>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {activePortal === 'citizen' ? 'Citizen Email Address' : 'Official Municipal Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentRoleConfig.emailPlaceholder}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Account Password</label>
                  {activePortal === 'citizen' && (
                    <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center space-x-2 pt-2.5"
              >
                <span>
                  {loading
                    ? 'Verifying Credentials...'
                    : `Log In as ${currentRoleConfig.label}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Links: Register for Citizens, Quick Portal Switches for Staff */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
              {activePortal === 'citizen' ? (
                <div>
                  <span className="text-slate-500">New citizen user? </span>
                  <Link to="/register" className="font-semibold text-brand-600 hover:underline">
                    Create Citizen Identity
                  </Link>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span>Authorized municipal personnel only</span>
                </div>
              )}

              {/* Quick portal shortcut links */}
              <div className="flex items-center space-x-2 text-[11px]">
                {activePortal !== 'citizen' && (
                  <button
                    type="button"
                    onClick={() => setActivePortal('citizen')}
                    className="text-brand-600 hover:underline font-medium"
                  >
                    Citizen Login
                  </button>
                )}
                {activePortal !== 'dept_head' && (
                  <button
                    type="button"
                    onClick={() => setActivePortal('dept_head')}
                    className="text-slate-600 hover:text-brand-600 font-medium"
                  >
                    Dept Head Login
                  </button>
                )}
                {activePortal !== 'verifier' && (
                  <button
                    type="button"
                    onClick={() => setActivePortal('verifier')}
                    className="text-slate-600 hover:text-brand-600 font-medium"
                  >
                    Verifier Login
                  </button>
                )}
                {activePortal !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => setActivePortal('admin')}
                    className="text-slate-600 hover:text-brand-600 font-medium"
                  >
                    Super Admin
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
