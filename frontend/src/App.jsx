import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyVehicles from './pages/MyVehicles';
import AddVehicle from './pages/AddVehicle';
import MyAppointments from './pages/MyAppointments';
import BookAppointment from './pages/BookAppointment';
import AdminAppointments from './pages/AdminAppointments';
import Mechanics from './pages/Mechanics';
import AddMechanic from './pages/AddMechanic';
import SpareParts from './pages/SpareParts';
import AddPart from './pages/AddPart';
import Payments from './pages/Payments';
import Notifications from './pages/Notifications';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ─────────── Public Routes ─────────── */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />

      {/* Forgot/Reset Password — accessible even when logged in */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ─────────── Protected Routes (Customer) ─────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <MyVehicles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/add"
        element={
          <ProtectedRoute>
            <AddVehicle />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/book"
        element={
          <ProtectedRoute>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* ─────────── Admin Routes ─────────── */}
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mechanics"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <Mechanics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mechanics/add"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AddMechanic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/parts"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <SpareParts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/parts/add"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AddPart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <Payments />
          </ProtectedRoute>
        }
      />

      {/* ─────────── Default Redirects ─────────── */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}