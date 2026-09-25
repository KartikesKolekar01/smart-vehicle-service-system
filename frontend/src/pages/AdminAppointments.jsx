import { useEffect, useState } from 'react';
import {
  UserCheck, RefreshCw, Search, Play, CheckCircle,
  XCircle, Eye, AlertCircle, Wrench, Send, IndianRupee,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['ALL', 'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [assignModal, setAssignModal] = useState(null);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', adminNotes: '', actualCost: '' });
  const [detailModal, setDetailModal] = useState(null);

  const [billModal, setBillModal] = useState(null);
  const [billForm, setBillForm] = useState({
    amount: '',
    tax: '',
    discount: '',
    notes: '',
  });
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    try {
      const [aptsRes, mechsRes, payRes] = await Promise.all([
        axiosClient.get('/api/appointments'),
        axiosClient.get('/api/mechanics/available').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/api/payments').catch(() => ({ data: { data: [] } })),
      ]);
      setAppointments(aptsRes.data.data || []);
      setMechanics(mechsRes.data.data || []);
      setPayments(payRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
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
          a.mechanicName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [appointments, statusFilter, search]);

  const getBill = (appointmentId) => {
    return payments.find((p) => p.appointmentId === appointmentId);
  };

  const handleAssign = async () => {
    if (!selectedMechanic) return toast.error('Select a mechanic');
    try {
      await axiosClient.patch(`/api/appointments/${assignModal.id}/assign`, {
        mechanicId: Number(selectedMechanic),
      });
      toast.success('Mechanic assigned');
      setAssignModal(null);
      setSelectedMechanic('');
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusOpen = (apt, newStatus) => {
    setStatusModal(apt);
    setStatusForm({
      status: newStatus,
      adminNotes: '',
      actualCost: apt.actualCost || '',
    });
  };

  const handleStatusUpdate = async () => {
    try {
      await axiosClient.patch(`/api/appointments/${statusModal.id}/status`, {
        status: statusForm.status,
        adminNotes: statusForm.adminNotes || null,
        actualCost: statusForm.actualCost ? Number(statusForm.actualCost) : null,
      });
      toast.success(`Status updated to ${statusForm.status}`);
      setStatusModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBillOpen = (apt) => {
    const baseAmount = apt.actualCost || 2500;
    setBillModal(apt);
    setBillForm({
      amount: baseAmount,
      tax: (baseAmount * 0.18).toFixed(2),
      discount: 0,
      notes: 'Bill for ' + (apt.serviceType || '').replace(/_/g, ' '),
    });
  };

  const handleSendBill = async () => {
    if (!billForm.amount || Number(billForm.amount) <= 0) {
      return toast.error('Amount must be positive');
    }
    setSending(true);
    try {
      await axiosClient.post('/api/payments/bill', {
        appointmentId: billModal.id,
        amount: Number(billForm.amount),
        tax: Number(billForm.tax) || 0,
        discount: Number(billForm.discount) || 0,
        paymentMethod: 'UPI',
        notes: billForm.notes,
      });
      toast.success('Bill sent to customer!');
      setBillModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
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

  const billTotal =
    (Number(billForm.amount) || 0) +
    (Number(billForm.tax) || 0) -
    (Number(billForm.discount) || 0);

  const stats = {
    total: appointments.length,
    requested: appointments.filter((a) => a.status === 'REQUESTED').length,
    inProgress: appointments.filter((a) => ['ASSIGNED', 'IN_PROGRESS'].includes(a.status)).length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            All Appointments
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage service bookings</p>
        </div>
        <Button variant="secondary" onClick={fetchAll}>
          <RefreshCw size={18} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.requested}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vehicle or mechanic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <p className="text-slate-500 dark:text-slate-400">No appointments found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const bill = getBill(apt.id);
            const isPaid = bill && bill.status === 'SUCCESS';

            return (
              <Card key={apt.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {apt.vehicleRegistrationNumber}
                      </h3>
                      <span className="text-xs text-slate-400">#{apt.id}</span>
                      <StatusBadge status={apt.status} />
                      {bill && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          }`}
                        >
                          {isPaid ? 'PAID' : `BILL PENDING ${bill.totalAmount}`}
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

                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="secondary" onClick={() => handleView(apt.id)}>
                      <Eye size={14} /> View
                    </Button>

                    {apt.status === 'REQUESTED' && (
                      <Button size="sm" variant="primary" onClick={() => setAssignModal(apt)}>
                        <UserCheck size={16} /> Assign
                      </Button>
                    )}

                    {apt.status === 'ASSIGNED' && (
                      <Button size="sm" variant="primary" onClick={() => handleStatusOpen(apt, 'IN_PROGRESS')}>
                        <Play size={14} /> Start
                      </Button>
                    )}

                    {apt.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="success" onClick={() => handleStatusOpen(apt, 'COMPLETED')}>
                        <CheckCircle size={14} /> Complete
                      </Button>
                    )}

                    {apt.status === 'COMPLETED' && !bill && (
                      <Button size="sm" variant="primary" onClick={() => handleBillOpen(apt)}>
                        <Send size={14} /> Send Bill
                      </Button>
                    )}

                    {isPaid && (
                      <Button size="sm" variant="secondary" disabled>
                        <CheckCircle size={14} /> Paid
                      </Button>
                    )}

                    {['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'].includes(apt.status) && (
                      <Button size="sm" variant="danger" onClick={() => handleStatusOpen(apt, 'CANCELLED')}>
                        <XCircle size={14} /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Mechanic">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Mechanic
            </label>
            <select
              value={selectedMechanic}
              onChange={(e) => setSelectedMechanic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none"
            >
              <option value="">Choose a mechanic</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.specialization}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setAssignModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAssign} className="flex-1">Assign</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Status">
        <div className="space-y-4">
          <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-lg">
            <p className="text-sm text-brand-700 dark:text-brand-300">New Status</p>
            <p className="font-semibold text-brand-900 dark:text-brand-100">
              {statusForm.status}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Admin Notes
            </label>
            <textarea
              value={statusForm.adminNotes}
              onChange={(e) => setStatusForm({ ...statusForm, adminNotes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none resize-none"
            />
          </div>
          {statusForm.status === 'COMPLETED' && (
            <Input
              label="Actual Cost (Rs) *"
              type="number"
              value={statusForm.actualCost}
              onChange={(e) => setStatusForm({ ...statusForm, actualCost: e.target.value })}
              icon={IndianRupee}
              placeholder="2000"
            />
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStatusModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} className="flex-1">Update</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!billModal}
        onClose={() => !sending && setBillModal(null)}
        title="Send Bill to Customer"
      >
        {billModal && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-brand-100 dark:border-brand-900/40">
              <p className="text-xs text-brand-700 dark:text-brand-300 font-semibold mb-1">
                APPOINTMENT #{billModal.id}
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {billModal.vehicleRegistrationNumber}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {billModal.serviceType?.replace(/_/g, ' ')}
              </p>
            </div>

            <Input
              label="Amount (Rs) *"
              type="number"
              value={billForm.amount}
              onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
              icon={IndianRupee}
              placeholder="2000"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tax (Rs)"
                type="number"
                value={billForm.tax}
                onChange={(e) => setBillForm({ ...billForm, tax: e.target.value })}
                placeholder="360"
              />
              <Input
                label="Discount (Rs)"
                type="number"
                value={billForm.discount}
                onChange={(e) => setBillForm({ ...billForm, discount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Total Bill</span>
                <span className="text-2xl font-bold">
                  Rs {billTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notes
              </label>
              <textarea
                value={billForm.notes}
                onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                rows="2"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setBillModal(null)}
                disabled={sending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSendBill} loading={sending} className="flex-1">
                <Send size={16} /> Send Bill
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Appointment Details">
        {detailModal && (
          <div className="space-y-4">
            <StatusBadge status={detailModal.status} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 mb-1">ID</p>
                <p className="font-semibold text-slate-900 dark:text-white">#{detailModal.id}</p>
              </div>
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
              {detailModal.actualCost && (
                <div className="col-span-2">
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Cost</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    Rs {detailModal.actualCost}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}