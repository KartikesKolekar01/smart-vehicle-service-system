import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Wrench,
  Package,
  CreditCard,
  Bell,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const customerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/vehicles', icon: Car, label: 'My Vehicles' },
    { to: '/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/admin/mechanics', icon: Wrench, label: 'Mechanics' },
    { to: '/admin/parts', icon: Package, label: 'Spare Parts' },
    { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-64px)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 z-40 transform transition-transform lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="font-semibold text-slate-900 dark:text-white">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <link.icon size={20} />
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 rounded-2xl border border-brand-100 dark:border-brand-900/40">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp
              className="text-brand-600 dark:text-brand-400"
              size={16}
            />
            <p className="text-xs font-bold text-brand-700 dark:text-brand-300">
              {isAdmin ? 'ADMIN PORTAL' : 'CUSTOMER PORTAL'}
            </p>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAdmin
              ? 'Manage all services, mechanics and inventory.'
              : 'Book services and track your vehicles.'}
          </p>
        </div>
      </aside>
    </>
  );
}