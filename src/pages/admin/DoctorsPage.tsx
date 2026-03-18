import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  workingHours: { start: string; end: string };
  slotDuration: number;
  breakTimes: { start: string; end: string }[];
  isBlocked: boolean;
}

const DoctorsPage: React.FC = () => {
const [newDepartment, setNewDepartment] = useState<string>("");
const [addingDept, setAddingDept] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleAddDepartment = async () => {
  if (!newDepartment.trim()) {
    toast.error("Please enter department name");
    return;
  }

  try {
    setAddingDept(true);

    const { data } = await api.post(
      "/api/admin/add-department",
      { name: newDepartment },
      { withCredentials: true }
    );

    toast.success("Department added successfully ✅");

    setNewDepartment(""); // clear input
  } catch (error: any) {
    toast.error(
      error.response?.data?.message || "Failed to add department"
    );
  } finally {
    setAddingDept(false);
  }
};


  // Fetch doctors from API
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/doctors", { withCredentials: true });
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Block or unblock doctor
  const handleBlockDoctor = async (id: string) => {
    try {
      const { data } = await api.put(`/api/admin/doctors/${id}/block`, {}, { withCredentials: true });
      if (data.success) {
        setDoctors((prev) =>
          prev.map((doc) => (doc._id === id ? data.data : doc))
        );
      }
    } catch (err) {
      console.error("Error blocking/unblocking doctor:", err);
    }
  };

  // Navigate to edit doctor page
  const handleEditDoctor = (id: string) => {
    navigate(`/admin/edit-doctor/${id}`);
  };

  // Navigate to add doctor page
  const handleAddDoctor = () => {
    navigate("/admin/add-doctor");
  };

  // Format date and time
  const formatDateTime = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const date = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  };

  // Calculate total slots per doctor based on working hours, breaks and slot duration
  const calculateTotalSlots = (doctor: Doctor) => {
    const start = new Date(doctor.workingHours.start).getTime();
    const end = new Date(doctor.workingHours.end).getTime();

    if (isNaN(start) || isNaN(end) || end <= start || doctor.slotDuration <= 0) {
      return 0;
    }

    const totalMinutes = (end - start) / (1000 * 60);

    const breakMinutes = doctor.breakTimes.reduce((sum, b) => {
      const bStart = new Date(b.start).getTime();
      const bEnd = new Date(b.end).getTime();
      if (isNaN(bStart) || isNaN(bEnd) || bEnd <= bStart) return sum;
      return sum + (bEnd - bStart) / (1000 * 60);
    }, 0);

    const effectiveMinutes = Math.max(totalMinutes - breakMinutes, 0);

    return Math.floor(effectiveMinutes / doctor.slotDuration);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Doctor Schedule Setup</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage doctors, their availability, working hours, break times and slot durations.
            </p>
          </div>

          <button
            onClick={handleAddDoctor}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Doctor
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 max-w-md">
  <h2 className="text-sm font-semibold text-slate-700 mb-3">
    Add Department
  </h2>

  <div className="flex gap-2">
    <input
      type="text"
      value={newDepartment}
      onChange={(e) => setNewDepartment(e.target.value)}
      placeholder="Enter department name"
      className="flex-1 border p-2 rounded-md text-sm"
    />

    <button
      onClick={handleAddDepartment}
      disabled={addingDept}
      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
    >
      {addingDept ? "Adding..." : "Add"}
    </button>
  </div>
</div>

        {/* Loading / empty states */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-500 text-sm">Loading doctors...</p>
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-slate-500 mb-2">No doctors found.</p>
              <p className="text-xs text-slate-400">
                Click{" "}
                <span className="font-semibold text-blue-600">Add Doctor</span>{" "}
                to configure your first schedule.
              </p>
            </div>
          </div>
        )}

        {/* Doctor cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col p-6 h-full"
            >
              {/* Doctor header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Dr. {doctor.name}
                      </h2>
                      <p className="text-xs text-slate-500">{doctor.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        doctor.isBlocked
                          ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      }`}
                    >
                      {doctor.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold">Dept:</span>{" "}
                      {doctor.department}
                    </p>
                    <p>
                      <span className="font-semibold">Specialization:</span>{" "}
                      {doctor.specialization}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule section */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wide">
                    Schedule
                  </span>
                  <span>
                    {formatDateTime(doctor.workingHours.start).date}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Working Hours
                    </p>
                    <div className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm border border-slate-200">
                      {formatDateTime(doctor.workingHours.start).time} -{" "}
                      {formatDateTime(doctor.workingHours.end).time}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Slot Duration
                    </p>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                      {doctor.slotDuration} mins
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Total Slots
                    </p>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      {calculateTotalSlots(doctor)} slots
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1 text-center">
                    Break Times
                  </p>
                  {doctor.breakTimes.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-center">
                      {doctor.breakTimes.map((b, idx) => (
                        <span
                          key={`${doctor._id}-break-${idx}`}
                          className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 border border-amber-100"
                        >
                          {formatDateTime(b.start!).time} -{" "}
                          {formatDateTime(b.end!).time}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center">
                      No breaks configured
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleEditDoctor(doctor._id)}
                  className="inline-flex justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                >
                  Edit Schedule
                </button>
                <button
                  onClick={() => handleBlockDoctor(doctor._id)}
                  className={`inline-flex justify-center rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    doctor.isBlocked
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                      : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                  }`}
                >
                  {doctor.isBlocked ? "Unblock Doctor" : "Block Doctor"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;