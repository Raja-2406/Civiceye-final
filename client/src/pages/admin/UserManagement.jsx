import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserCheck, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle2, 
  AlertCircle,
  X,
  Trash2,
  Search,
  Filter,
  UserX,
  ShieldAlert
} from 'lucide-react';

const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Streetlights & Electricity',
  'Waste Management & Sanitation',
  'Water Supply',
  'Public Safety & Other Civic Hazards',
];

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Create Staff Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('dept_head');
  const [department, setDepartment] = useState('Roads & Infrastructure');
  const [designation, setDesignation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete User State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/admin/users', {
        name,
        email,
        password,
        phone,
        role,
        department,
        designation: designation || (role === 'dept_head' ? `${department} Head` : `${department} Field Verifier`),
      });

      if (res.data.success) {
        setSuccessMessage(res.data.message);
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setDesignation('');
        setModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.delete(`/admin/users/${deleteTarget._id}`);
      if (res.data.success) {
        setSuccessMessage(res.data.message || `User "${deleteTarget.name}" removed successfully.`);
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to remove user account.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery)) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesDept = deptFilter === 'ALL' || u.department === deptFilter;

    return matchesSearch && matchesRole && matchesDept;
  });

  // Role Counts
  const counts = {
    total: users.length,
    citizen: users.filter((u) => u.role === 'citizen').length,
    dept_head: users.filter((u) => u.role === 'dept_head').length,
    verifier: users.filter((u) => u.role === 'verifier').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Header with CTA Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
            Security & Access Control (RBAC)
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Municipal User Directory & Access Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise registered citizens, department heads, and field verifiers. Create or revoke access permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setSuccessMessage('');
            setModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-brand-500/20 transition self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Create Staff Account</span>
        </button>
      </div>

      {/* Role Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Users</span>
          <span className="text-lg font-bold text-slate-900 block mt-0.5">{counts.total}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Citizens</span>
          <span className="text-lg font-bold text-slate-700 block mt-0.5">{counts.citizen}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Dept Heads</span>
          <span className="text-lg font-bold text-blue-600 block mt-0.5">{counts.dept_head}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Field Verifiers</span>
          <span className="text-lg font-bold text-amber-600 block mt-0.5">{counts.verifier}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Super Admins</span>
          <span className="text-lg font-bold text-purple-600 block mt-0.5">{counts.admin}</span>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="dept_head">Department Heads</option>
            <option value="verifier">Field Verifiers</option>
            <option value="admin">Super Administrators</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department Scope</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading directory...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentAccount = currentUser?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span>{u.name}</span>
                          {isCurrentAccount && (
                            <span className="text-[9px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">{u.email}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'dept_head'
                            ? 'bg-blue-100 text-blue-800'
                            : u.role === 'verifier'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {u.department || 'All Departments (System Wide)'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{u.designation || '—'}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{u.phone || '—'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isCurrentAccount ? (
                          <span className="text-[10px] text-slate-400 italic font-medium px-2 py-1 bg-slate-100 rounded-md">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setErrorMessage('');
                              setSuccessMessage('');
                              setDeleteTarget(u);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition shadow-2xs"
                            title={`Remove user ${u.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove User Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <UserX className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Remove User Account
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Confirm revocation of municipal access
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-bold text-slate-900">{deleteTarget.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="font-mono text-slate-700 text-[11px]">{deleteTarget.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Assigned Role:</span>
                  <span className="font-bold text-purple-700 uppercase text-[10px] bg-purple-50 px-2 py-0.5 rounded">
                    {deleteTarget.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="text-slate-700 font-semibold">{deleteTarget.department || 'System Wide'}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This action is permanent and will revoke this user's ability to log in. If this user is an active Field Verifier, any pending complaints assigned to them will automatically be re-queued to the department for autonomous re-dispatch.
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow transition flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Removing...' : 'Confirm Remove'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Create Municipal Staff Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign a Department Head or Field Verifier to a civic category.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-5 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Type *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    required
                  >
                    <option value="dept_head">Department Head (HOD)</option>
                    <option value="verifier">Field Verifier / Officer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department Category *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    required
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Er. P. Sundaram"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sundaram.water@civiceye.gov"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Executive Engineer"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9842100000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
