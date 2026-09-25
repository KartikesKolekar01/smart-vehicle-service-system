import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const SERVICE_TYPES = [
  'GENERAL_SERVICE',
  'OIL_CHANGE',
  'BRAKE_SERVICE',
  'AC_SERVICE',
  'ENGINE_REPAIR',
  'TYRE_REPLACEMENT',
  'BATTERY_REPLACEMENT',
  'FULL_INSPECTION',
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vehicleId: preselectedVehicleId || '',
    serviceType: 'GENERAL_SERVICE',
    appointmentDate: '',
    timeSlot: '10:00 AM',
    problemDescription: '',
  });

  useEffect(() => {
    axiosClient.get('/api/vehicles').then((res) => {
      const list = res.data.data || [];
      setVehicles(list);
      if (!form.vehicleId && list.length > 0) {
        setForm((f) => ({ ...f, vehicleId: list[0].id }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/api/appointments', {
        ...form,
        vehicleId: Number(form.vehicleId),
      });
      toast.success('Appointment booked!');
      navigate('/appointments');
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
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Book Service
          </h1>
          <p className="text-slate-500">Schedule a new appointment</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select Vehicle
              </label>
              <select
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
                required
              >
                <option value="">Choose a vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Service Type
              </label>
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <Input
              label="Appointment Date"
              type="date"
              name="appointmentDate"
              value={form.appointmentDate}
              onChange={handleChange}
              required
            />

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Time Slot
              </label>
              <select
                name="timeSlot"
                value={form.timeSlot}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none"
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>12:00 PM</option>
                <option>02:00 PM</option>
                <option>03:00 PM</option>
                <option>04:00 PM</option>
                <option>05:00 PM</option>
              </select>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Problem Description
              </label>
              <textarea
                name="problemDescription"
                value={form.problemDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Describe the issue..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-brand-500 outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/appointments')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                <Calendar size={18} /> Book Now
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}