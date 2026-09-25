import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Car, Gauge, Fuel, Search, Edit, Trash2,
  TrendingUp, Calendar, AlertTriangle, X,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Input from '../components/Input';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showServiceDue, setShowServiceDue] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  // KM modal
  const [kmModal, setKmModal] = useState(null);
  const [newKm, setNewKm] = useState('');

  const fetchVehicles = async () => {
    try {
      const res = await axiosClient.get('/api/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    let result = [...vehicles];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.brand?.toLowerCase().includes(q) ||
          v.model?.toLowerCase().includes(q) ||
          v.registrationNumber?.toLowerCase().includes(q)
      );
    }
    if (showServiceDue) {
      result = result.filter((v) => v.serviceDue);
    }
    setFiltered(result);
  }, [vehicles, search, showServiceDue]);

  const handleEdit = (v) => {
    setEditModal(v);
    setEditForm({
      registrationNumber: v.registrationNumber,
      brand: v.brand,
      model: v.model,
      vehicleType: v.vehicleType,
      manufacturingYear: v.manufacturingYear,
      fuelType: v.fuelType,
      currentKm: v.currentKm,
      nextServiceKm: v.nextServiceKm || '',
    });
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`/api/vehicles/${editModal.id}`, {
        ...editForm,
        manufacturingYear: Number(editForm.manufacturingYear),
        currentKm: Number(editForm.currentKm),
        nextServiceKm: editForm.nextServiceKm ? Number(editForm.nextServiceKm) : null,
      });
      toast.success('Vehicle updated');
      setEditModal(null);
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleKmOpen = (v) => {
    setKmModal(v);
    setNewKm(v.currentKm);
  };

  const handleUpdateKm = async () => {
    if (Number(newKm) < kmModal.currentKm) {
      return toast.error(`KM cannot be less than ${kmModal.currentKm}`);
    }
    try {
      await axiosClient.patch(`/api/vehicles/${kmModal.id}/km`, {
        currentKm: Number(newKm),
      });
      toast.success('KM updated');
      setKmModal(null);
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle permanently?')) return;
    try {
      await axiosClient.delete(`/api/vehicles/${id}`);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const dueCount = vehicles.filter((v) => v.serviceDue).length;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">My Vehicles</h1>
          <p className="text-slate-500">Manage your registered vehicles</p>
        </div>
        <Link to="/vehicles/add">
          <Button>
            <Plus size={18} /> Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Service Due Banner */}
      {dueCount > 0 && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={22} />
            <div>
              <p className="font-semibold text-red-900">
                {dueCount} vehicle(s) need service
              </p>
              <p className="text-sm text-red-700">
                Book a service appointment soon
              </p>
            </div>
          </div>
        </Card>
      )}

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
              placeholder="Search by brand, model, or registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowServiceDue(!showServiceDue)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
              showServiceDue
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-slate-100 text-slate-600 border-2 border-transparent'
            }`}
          >
            <AlertTriangle size={18} />
            Service Due Only
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Showing {filtered.length} of {vehicles.length} vehicles
        </p>
      </Card>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Car className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {vehicles.length === 0 ? 'No vehicles yet' : 'No matching vehicles'}
          </h3>
          {vehicles.length === 0 && (
            <>
              <p className="text-slate-500 mb-6">Add your first vehicle to get started</p>
              <Link to="/vehicles/add">
                <Button><Plus size={18} /> Add Vehicle</Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => (
            <Card key={v.id} className="p-5 card-shadow-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                  <Car size={22} className="text-white" />
                </div>
                {v.serviceDue && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    Service Due
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">
                {v.brand} {v.model}
              </h3>
              <p className="text-sm text-slate-500 mb-3 font-mono">
                {v.registrationNumber}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Gauge size={16} className="text-slate-400" />
                  <span>{v.currentKm?.toLocaleString()} KM</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Fuel size={16} className="text-slate-400" />
                  <span>{v.fuelType} • {v.vehicleType}</span>
                </div>
                {v.nextServiceKm && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <span>Next: {v.nextServiceKm.toLocaleString()} KM</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link to={`/appointments/book?vehicleId=${v.id}`}>
                  <Button variant="primary" size="sm" className="w-full">
                    Book Service
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleKmOpen(v)}
                >
                  Update KM
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEdit(v)}
                  className="flex items-center justify-center gap-1 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition text-xs font-medium"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
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
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Vehicle">
        <div className="space-y-4">
          <Input
            label="Registration Number"
            value={editForm.registrationNumber || ''}
            onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value.toUpperCase() })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Brand"
              value={editForm.brand || ''}
              onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
            />
            <Input
              label="Model"
              value={editForm.model || ''}
              onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
              <select
                value={editForm.vehicleType || 'CAR'}
                onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
                <option value="SUV">SUV</option>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
                <option value="BUS">Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fuel</label>
              <select
                value={editForm.fuelType || 'PETROL'}
                onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <Input
            label="Manufacturing Year"
            type="number"
            value={editForm.manufacturingYear || ''}
            onChange={(e) => setEditForm({ ...editForm, manufacturingYear: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Current KM"
              type="number"
              value={editForm.currentKm || ''}
              onChange={(e) => setEditForm({ ...editForm, currentKm: e.target.value })}
            />
            <Input
              label="Next Service KM"
              type="number"
              value={editForm.nextServiceKm || ''}
              onChange={(e) => setEditForm({ ...editForm, nextServiceKm: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setEditModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* KM Update Modal */}
      <Modal isOpen={!!kmModal} onClose={() => setKmModal(null)} title="Update Odometer">
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="font-semibold text-slate-900">
              {kmModal?.brand} {kmModal?.model}
            </p>
            <p className="text-sm text-slate-500">
              {kmModal?.registrationNumber} • Current: {kmModal?.currentKm?.toLocaleString()} KM
            </p>
          </div>
          <Input
            label="New Current KM"
            type="number"
            value={newKm}
            onChange={(e) => setNewKm(e.target.value)}
            icon={Gauge}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setKmModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdateKm} className="flex-1">
              Update KM
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}