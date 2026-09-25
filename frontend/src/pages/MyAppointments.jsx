import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Calendar, Wrench, Search, CreditCard, Eye,
  IndianRupee, CheckCircle,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'CARD', label: 'Card', icon: '💳' },
  { value: 'NET_BANKING', label: 'Net Banking', icon: '🏦' },
  { value: 'WALLET', label: 'Wallet', icon: '👛' },
  { value: 'CASH', label: 'Cash', icon: '💵' },
];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');
  const [txnId, setTxnId] = useState('');
  const [paying, setPaying] = useState(false);

  const fetchData = async () => {
    try {
      const [aptRes, payRes] = await Promise.all([
        axiosClient.get('/api/appointments'),
        axiosClient.get('/api/payments').catch(() => ({ data: { data: [] } })),
      ]);
      setAppointments(aptRes.data.data || []);
      setPayments(payRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...appointments];
    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.vehicleRegistrationNumber?.toLowerCase().includes(q) ||
          a.serviceType?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [appointments, statusFilter, search]);

  const getBill = (appointmentId) => {
    return payments.find((p) => p.appointmentId === appointmentId);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await axiosClient.patch(`/api/appointments/${id}/cancel`);
      toast.success('Cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await axiosClient.get(`/api/appointments/${id}`);
      setDetailModal(res.data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePayOpen = (bill) => {
    setPayModal(bill);
    setPayMethod('UPI');
    setTxnId('');
  };

  const handlePayConfirm = async () => {
    setPaying(true);
    try {
      await axiosClient.post(`/api/payments/${payModal.id}/pay`, {
        appointmentId: payModal.appointmentId,
        amount: payModal.totalAmount,
        paymentMethod: payMethod,
        paymentReference: payModal.paymentReference,
        transactionId: txnId || null,
        paymentGateway: 'MOCK',
        notes: `Paid via ${payMethod}`,
      });
      toast.success('Payment successful! 🎉');
      setPayModal(null);
      setTxnId('');
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            My Appointments
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track your service bookings & bills
          </p>
        </div>
        <Link to="/appointments/book">
          <Button>
            <Plus size={18} /> Book Service
          </Button>
        </Link>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vehicle or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  statusFilter === f.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {appointments.length === 0 ? 'No appointments yet' : 'No matching appointments'}
          </h3>
          {appointments.length === 0 && (
            <Link to="/appointments/book">
              <Button className="mt-4">
                <Plus size={18} /> Book Service
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const bill = getBill(apt.id);
            const isPaid = bill && bill.status === 'SUCCESS';
            const isPending = bill && bill.status === 'PENDING';
            const canCancel = !['COMPLETED', 'CANCELLED'].includes(apt.status);

            return (
              <Card key={apt.id} className="p-5 card-shadow-hover">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center shrink-0">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {apt.vehicleRegistrationNumber}
                        </h3>
                        <span className="text-xs text-slate-400">#{apt.id}</span>
                        <StatusBadge status={apt.status} />
                        {isPaid && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                            ✅ PAID
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold animate-pulse">
                            💰 BILL PENDING ₹{bill.totalAmount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        {apt.serviceType?.replace(/_/g, ' ')} • {apt.appointmentDate} • {apt.timeSlot}
                      </p>
                      {apt.mechanicName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Wrench size={12} /> {apt.mechanicName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="secondary" onClick={() => handleView(apt.id)}>
                      <Eye size={14} /> View
                    </Button>

                    {isPending && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handlePayOpen(bill)}
                        className="animate-pulse"
                      >
                        <CreditCard size={14} /> Pay Now
                      </Button>
                    )}

                    {canCancel && (
                      <Button size="sm" variant="danger" onClick={() => handleCancel(apt.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Appointment Details">
        {detailModal && (
          <div className="space-y-4">
            <StatusBadge status={detailModal.status} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Vehicle</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {detailModal.vehicleRegistrationNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Service</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {detailModal.serviceType?.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {detailModal.appointmentDate}
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">Time</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {detailModal.timeSlot}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Pay Bill Modal */}
      <Modal
        isOpen={!!payModal}
        onClose={() => !paying && setPayModal(null)}
        title="Pay Bill"
      >
        {payModal && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-brand-100 dark:border-brand-900/40">
              <p className="text-xs text-brand-700 dark:text-brand-300 font-semibold mb-1">
                BILL REFERENCE
              </p>
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mb-2 break-all">
                {payModal.paymentReference}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Appointment #{payModal.appointmentId}
                </span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Amount</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{payModal.amount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Tax</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  + ₹{payModal.tax}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Discount</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  − ₹{payModal.discount}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  ₹{payModal.totalAmount}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPayMethod(m.value)}
                    className={`p-3 rounded-xl border-2 transition ${
                      payMethod === m.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    <p className={`text-xs font-medium ${
                      payMethod === m.value
                        ? 'text-brand-700 dark:text-brand-300'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {m.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction ID (optional)
              </label>
              <input
                type="text"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                placeholder="Leave empty for mock payment"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setPayModal(null)}
                disabled={paying}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handlePayConfirm} loading={paying} className="flex-1">
                <CheckCircle size={16} /> Pay ₹{payModal.totalAmount}
              </Button>
            </div>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              🔒 Mock payment — no real money will be charged
            </p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}