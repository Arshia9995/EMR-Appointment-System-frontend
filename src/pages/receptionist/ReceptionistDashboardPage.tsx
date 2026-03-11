import React, { useEffect, useMemo, useState } from "react";
import ReceptionistSidebar from "../../components/receptionist/ReceptionistSidebar";
import api from "../../config/api";
import toast from "react-hot-toast";

type Status = "Booked" | "Arrived" | "Done";

interface Appointment {
  _id: string;
  patientName?: string;
  mobile?: string;
  age?: number;
  existingPatientIdentifier?: string;
  purpose?: string;
  notes?: string;
  startTime: string;
  doctor: { _id: string; name: string; department: string };
  status: Status;
}

const ReceptionistDashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState({
    patientName: "",
    mobile: "",
    purpose: "",
    notes: "",
    age: "",
    status: "Booked" as Status,
  });

  const today = new Date().toISOString().slice(0, 10);

  const fetchToday = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/appointments", {
        params: { date: today },
        withCredentials: true,
      });
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const arrived = appointments.filter((a) => a.status === "Arrived").length;
    const waiting = appointments.filter((a) => a.status === "Booked").length;
    return { total, arrived, waiting };
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

  const updateStatus = async (id: string, status: Status) => {
    try {
      const { data } = await api.patch(
        `/api/admin/appointments/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? data.data : a))
        );
        toast.success(`Marked as ${status}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data } = await api.delete(`/api/admin/appointments/${id}`, {
        withCredentials: true,
      });
      if (data.success) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        toast.success("Appointment deleted");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete appointment");
    }
  };

  const openEdit = (a: Appointment) => {
    setEditing(a);
    setEditForm({
      patientName: a.patientName || a.existingPatientIdentifier || "",
      mobile: a.mobile || "",
      purpose: a.purpose || "",
      notes: a.notes || "",
      age: a.age !== undefined && a.age !== null ? String(a.age) : "",
      status: a.status,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      if (editForm.status !== editing.status) {
        const { data: statusData } = await api.patch(
          `/api/admin/appointments/${editing._id}/status`,
          { status: editForm.status },
          { withCredentials: true }
        );
        if (statusData.success) {
          setAppointments((prev) =>
            prev.map((a) => (a._id === editing._id ? statusData.data : a))
          );
          setEditing((prev) =>
            prev ? { ...prev, status: statusData.data.status as Status } : prev
          );
        }
      }

      const { data } = await api.put(
        `/api/admin/appointments/${editing._id}`,
        {
          patientName: editForm.patientName,
          mobile: editForm.mobile,
          purpose: editForm.purpose,
          notes: editForm.notes,
          age: editForm.age ? Number(editForm.age) : undefined,
        },
        { withCredentials: true }
      );
      if (data.success) {
        setAppointments((prev) =>
          prev.map((a) => (a._id === editing._id ? data.data : a))
        );
        toast.success("Appointment updated");
        setEditing(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update appointment");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ReceptionistSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Receptionist Dashboard
        </h1>
        <p className="text-slate-600 mb-8 text-sm">
          Manage patient appointments and doctor schedules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">Appointments Today</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">Arrived</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.arrived}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 mb-1">Waiting</p>
            <p className="text-3xl font-bold text-amber-500">{stats.waiting}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Today&apos;s Appointments
              </h2>
              <p className="text-sm text-slate-500">
                Patient | Time | Doctor | Status | Action
              </p>
            </div>
            <button
              onClick={fetchToday}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Patient</th>
                  <th className="text-left font-semibold px-6 py-3">Time</th>
                  <th className="text-left font-semibold px-6 py-3">Doctor</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-left font-semibold px-6 py-3">Action</th>
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
                      No appointments for today.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {a.patientName || a.existingPatientIdentifier || "—"}
                        </div>
                        <div className="text-xs text-slate-500">{a.mobile || ""}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatTime(a.startTime)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          Dr. {a.doctor?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {a.doctor?.department}
                        </div>
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
                        <div className="flex flex-wrap gap-2">
                          {a.status === "Booked" && (
                            <button
                              onClick={() => updateStatus(a._id, "Arrived")}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Mark as Arrived
                            </button>
                          )}
                          {a.status === "Arrived" && (
                            <button
                              onClick={() => updateStatus(a._id, "Done")}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                            >
                              Mark as Done
                            </button>
                          )}

                          <button
                            onClick={() => openEdit(a)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
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
                    Edit Appointment
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editing.patientName || editing.existingPatientIdentifier || "—"} •{" "}
                    {formatTime(editing.startTime)} • Dr. {editing.doctor?.name}
                  </p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        status: e.target.value as Status,
                      }))
                    }
                  >
                    <option value="Booked">Booked</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Patient Name
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editForm.patientName}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, patientName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Mobile
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editForm.mobile}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, mobile: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Age
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, age: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Purpose
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editForm.purpose}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, purpose: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, notes: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-slate-900">
                Delete appointment?
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                This will permanently delete{" "}
                <span className="font-semibold">
                  {deleteTarget.patientName ||
                    deleteTarget.existingPatientIdentifier ||
                    "this appointment"}
                </span>{" "}
                at{" "}
                <span className="font-semibold">
                  {formatTime(deleteTarget.startTime)}
                </span>
                .
              </p>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const id = deleteTarget._id;
                    setDeleteTarget(null);
                    await handleDelete(id);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReceptionistDashboardPage;

