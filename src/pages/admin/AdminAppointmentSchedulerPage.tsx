import React from "react";
import Sidebar from "../../components/common/Sidebar";
import AppointmentSchedulerCore from "../../components/appointments/AppointmentSchedulerCore";

const AdminAppointmentSchedulerPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <AppointmentSchedulerCore
        title="Appointment Scheduler"
        subtitle="Filter by doctor, department and date to manage appointments."
      />
    </div>
  );
};

export default AdminAppointmentSchedulerPage;

