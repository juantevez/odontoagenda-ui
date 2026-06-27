import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected.routes';
import { PublicRoute } from './public.routes';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import Stats from '../pages/dashboard/Stats';
import PatientList from '../pages/patients/PatientList';
import PatientDetail from '../pages/patients/PatientDetail';
import PatientFormPage from '../pages/patients/PatientForm';
import AppointmentCalendar from '../pages/appointments/AppointmentCalendar';
import AppointmentList from '../pages/appointments/AppointmentList';
import AppointmentBooking from '../pages/appointments/AppointmentBooking';
import ToothMapBooking from '../pages/appointments/ToothMapBooking';
import ProfessionalList from '../pages/professionals/ProfessionalList';
import ProfessionalFormPage from '../pages/professionals/ProfessionalForm';
import ProfessionalSchedule from '../pages/professional/ProfessionalSchedule';
import QuoteList from '../pages/billing/QuoteList';
import PaymentFormPage from '../pages/billing/PaymentForm';
import Reports from '../pages/billing/Reports';
import Profile from '../pages/settings/Profile';
import Configuration from '../pages/settings/Configuration';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />

      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin_sucursal', 'recepcionista']}>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/new"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin_sucursal', 'recepcionista']}>
            <PatientFormPage />
          </ProtectedRoute>
        }
      />
      <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />

      <Route path="/appointments" element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
      <Route path="/appointments/list" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
      <Route path="/appointments/new" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute><ToothMapBooking /></ProtectedRoute>} />

      <Route
        path="/professional/schedule"
        element={
          <ProtectedRoute allowedRoles={['superadmin', 'admin_sucursal', 'recepcionista', 'profesional']}>
            <ProfessionalSchedule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/professionals"
        element={<ProtectedRoute allowedRoles={['superadmin', 'admin_sucursal', 'recepcionista']}><ProfessionalList /></ProtectedRoute>}
      />
      <Route
        path="/professionals/new"
        element={<ProtectedRoute allowedRoles={['superadmin', 'admin_sucursal']}><ProfessionalFormPage /></ProtectedRoute>}
      />

      <Route path="/billing" element={<ProtectedRoute><QuoteList /></ProtectedRoute>} />
      <Route path="/billing/pay/:quoteId" element={<ProtectedRoute><PaymentFormPage /></ProtectedRoute>} />
      <Route
        path="/billing/reports"
        element={<ProtectedRoute allowedRoles={['superadmin', 'admin_sucursal']}><Reports /></ProtectedRoute>}
      />

      <Route path="/settings" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings/config" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />

      <Route path="/unauthorized" element={
        <div style={{ padding: 32, textAlign: 'center' }}>
          <h2>Acceso denegado</h2>
          <p>No tienes permisos para ver esta página.</p>
        </div>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
