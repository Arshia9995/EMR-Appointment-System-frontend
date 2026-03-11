import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

import { userLogin } from "../../redux/actions/userActions";
import type { RootState, AppDispatch } from "../../redux/store";

interface LoginValues {
  email: string;
  password: string;
}

const initialValues: LoginValues = {
  email: "",
  password: "",
};

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error } = useSelector((state: RootState) => state.user);

  const { values, handleChange, handleSubmit } = useFormik({
    initialValues,
onSubmit: async (values) => {
  try {
    const result = await dispatch(userLogin(values)).unwrap();

    toast.success("Login successful!");

    const role = result.data.role;

    if (role === "super_admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (role === "doctor") {
      navigate("/doctor/dashboard", { replace: true });
    } else if (role === "receptionist") {
      navigate("/receptionist/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }

  } catch (err: any) {
    toast.error(err?.message || err);
  }
}

  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

        <h2 className="text-3xl font-bold text-center text-blue-600">
          EMR Login
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Access your medical dashboard
        </p>

       {error && (
  <div className="mt-4 text-red-600 text-center">
    {typeof error === "string" ? error : error}
  </div>
)}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700 font-medium">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

        

          {/* Login Button */}
        <button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
>
  {loading ? "Logging in..." : "Login"}
</button>
        </form>

        {/* Back to Home */}
        <p className="text-center text-gray-500 mt-6">
          Back to{" "}
          <Link
            to="/"
            className="text-blue-600 hover:underline"
          >
            Home
          </Link>
        </p>

      </div>

    </div>
  );
};

export default LoginPage;