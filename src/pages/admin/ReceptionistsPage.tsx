import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";

interface Receptionist {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

const ReceptionistsPage: React.FC = () => {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/receptionists", {
        withCredentials: true,
      });
      if (data.success) {
        setReceptionists(data.data);
      }
    } catch (error) {
      console.error("Error fetching receptionists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const handleBlockReceptionist = async (id: string) => {
    try {
      const { data } = await api.put(
        `/api/admin/receptionists/${id}/block`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setReceptionists((prev) =>
          prev.map((rec) => (rec._id === id ? data.data : rec))
        );
      }
    } catch (error) {
      console.error("Error blocking/unblocking receptionist:", error);
    }
  };

  const handleEditReceptionist = (id: string) => {
    navigate(`/admin/edit-receptionist/${id}`);
  };

  const handleAddReceptionist = () => {
    navigate("/admin/add-receptionist");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Receptionists</h1>
          <button
            onClick={handleAddReceptionist}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Receptionist
          </button>
        </div>

        {loading && <p>Loading receptionists...</p>}

        {!loading && receptionists.length === 0 && (
          <p className="text-gray-500">No receptionists found.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receptionists.map((rec) => (
            <div
              key={rec._id}
              className="bg-white shadow-lg rounded-xl p-6 flex flex-col hover:shadow-2xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {rec.name}
              </h2>
              <p className="text-gray-600 mb-2">{rec.email}</p>

              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  rec.isBlocked
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {rec.isBlocked ? "Blocked" : "Active"}
              </span>

              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => handleEditReceptionist(rec._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleBlockReceptionist(rec._id)}
                  className={`px-3 py-1 rounded transition-colors ${
                    rec.isBlocked
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {rec.isBlocked ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistsPage;

