import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Car, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axiosClient.get('/api/notifications/unread/count');
        setUnreadCount(res.data.data || 0);
      } catch {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const roleColors = {
    ROLE_ADMIN: 'from-purple-500 to-pink-500',
    ROLE_CUSTOMER: 'from-blue-500 to-cyan-500',
    ROLE_MECHANIC: 'from-orange-500 to-red-500',
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="px-6 py-3.5 flex items-center justify-between max-w-[1600px] mx-auto">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
            <Car size={22} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            Smart<span className="text-brand-600">Vehicle</span>
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* 🔔 BELL — Must be a Link to navigate */}
          <Link
            to="/notifications"
            className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Notifications"
          >
            <Bell size={20} className="text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-3 pr-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                  {user?.email}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.role?.replace('ROLE_', '')}
                </p>
              </div>
              <div
                className={`w-10 h-10 bg-gradient-to-br ${
                  roleColors[user?.role] || 'from-gray-500 to-gray-600'
                } rounded-xl flex items-center justify-center shadow-lg`}
              >
                <User size={18} className="text-white" />
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role?.replace('ROLE_', '')}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}