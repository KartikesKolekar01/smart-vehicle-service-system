import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Wrench, Phone, Mail, Search, Edit, Trash2,
  UserCheck, Clock, Award, Filter, Eye, Users,
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

const SPECIALIZATIONS = [
  'ENGINE', 'ELECTRICAL', 'AC', 'BRAKES', 'TRANSMISSION', 'TYRES', 'GENERAL',
];

const AVAILABILITY_STATUSES = ['AVAILABLE', 'BUSY', 'ON_LEAVE'];

export default function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [specFilter, setSpecFilter] = useState('ALL');

  // Modals
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [newAvailability, setNewAvailability] = useState('');

  const [detailModal, setDetailModal] = useState(null);

  const fetchMechanics = async () => {
    try {
      const res = await axiosClient.get('/api/mechanics');
      setMechanics(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load mechanics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...mechanics];

    if (availabilityFilter !== 'ALL') {
      result = result.filter((m) => m.availability === availabilityFilter);
    }
    if (specFilter !== 'ALL') {
      result = result.filter((m) => m.specialization === specFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.phone?.includes(q) ||
          m.specialization?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [mechanics, availabilityFilter, specFilter, search]);

  // Edit
  const handleEdit = (m) => {
    setEditModal(m);
    setEditForm({
      name: m.name,
      email: m.email,
      phone: m.phone,
      specialization: m.specialization,
      experienceYears: m.experienceYears,
    });
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`/api/mechanics/${editModal.id}`, {
        ...editForm,
        experienceYears: Number(editForm.experienceYears),
      });
      toast.success('Mechanic updated');
      setEditModal(null);
      fetchMechanics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Availability
  const handleAvailabilityOpen = (m) => {
    setAvailabilityModal(m);
    setNewAvailability(m.availability);
  };

  const handleUpdateAvailability = async () => {
    try {
      await axiosClient.patch(
        `/api/mechanics/${availabilityModal.id}/availability`,
        { availability: newAvailability }
      );
      toast.success('Availability updated');
      setAvailabilityModal(null);
      fetchMechanics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mechanic?')) return;
    try {
      await axiosClient.delete(`/api/mechanics/${id}`);
      toast.success('Mechanic deleted');
      fetchMechanics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // View details
  const handleView = async (id) => {
    try {
      const res = await axiosClient.get(`/api/mechanics/${id}`);
      setDetailModal(res.data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Stats
  const stats = {
    total: mechanics.length,
    available: mechanics.filter((m) => m.availability === 'AVAILABLE').length,
    busy: mechanics.filter((m) => m.availability === 'BUSY').length,
    onLeave: mechanics.filter((m) => m.availability === 'ON_LEAVE').length,
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Mechanics</h1>
          <p className="text-slate-500">Manage your service team</p>
        </div>
        <Link to="/admin/mechanics/add">
          <Button>
            <Plus size={18} /> Add Mechanic
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-slate-400" />
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={14} className="text-emerald-500" />
            <p className="text-xs text-slate-500">Available</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-red-500" />
            <p className="text-xs text-slate-500">Busy</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.busy}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-orange-500" />
            <p className="text-xs text-slate-500">On Leave</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.onLeave}</p>
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
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
            >
              <option value="ALL">All Availability</option>
              {AVAILABILITY_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
          >
            <option value="ALL">All Specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Showing {filtered.length} of {mechanics.length} mechanics
        </p>
      </Card>

      {/* List */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Wrench className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {mechanics.length === 0 ? 'No mechanics yet' : 'No matching mechanics'}
          </h3>
          {mechanics.length === 0 && (
            <>
              <p className="text-slate-500 mb-6">Add your first mechanic to get started</p>
              <Link to="/admin/mechanics/add">
                <Button><Plus size={18} /> Add Mechanic</Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <Card key={m.id} className="p-5 card-shadow-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                  <Wrench size={20} className="text-white" />
                </div>
                <StatusBadge status={m.availability} />
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-1">{m.name}</h3>
              <div className="flex items-center gap-1 mb-3">
                <Award size={14} className="text-brand-500" />
                <p className="text-sm text-brand-600 font-semibold">
                  {m.specialization} • {m.experienceYears} yrs
                </p>
              </div>

              <div className="space-y-1.5 mb-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail size={14} /> <span className="truncate">{m.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} /> {m.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => handleView(m.id)}
                  className="flex items-center justify-center gap-1 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition text-xs font-medium"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => handleAvailabilityOpen(m)}
                  className="flex items-center justify-center gap-1 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition text-xs font-medium"
                >
                  <UserCheck size={14} /> Status
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEdit(m)}
                  className="flex items-center justify-center gap-1 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition text-xs font-medium"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Mechanic"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email || ''}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={editForm.phone || ''}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Specialization
              </label>
              <select
                value={editForm.specialization || 'GENERAL'}
                onChange={(e) =>
                  setEditForm({ ...editForm, specialization: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
              >
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              label="Experience (Years)"
              type="number"
              value={editForm.experienceYears || ''}
              onChange={(e) =>
                setEditForm({ ...editForm, experienceYears: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setEditModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Availability Modal */}
      <Modal
        isOpen={!!availabilityModal}
        onClose={() => setAvailabilityModal(null)}
        title="Update Availability"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="font-semibold text-slate-900">{availabilityModal?.name}</p>
            <p className="text-sm text-slate-500">
              {availabilityModal?.specialization}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Availability
            </label>
            <div className="space-y-2">
              {AVAILABILITY_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setNewAvailability(status)}
                  className={`w-full p-3 rounded-xl border-2 text-left font-medium transition ${
                    newAvailability === status
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{status.replace(/_/g, ' ')}</span>
                    {newAvailability === status && (
                      <UserCheck size={18} className="text-brand-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setAvailabilityModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAvailability} className="flex-1">
              Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Mechanic Details"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Availability</span>
              <StatusBadge status={detailModal.availability} />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center">
                <Wrench size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">{detailModal.name}</p>
                <p className="text-sm text-brand-600 font-semibold">
                  {detailModal.specialization} Specialist
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-semibold truncate">{detailModal.email}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Phone</p>
                <p className="font-semibold">{detailModal.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Experience</p>
                <p className="font-semibold">{detailModal.experienceYears} years</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Specialization</p>
                <p className="font-semibold">{detailModal.specialization}</p>
              </div>
              {detailModal.createdAt && (
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Added On</p>
                  <p className="font-semibold">
                    {new Date(detailModal.createdAt).toLocaleString()}
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