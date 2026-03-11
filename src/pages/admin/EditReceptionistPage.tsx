import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import api from "../../config/api";
import { useNavigate, useParams } from "react-router-dom";

interface ReceptionistResponse {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
}

const EditReceptionistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceptionist = async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: ReceptionistResponse }>(
          `/api/admin/receptionists/${id}`,
          { withCredentials: true }
        );

        if (data.success && data.data) {
          setInitialValues({
            name: data.data.name,
            email: data.data.email,
            password: "",
          });
        } else {
          toast.error("Failed to load receptionist");
          navigate("/admin/receptionists");
        }
      } catch (error) {
        toast.error("Failed to load receptionist");
        navigate("/admin/receptionists");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReceptionist();
    }
  }, [id, navigate]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters"),
    }),
    onSubmit: async (values) => {
      try {
        const payload: any = {
          name: values.name,
          email: values.email,
        };

        if (values.password) {
          payload.password = values.password;
        }

        await api.put(`/api/admin/receptionists/${id}`, payload, {
          withCredentials: true,
        });
        toast.success("Receptionist updated successfully");
        navigate("/admin/receptionists");
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to update receptionist"
        );
      }
    },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          <p>Loading receptionist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Receptionist</h1>

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
              placeholder="New Password (optional)"
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
            Update Receptionist
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditReceptionistPage;

