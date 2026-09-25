import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Hash, Gauge } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export default function AddVehicle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    registrationNumber: '',
    brand: '',
    model: '',
    vehicleType: 'CAR',
    manufacturingYear: 2022,
    fuelType: 'PETROL',
    currentKm: '',
    nextServiceKm: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/api/vehicles', {
        ...form,
        manufacturingYear: Number(form.manufacturingYear),
        currentKm: Number(form.currentKm),
        nextServiceKm: form.nextServiceKm ? Number(form.nextServiceKm) : null,
      });
      toast.success('Vehicle added successfully');
      navigate('/vehicles');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Add Vehicle</h1>
          <p className="text-slate-500">Register a new vehicle to your account</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Registration Number"
              name="registrationNumber"
              placeholder="MH09AB1234"
              icon={Hash}
              value={form.registrationNumber}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Brand" name="brand" placeholder="Tata" value={form.brand} onChange={handleChange} required />
              <Input label="Model" name="model" placeholder="Nexon" value={form.model} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none">
                  <option value="CAR">Car</option>
                  <option value="BIKE">Bike</option>
                  <option value="SUV">SUV</option>
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                  <option value="BUS">Bus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fuel Type</label>
                <select name="fuelType" value={form.fuelType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none">
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
              name="manufacturingYear"
              value={form.manufacturingYear}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Current KM" type="number" name="currentKm" placeholder="45000" icon={Gauge} value={form.currentKm} onChange={handleChange} required />
              <Input label="Next Service KM" type="number" name="nextServiceKm" placeholder="50000" value={form.nextServiceKm} onChange={handleChange} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/vehicles')} className="flex-1">Cancel</Button>
              <Button type="submit" loading={loading} className="flex-1">
                <Car size={18} /> Add Vehicle
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}