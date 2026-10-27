import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  Search, 
  Calendar, 
  LogOut, 
  Shield, 
  UserCheck, 
  Clock, 
  AlertCircle,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ onToggleMobileMenu }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/track?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Mobile Hamburger Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition md:hidden"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">CivicEye</span>
              <span className="hidden xs:inline-block text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-sky-50 text-brand-600 border border-brand-200">
                Municipal Core
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
              Bannari Amman Smart City Governance
            </p>
          </div>
        </div>
      </div>

      {/* Universal Search (Tracking #CMP or keywords) */}
      <form onSubmit={handleSearch} className="flex-1 max-w-[140px] xs:max-w-xs sm:max-w-md mx-2 sm:mx-6 relative">
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search #CMP ID..."
          className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
        />
      </form>

      {/* Right Controls: Notifications, User Profile & Session */}
      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {/* Current Date Display */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">System Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-brand-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                        !n.isRead ? 'bg-sky-50/50' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card & Terminate Session */}
        <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 space-x-2 sm:space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 max-w-[120px] truncate">{user?.name || 'Citizen'}</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {user?.role === 'dept_head'
                ? 'Department Head'
                : user?.role === 'verifier'
                ? 'Field Verifier'
                : user?.role === 'admin'
                ? 'Super Admin'
                : 'Citizen'}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Terminate Session (Sign Out)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
