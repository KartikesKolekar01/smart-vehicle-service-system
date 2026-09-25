import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = ['ENGINE', 'ELECTRICAL', 'AC', 'BRAKES', 'TRANSMISSION', 'TYRES', 'GENERAL'];

export default function AddMechanic() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'GENERAL',
    experienceYears: 1,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/api/mechanics', {
        ...form,
        experienceYears: Number(form.experienceYears),
      });
      toast.success('Mechanic added');
      navigate('/admin/mechanics');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Add Mechanic</h1>
          <p className="text-slate-500">Add a new member to your team</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" name="name" placeholder="Akash Patil" value={form.name} onChange={handleChange} required />
            <Input label="Email" type="email" name="email" placeholder="akash@service.com" value={form.email} onChange={handleChange} required />
            <Input label="Phone" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                <select name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none">
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Experience (Years)" type="number" name="experienceYears" value={form.experienceYears} onChange={handleChange} required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/mechanics')} className="flex-1">Cancel</Button>
              <Button type="submit" loading={loading} className="flex-1">
                <UserPlus size={18} /> Add Mechanic
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}