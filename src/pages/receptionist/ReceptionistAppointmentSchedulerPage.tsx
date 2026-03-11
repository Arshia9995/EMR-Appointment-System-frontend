import React from "react";
import ReceptionistSidebar from "../../components/receptionist/ReceptionistSidebar";
import AppointmentSchedulerCore from "../../components/appointments/AppointmentSchedulerCore";

const ReceptionistAppointmentSchedulerPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <ReceptionistSidebar />
      <AppointmentSchedulerCore
        title="Appointment Scheduler"
        subtitle="Pick a doctor and date to schedule patient appointments."
      />
    </div>
  );
};

export default ReceptionistAppointmentSchedulerPage;

