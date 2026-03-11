import React, { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    doctorsCount: 0,
    staffCount: 0,
    apptsToday: 0,
  });
  const [recent, setRecent] = useState<
    {
      _id: string;
      patientName?: string;
      existingPatientIdentifier?: string;
      doctor?: { name: string; department: string };
      status: string;
      startTime: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/dashboard/stats", {
        withCredentials: true,
      });
      if (data.success) {
        setStats({
          doctorsCount: data.data.doctorsCount,
          staffCount: data.data.staffCount,
          apptsToday: data.data.apptsToday,
        });
        setRecent(data.data.recentAppointments || []);
      }
    } catch {
      // ignore for now, show zeros
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
            <p className="text-sm text-slate-600 mt-1">
              Monitor system-wide activity and navigate to all sections.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate("/admin/doctors")}
          >
            <h3 className="text-gray-500">Total Doctors</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.doctorsCount}
            </p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate("/admin/receptionists")}
          >
            <h3 className="text-gray-500">Staff (Receptionists)</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.staffCount}
            </p>
          </div>

          <div
            className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate("/admin/appointments")}
          >
            <h3 className="text-gray-500">Appointments Today</h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats.apptsToday}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Quick Navigation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => navigate("/admin/doctors")}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Doctors Management
              </button>
              <button
                onClick={() => navigate("/admin/receptionists")}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Receptionists Management
              </button>
              <button
                onClick={() => navigate("/admin/appointments")}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Appointment Scheduler
              </button>
              <button
                onClick={() => navigate("/scheduler")}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Receptionist View
              </button>
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Doctor View
              </button>
              <button
                onClick={() => navigate("/admin/audit-log")}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Audit Log
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Recent Activity (Today)
            </h3>
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500">
                No recent appointment activity for today.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {recent.map((a) => (
                  <li key={a._id} className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {a.patientName ||
                          a.existingPatientIdentifier ||
                          "Unknown patient"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Dr. {a.doctor?.name} • {a.doctor?.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {new Date(a.startTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                      <p className="text-xs text-slate-600">{a.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;