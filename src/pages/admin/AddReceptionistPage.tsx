import React from "react";
import Sidebar from "../../components/common/Sidebar";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";

const AddReceptionistPage: React.FC = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await api.post("/api/admin/receptionist", values, {
          withCredentials: true,
        });
        toast.success("Receptionist created successfully");
        resetForm();
        navigate("/admin/receptionists");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to create receptionist"
        );
      }
    },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Add Receptionist</h1>

        <form
          onSubmit={formik.handleSubmit}
          className="bg-white shadow p-6 rounded-lg space-y-4 max-w-lg"
        >
          <div>
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-3 rounded"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-600 text-sm">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-3 rounded"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-600 text-sm">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-3 rounded"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-600 text-sm">{formik.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Create Receptionist
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReceptionistPage;

