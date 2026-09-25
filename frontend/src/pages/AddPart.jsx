import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const CATEGORIES = ['ENGINE', 'BRAKE', 'ELECTRICAL', 'SUSPENSION', 'TYRE', 'BATTERY', 'OIL', 'AC', 'GENERAL'];

export default function AddPart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    partName: '',
    partNumber: '',
    category: 'OIL',
    price: '',
    quantity: '',
    minimumStock: '',
    supplier: '',
    description: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/api/parts', {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        minimumStock: Number(form.minimumStock),
      });
      toast.success('Part added');
      navigate('/admin/parts');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Add Spare Part</h1>
          <p className="text-slate-500">Add to your inventory</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Part Name" name="partName" placeholder="Engine Oil 5W30" value={form.partName} onChange={handleChange} required />
            <Input label="Part Number" name="partNumber" placeholder="EO-5W30" value={form.partNumber} onChange={handleChange} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Price (₹)" type="number" name="price" placeholder="850" value={form.price} onChange={handleChange} required />
              <Input label="Quantity" type="number" name="quantity" placeholder="25" value={form.quantity} onChange={handleChange} required />
              <Input label="Min Stock" type="number" name="minimumStock" placeholder="5" value={form.minimumStock} onChange={handleChange} required />
            </div>
            <Input label="Supplier" name="supplier" placeholder="Castrol India" value={form.supplier} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/parts')} className="flex-1">Cancel</Button>
              <Button type="submit" loading={loading} className="flex-1">
                <Package size={18} /> Add Part
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}