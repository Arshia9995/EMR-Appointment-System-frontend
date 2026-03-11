import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../config/api";
import toast from "react-hot-toast";

interface AuditLog {
  _id: string;
  userId?: string;
  role?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

const actionColor = (action: string) => {
  if (action.startsWith("LOGIN")) return "bg-blue-50 text-blue-700 border-blue-100";
  if (action === "APPOINTMENT_BOOKED") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (action === "APPOINTMENT_UPDATED" || action === "APPOINTMENT_STATUS_CHANGED")
    return "bg-amber-50 text-amber-700 border-amber-100";
  if (action === "APPOINTMENT_DELETED") return "bg-red-50 text-red-700 border-red-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
};

const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/audit-logs", {
        params: {
          page: pageNum,
          limit: 5,
          role: role || undefined,
          action: action || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
        withCredentials: true,
      });
      if (data.success) {
        setLogs(data.data.items);
        setTotal(data.data.total);
        setPages(data.data.pages);
        setPage(data.data.page);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const applyFilters = () => {
    fetchLogs(1);
  };

  const clearFilters = () => {
    setRole("");
    setAction("");
    setDateFrom("");
    setDateTo("");
    fetchLogs(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Audit Log</h2>
            <p className="text-sm text-slate-600">
              Track key system actions such as logins and appointment changes.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Role
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">All</option>
                <option value="super_admin">Super Admin</option>
                <option value="receptionist">Receptionist</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Action Type
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="">All</option>
                <option value="LOGIN_SUCCESS">Login success</option>
                <option value="LOGIN_FAILED">Login failed</option>
                <option value="LOGIN_BLOCKED">Login blocked</option>
                <option value="LOGOUT">Logout</option>
                <option value="APPOINTMENT_BOOKED">Appointment booked</option>
                <option value="APPOINTMENT_UPDATED">Appointment updated</option>
                <option value="APPOINTMENT_STATUS_CHANGED">Status changed</option>
                <option value="APPOINTMENT_DELETED">Appointment deleted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date From
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date To
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 text-sm">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-3 flex items-center justify-between border-b border-slate-100">
            <p className="text-sm text-slate-600">
              Showing {logs.length} of {total} entries
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Time</th>
                  <th className="text-left font-semibold px-6 py-3">User</th>
                  <th className="text-left font-semibold px-6 py-3">Action</th>
                  <th className="text-left font-semibold px-6 py-3">Entity</th>
                  <th className="text-left font-semibold px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      No audit entries found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const ts = new Date(log.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <tr key={log._id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-slate-700">{ts}</td>
                        <td className="px-6 py-3">
                          <div className="font-semibold text-slate-900">
                            {log.role || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.userId || "Unknown user"}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${actionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="text-slate-800">
                            {log.entityType || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.entityId || ""}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-600 max-w-xs">
                          {log.metadata
                            ? JSON.stringify(log.metadata)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 flex items-center justify-between border-t border-slate-100 text-sm">
            <p className="text-slate-500">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => page > 1 && fetchLogs(page - 1)}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
              >
                Prev
              </button>
              <button
                disabled={page >= pages}
                onClick={() => page < pages && fetchLogs(page + 1)}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogPage;


