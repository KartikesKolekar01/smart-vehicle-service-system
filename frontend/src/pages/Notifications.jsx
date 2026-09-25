import { useEffect, useState } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, Search, Filter,
  Calendar, CreditCard, Wrench, AlertTriangle, Info,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  APPOINTMENT_BOOKED: Calendar,
  MECHANIC_ASSIGNED: Wrench,
  SERVICE_STARTED: Wrench,
  SERVICE_COMPLETED: Check,
  PAYMENT_RECEIVED: CreditCard,
  PAYMENT_PENDING: AlertTriangle,
  REFUND_ISSUED: CreditCard,
  LOW_STOCK_ALERT: AlertTriangle,
  GENERAL: Info,
};

const TYPE_COLORS = {
  APPOINTMENT_BOOKED: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  MECHANIC_ASSIGNED: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  SERVICE_STARTED: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  SERVICE_COMPLETED: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  PAYMENT_RECEIVED: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  PAYMENT_PENDING: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  REFUND_ISSUED: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  LOW_STOCK_ALERT: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  GENERAL: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await axiosClient.get('/api/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let result = [...notifications];

    if (filter === 'UNREAD') {
      result = result.filter((n) => !n.isRead);
    } else if (filter === 'READ') {
      result = result.filter((n) => n.isRead);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [notifications, filter, search]);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await axiosClient.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            <CheckCheck size={18} /> Mark All Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'UNREAD', 'READ'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            size={48}
          />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {notifications.length === 0
              ? 'No notifications yet'
              : 'No matching notifications'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {notifications.length === 0
              ? "You'll see updates here when things happen"
              : 'Try a different filter'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = TYPE_ICONS[n.type] || Info;
            const colorClass = TYPE_COLORS[n.type] || TYPE_COLORS.GENERAL;

            return (
              <Card
                key={n.id}
                className={`p-5 transition ${
                  !n.isRead
                    ? 'border-l-4 border-l-brand-500'
                    : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="px-2 py-0.5 bg-brand-500 text-white rounded-full text-xs font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg text-brand-600 transition"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}