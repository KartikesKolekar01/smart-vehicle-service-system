import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Package, AlertTriangle, Search, Edit, Trash2,
  Filter, TrendingDown,
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Input from '../components/Input';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'ALL', 'ENGINE', 'BRAKE', 'ELECTRICAL', 'SUSPENSION',
  'TYRE', 'BATTERY', 'OIL', 'AC', 'GENERAL',
];

export default function SpareParts() {
  const [parts, setParts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    partName: '', partNumber: '', category: 'OIL',
    price: '', quantity: '', minimumStock: '',
    supplier: '', description: '',
  });

  // Stock modal
  const [stockModal, setStockModal] = useState(null);
  const [newStock, setNewStock] = useState('');

  const fetchAll = async () => {
    try {
      const [allRes, lowRes] = await Promise.all([
        axiosClient.get('/api/parts'),
        axiosClient.get('/api/parts/low-stock').catch(() => ({ data: { data: [] } })),
      ]);
      setParts(allRes.data.data || []);
      setLowStock(lowRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...parts];

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Low stock filter
    if (onlyLowStock) {
      result = result.filter((p) => p.lowStock);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.partName.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [parts, categoryFilter, onlyLowStock, search]);

  // Open edit modal
  const handleEdit = (part) => {
    setEditModal(part);
    setEditForm({
      partName: part.partName,
      partNumber: part.partNumber,
      category: part.category,
      price: part.price,
      quantity: part.quantity,
      minimumStock: part.minimumStock,
      supplier: part.supplier || '',
      description: part.description || '',
    });
  };

  const handleUpdatePart = async () => {
    try {
      await axiosClient.put(`/api/parts/${editModal.id}`, {
        ...editForm,
        price: Number(editForm.price),
        quantity: Number(editForm.quantity),
        minimumStock: Number(editForm.minimumStock),
      });
      toast.success('Part updated');
      setEditModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Open stock modal
  const handleStockOpen = (part) => {
    setStockModal(part);
    setNewStock(part.quantity);
  };

  const handleUpdateStock = async () => {
    try {
      await axiosClient.patch(`/api/parts/${stockModal.id}/stock`, {
        quantity: Number(newStock),
      });
      toast.success('Stock updated');
      setStockModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this part?')) return;
    try {
      await axiosClient.delete(`/api/parts/${id}`);
      toast.success('Part deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Spare Parts Inventory
          </h1>
          <p className="text-slate-500">Track your stock</p>
        </div>
        <Link to="/admin/parts/add">
          <Button>
            <Plus size={18} /> Add Part
          </Button>
        </Link>
      </div>

      {/* Low Stock Banner */}
      {lowStock.length > 0 && (
        <Card className="p-4 mb-6 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-500" size={22} />
            <div>
              <p className="font-semibold text-orange-900">
                {lowStock.length} part(s) low on stock
              </p>
              <p className="text-sm text-orange-700">
                Restock soon to avoid service delays
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name or part number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${
              onlyLowStock
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-slate-100 text-slate-600 border-2 border-transparent'
            }`}
          >
            <TrendingDown size={18} />
            Low Stock Only
          </button>
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 mt-3">
          Showing {filtered.length} of {parts.length} parts
        </p>
      </Card>

      {/* Parts Grid */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500">
            {parts.length === 0 ? 'No parts added yet' : 'No matching parts'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5 card-shadow-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                  <Package size={20} className="text-white" />
                </div>
                {p.lowStock && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                    LOW STOCK
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 mb-1">{p.partName}</h3>
              <p className="text-xs font-mono text-slate-500 mb-1">
                {p.partNumber}
              </p>
              <p className="text-xs text-brand-600 font-semibold mb-3">
                {p.category}
              </p>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">Price</span>
                <span className="font-semibold text-slate-900">₹{p.price}</span>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-500">Stock</span>
                <span
                  className={`font-semibold ${
                    p.lowStock ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {p.quantity}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition text-xs font-medium"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleStockOpen(p)}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition text-xs font-medium"
                >
                  <TrendingDown size={14} /> Stock
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex items-center justify-center gap-1 py-2 px-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium"
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
        title="Edit Part"
      >
        <div className="space-y-4">
          <Input
            label="Part Name"
            value={editForm.partName}
            onChange={(e) => setEditForm({ ...editForm, partName: e.target.value })}
          />
          <Input
            label="Part Number"
            value={editForm.partNumber}
            onChange={(e) => setEditForm({ ...editForm, partNumber: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
            >
              {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            />
            <Input
              label="Quantity"
              type="number"
              value={editForm.quantity}
              onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
            />
            <Input
              label="Min Stock"
              type="number"
              value={editForm.minimumStock}
              onChange={(e) => setEditForm({ ...editForm, minimumStock: e.target.value })}
            />
          </div>
          <Input
            label="Supplier"
            value={editForm.supplier}
            onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none resize-none"
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
            <Button onClick={handleUpdatePart} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Stock Update Modal */}
      <Modal
        isOpen={!!stockModal}
        onClose={() => setStockModal(null)}
        title="Update Stock"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="font-semibold text-slate-900">
              {stockModal?.partName}
            </p>
            <p className="text-sm text-slate-500">
              {stockModal?.partNumber}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Quantity
            </label>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
              min="0"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {stockModal?.quantity} • Minimum: {stockModal?.minimumStock}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStockModal(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStock} className="flex-1">
              Update Stock
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}