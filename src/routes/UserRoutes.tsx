import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
import ReceptionistDashboardPage from "../pages/receptionist/ReceptionistDashboardPage";
import ReceptionistAppointmentSchedulerPage from "../pages/receptionist/ReceptionistAppointmentSchedulerPage";
import AppointmentBookingPage from "../pages/appointments/AppointmentBookingPage";
import ProtectedRoute from "./ProtectedRoute";

const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <ReceptionistDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scheduler"
        element={
          <ProtectedRoute allowedRoles={["receptionist"]}>
            <ReceptionistAppointmentSchedulerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "receptionist"]}>
            <AppointmentBookingPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default UserRoutes;