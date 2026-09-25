import { useEffect, useState } from 'react';
import {
  CreditCard, RefreshCw, Search, Filter, Eye, RotateCcw,
  DollarSign, CheckCircle, Clock, XCircle, Receipt,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  'ALL', 'SUCCESS', 'REFUNDED', 'PENDING', 'PROCESSING', 'FAILED',
];

const METHOD_ICONS = {
  CASH: '💵',
  CARD: '💳',
  UPI: '📱',
  NET_BANKING: '🏦',
  WALLET: '👛',
};

export default function Payments() {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [detailModal, setDetailModal] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await axiosClient.get('/api/payments');
      setPayments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...payments];

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.paymentReference?.toLowerCase().includes(q) ||
          p.paymentMethod?.toLowerCase().includes(q) ||
          String(p.appointmentId)?.includes(q)
      );
    }

    setFiltered(result);
  }, [payments, statusFilter, search]);

  // View details
  const handleView = async (id) => {
    try {
      const res = await axiosClient.get(`/api/payments/${id}`);
      setDetailModal(res.data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Refund
  const handleRefundOpen = (payment) => {
    setRefundModal(payment);
    setRefundReason('');
  };

  const handleRefundConfirm = async () => {
    if (!refundReason.trim()) return toast.error('Reason is required');
    try {
      await axiosClient.post(`/api/payments/${refundModal.id}/refund`, {
        reason: refundReason,
      });
      toast.success('Refund processed');
      setRefundModal(null);
      setRefundReason('');
      fetchPayments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Stats
  const stats = {
    total: payments.length,
    success: payments.filter((p) => p.status === 'SUCCESS').length,
    refunded: payments.filter((p) => p.status === 'REFUNDED').length,
    revenue: payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0),
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {isAdmin ? 'All Payments' : 'My Payments'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track your payment history
          </p>
        </div>
        <Button variant="secondary" onClick={fetchPayments}>
          <RefreshCw size={18} /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={14} className="text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Successful</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.success}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw size={14} className="text-purple-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Refunded</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.refunded}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-brand-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin ? 'Revenue' : 'Total Spent'}
            </p>
          </div>
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
            ₹{stats.revenue.toLocaleString()}
          </p>
        </Card>
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
              placeholder="Search by reference, method, appointment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Showing {filtered.length} of {payments.length} payments
        </p>
      </Card>

      {/* Payments List */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard
            className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            size={48}
          />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {payments.length === 0 ? 'No payments yet' : 'No matching payments'}
          </h3>
          {payments.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400">
              Payments will appear here after appointments are completed
            </p>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5 card-shadow-hover">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side - Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
                    <CreditCard size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.paymentReference}
                      </p>
                      <span className="text-xs text-slate-400">#{p.id}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      Appointment #{p.appointmentId} •{' '}
                      {METHOD_ICONS[p.paymentMethod] || ''} {p.paymentMethod}
                    </p>
                    {p.createdAt && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side - Amount + Actions */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ₹{p.totalAmount}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(p.id)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {isAdmin && p.status === 'SUCCESS' && (
                      <button
                        onClick={() => handleRefundOpen(p)}
                        className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                        title="Refund"
                      >
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Payment Details"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Status
              </span>
              <StatusBadge status={detailModal.status} />
            </div>

            <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-5 rounded-2xl text-white">
              <p className="text-sm opacity-80 mb-1">Total Amount</p>
              <p className="text-3xl font-bold">₹{detailModal.totalAmount}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-slate-500 dark:text-slate-400 mb-1">
                  Payment Reference
                </p>
                <p className="font-mono font-semibold text-slate-900 dark:text-white text-xs break-all">
                  {detailModal.paymentReference}
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">
                  Appointment
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  #{detailModal.appointmentId}
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">
                  Method
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {METHOD_ICONS[detailModal.paymentMethod]}{' '}
                  {detailModal.paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">
                  Amount
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  ₹{detailModal.amount}
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Tax</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  ₹{detailModal.tax}
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">
                  Discount
                </p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -₹{detailModal.discount}
                </p>
              </div>

              {detailModal.transactionId && (
                <div className="col-span-2">
                  <p className="text-slate-500 dark:text-slate-400 mb-1">
                    Transaction ID
                  </p>
                  <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                    {detailModal.transactionId}
                  </p>
                </div>
              )}

              {detailModal.paidAt && (
                <div className="col-span-2">
                  <p className="text-slate-500 dark:text-slate-400 mb-1">
                    Paid At
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(detailModal.paidAt).toLocaleString()}
                  </p>
                </div>
              )}

              {detailModal.refundedAt && (
                <div className="col-span-2">
                  <p className="text-slate-500 dark:text-slate-400 mb-1">
                    Refunded At
                  </p>
                  <p className="font-semibold text-purple-600 dark:text-purple-400">
                    {new Date(detailModal.refundedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {detailModal.notes && (
                <div className="col-span-2">
                  <p className="text-slate-500 dark:text-slate-400 mb-1">
                    Notes
                  </p>
                  <p className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-slate-700 dark:text-slate-300 text-xs">
                    {detailModal.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={!!refundModal}
        onClose={() => setRefundModal(null)}
        title="Refund Payment"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-900/40">
            <p className="font-semibold text-red-900 dark:text-red-300 mb-1">
              ⚠️ Confirm Refund
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              You are about to refund{' '}
              <span className="font-bold">₹{refundModal?.totalAmount}</span> for{' '}
              <span className="font-mono text-xs">
                {refundModal?.paymentReference}
              </span>
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Appointment
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              #{refundModal?.appointmentId}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Refund Reason *
            </label>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows="3"
              placeholder="Why is this being refunded?"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setRefundModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRefundConfirm}
              className="flex-1"
            >
              <RotateCcw size={16} /> Confirm Refund
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}