import React from "react";
import { Calendar, Home, LayoutDashboard, LogOut, Stethoscope } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../redux/actions/authActions";

const DoctorSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch<any>(logoutUser());
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">EMR System</h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <Stethoscope size={14} /> Doctor Portal
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 w-full p-3 rounded hover:bg-blue-50"
        >
          <Home size={18} />
          Home
        </button>

        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="flex items-center gap-3 w-full p-3 rounded hover:bg-blue-50"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="flex items-center gap-3 w-full p-3 rounded hover:bg-blue-50"
        >
          <Calendar size={18} />
          My Appointments
        </button>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-4 border-t text-red-600 hover:bg-red-50"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default DoctorSidebar;

