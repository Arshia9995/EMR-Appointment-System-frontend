import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../components/admin/AdminDashboard";
import DoctorsPage from "../pages/admin/DoctorsPage";
import AddDoctorPage from "../pages/admin/AddDoctorPage";
import EditDoctorPage from "../pages/admin/EditDoctorPage";
import ReceptionistsPage from "../pages/admin/ReceptionistsPage";
import AddReceptionistPage from "../pages/admin/AddReceptionistPage";
import EditReceptionistPage from "../pages/admin/EditReceptionistPage";
import AdminAppointmentSchedulerPage from "../pages/admin/AdminAppointmentSchedulerPage";
import AdminAuditLogPage from "../pages/admin/AdminAuditLogPage";

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <DoctorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-doctor"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AddDoctorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-doctor/:id"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <EditDoctorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionists"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <ReceptionistsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-receptionist"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AddReceptionistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-receptionist/:id"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <EditReceptionistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminAppointmentSchedulerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <AdminAuditLogPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;