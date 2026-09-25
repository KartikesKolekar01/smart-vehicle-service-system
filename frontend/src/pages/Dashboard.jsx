import { useEffect, useState } from 'react';
import { Car, Calendar, CreditCard, CheckCircle, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ vehicles: 0, appointments: 0, completed: 0, payments: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicles, appointments, payments] = await Promise.all([
          axiosClient.get('/api/vehicles').catch(() => ({ data: { data: [] } })),
          axiosClient.get('/api/appointments').catch(() => ({ data: { data: [] } })),
          axiosClient.get('/api/payments').catch(() => ({ data: { data: [] } })),
        ]);

        const vehiclesList = vehicles.data.data || [];
        const appointmentsList = appointments.data.data || [];
        const paymentsList = payments.data.data || [];

        setStats({
          vehicles: vehiclesList.length,
          appointments: appointmentsList.length,
          completed: appointmentsList.filter((a) => a.status === 'COMPLETED').length,
          payments: paymentsList.length,
        });
        setRecentAppointments(appointmentsList.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Welcome back, {user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-slate-500">
          {isAdmin ? 'Here is your admin overview' : 'Track your vehicle services here'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Car} label="My Vehicles" value={stats.vehicles} color="brand" />
        <StatCard icon={Calendar} label="Appointments" value={stats.appointments} color="purple" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
        <StatCard icon={CreditCard} label="Payments" value={stats.payments} color="orange" />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
            <p className="text-sm text-slate-500">Latest service bookings</p>
          </div>
          <TrendingUp className="text-brand-500" size={22} />
        </div>

        {recentAppointments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No appointments yet</p>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {apt.vehicleRegistrationNumber}
                  </p>
                  <p className="text-sm text-slate-500">
                    {apt.serviceType?.replace(/_/g, ' ')} • {apt.appointmentDate}
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  );
}