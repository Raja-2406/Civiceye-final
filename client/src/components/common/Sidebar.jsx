import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  User, 
  HelpCircle, 
  Inbox, 
  BarChart3, 
  CheckSquare, 
  Users, 
  Cpu, 
  ShieldAlert,
  LogOut,
  FolderGit2
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || 'citizen';

  // Navigation items by role
  const citizenNav = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Report Issue', to: '/report', icon: PlusCircle },
    { name: 'Track Status', to: '/track', icon: Search },
    { name: 'Identity Node', to: '/profile', icon: User },
    { name: 'Help Center', to: '/help', icon: HelpCircle },
  ];

  const deptHeadNav = [
    { name: 'Dept Dashboard', to: '/dept/dashboard', icon: LayoutDashboard },
    { name: 'Department Queue', to: '/dept/queue', icon: Inbox },
    { name: 'Civic Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'Help Center', to: '/help', icon: HelpCircle },
  ];

  const verifierNav = [
    { name: 'Assigned Queue', to: '/verifier', icon: CheckSquare },
    { name: 'Help Center', to: '/help', icon: HelpCircle },
  ];

  const adminNav = [
    { name: 'City Overview', to: '/admin', icon: LayoutDashboard },
    { name: 'All Complaints', to: '/admin/complaints', icon: Inbox },
    { name: 'Civic Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'AI Model Review', to: '/admin/ai-review', icon: Cpu },
    { name: 'User Management', to: '/admin/users', icon: Users },
    { name: 'Help Center', to: '/help', icon: HelpCircle },
  ];

  const currentNav = 
    role === 'dept_head' 
      ? deptHeadNav 
      : role === 'verifier' 
      ? verifierNav 
      : role === 'admin' 
      ? adminNav 
      : citizenNav;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-800 shrink-0">
      <div className="py-5 px-3">
        <div className="px-3 mb-4">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
            {role === 'dept_head'
              ? `${user?.department || 'Department'} Head`
              : role === 'verifier'
              ? 'Field Verifier Portal'
              : role === 'admin'
              ? 'Super Administration'
              : 'Citizen Portal'}
          </span>
        </div>

        <nav className="space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-850 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-700">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Citizen'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@civiceye.gov'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Terminate Session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
