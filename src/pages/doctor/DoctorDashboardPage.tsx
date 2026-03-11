import React, { useEffect, useMemo, useState } from "react";
import DoctorSidebar from "../../components/doctor/DoctorSidebar";
import api from "../../config/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

type Status = "Booked" | "Arrived" | "Done";

interface Appointment {
  _id: string;
  patientName?: string;
  existingPatientIdentifier?: string;
  startTime: string;
  purpose?: string;
  status: Status;
  notes?: string;
}

const DoctorDashboardPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [doctorName, setDoctorName] = useState<string>(user?.name || "");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/api/doctor/me", { withCredentials: true });
      if (data.success) setDoctorName(data.data.name);
    } catch {
      // fallback to redux user name
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/doctor/appointments", {
        params: { date: selectedDate },
        withCredentials: true,
      });
      if (data.success) setAppointments(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const seen = appointments.filter((a) => a.status === "Done").length;
    const remaining = appointments.filter((a) => a.status !== "Done").length;
    return { total, seen, remaining };
  }, [appointments]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const badgeClass = (status: Status) => {
    if (status === "Booked") return "bg-blue-50 text-blue-700 border-blue-100";
    if (status === "Arrived") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const openNotes = (a: Appointment) => {
    setEditing(a);
    setNotesDraft(a.notes || "");
  };

  const saveNotes = async () => {
    if (!editing) return;
    try {
      const { data } = await api.patch(
        `/api/doctor/appointments/${editing._id}/notes`,
        { notes: notesDraft },
        { withCredentials: true }
      );
      if (data.success) {
        setAppointments((prev) =>
          prev.map((x) => (x._id === editing._id ? data.data : x))
        );
        toast.success("Notes updated");
        setEditing(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update notes");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar />

      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {doctorName ? `${doctorName}'s Dashboard` : "Doctor Dashboard"}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              View your appointments and add notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Filter by date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchAppointments}
              className="h-10 mt-5 px-4 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">My Appointments</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">Seen</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.seen}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">Remaining</p>
            <p className="text-3xl font-bold text-amber-500">{stats.remaining}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Appointments
            </h2>
            <p className="text-sm text-slate-500">
              Only your appointments are shown. You can edit notes; booking/deleting is disabled.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Patient</th>
                  <th className="text-left font-semibold px-6 py-3">Time</th>
                  <th className="text-left font-semibold px-6 py-3">Purpose</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-left font-semibold px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      Loading...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      No appointments for this date.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {a.patientName || a.existingPatientIdentifier || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatTime(a.startTime)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {a.purpose || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-slate-600 text-xs line-clamp-2">
                            {a.notes ? a.notes : "No notes"}
                          </p>
                          <button
                            onClick={() => openNotes(a)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                          >
                            {a.notes ? "Edit" : "Add"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editing.notes ? "Edit Notes" : "Add Notes"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editing.patientName || editing.existingPatientIdentifier || "—"} •{" "}
                    {formatTime(editing.startTime)}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <textarea
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Write clinical notes..."
              />

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNotes}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboardPage;

