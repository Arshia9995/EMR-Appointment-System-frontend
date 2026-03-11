import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/actions/authActions";
import type { RootState } from "../redux/store";

const HomePage: React.FC = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const user = useSelector((state: RootState) => state.user.user);
  const user = useSelector((state: RootState) => state.user?.user);

  const handleLogout = async () => {
    await dispatch<any>(logoutUser());
    navigate("/login");
  };

  const getDashboardButton = () => {

    if (!user) return null;

    if (user.role === "super_admin") {
      return (
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="text-blue-600 font-semibold hover:underline"
        >
          Admin Dashboard
        </button>
      );
    }

    if (user.role === "doctor") {
      return (
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="text-blue-600 font-semibold hover:underline"
        >
          Doctor Dashboard
        </button>
      );
    }

    if (user.role === "receptionist") {
      return (
        <button
          onClick={() => navigate("/receptionist/dashboard")}
          className="text-blue-600 font-semibold hover:underline"
        >
          Receptionist Dashboard
        </button>
      );
    }

    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen w-full">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">

        <h1 className="text-2xl font-bold text-blue-600">
          EMR System
        </h1>

        <div className="flex items-center space-x-6">

          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>

          <button className="text-gray-700 hover:text-blue-600">
            About
          </button>

          {/* Role Based Dashboard Button */}
          {getDashboardButton()}

          {/* Login / Logout */}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
          )}

        </div>

      </nav>

      {/* Hero Section */}
      <section className="w-full min-h-screen flex items-center">

        <div className="w-full grid grid-cols-2 gap-10 px-16 py-16 items-center">

          <div>

            <h1 className="text-5xl font-bold text-gray-800">
              Smart EMR Appointment System
            </h1>

            <p className="text-gray-600 mt-6 text-lg">
              Manage patient appointments, electronic medical records,
              and doctor schedules efficiently in one secure platform.
            </p>

            <div className="mt-8 flex space-x-4">

              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Get Started
              </Link>

              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold">
                Learn More
              </button>

            </div>

          </div>

          <div className="flex justify-center">

            <img
              src="https://img.freepik.com/free-vector/doctor-consultation-illustration_88138-414.jpg"
              alt="doctor"
              className="rounded-2xl w-full max-w-lg shadow-lg"
            />

          </div>

        </div>

      </section>

      {/* Features Section */}
      <section className="px-16 py-20 bg-white">

        <h2 className="text-3xl font-bold text-center text-gray-800">
          Key Features
        </h2>

        <div className="grid grid-cols-3 gap-8 mt-12">

          <div className="p-6 bg-blue-50 rounded-xl shadow">

            <h3 className="text-xl font-semibold text-blue-600">
              Appointment Booking
            </h3>

            <p className="text-gray-600 mt-3">
              Easily schedule and manage doctor appointments with a simple interface.
            </p>

          </div>

          <div className="p-6 bg-blue-50 rounded-xl shadow">

            <h3 className="text-xl font-semibold text-blue-600">
              Electronic Medical Records
            </h3>

            <p className="text-gray-600 mt-3">
              Doctors can securely access and update patient medical records.
            </p>

          </div>

          <div className="p-6 bg-blue-50 rounded-xl shadow">

            <h3 className="text-xl font-semibold text-blue-600">
              Secure Platform
            </h3>

            <p className="text-gray-600 mt-3">
              Built with modern authentication and role-based access control.
            </p>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-white text-gray-500">
        © 2026 EMR Appointment System
      </footer>

    </div>
  );
};

export default HomePage;