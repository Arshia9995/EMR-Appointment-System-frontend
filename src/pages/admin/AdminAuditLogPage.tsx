import React from "react";
import Sidebar from "../../components/common/Sidebar";

const AdminAuditLogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Audit Log</h2>
        <p className="text-sm text-slate-600 mb-4">
          This is a placeholder for a future audit log implementation. Here you
          can record and display key administrative actions (user management,
          appointment changes, etc.).
        </p>
        <div className="bg-white rounded-lg shadow p-6 text-sm text-slate-500">
          No audit entries yet.
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogPage;

