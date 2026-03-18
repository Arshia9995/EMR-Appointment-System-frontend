import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import { useDispatch } from "react-redux";
import { createDoctor } from "../../redux/actions/adminActions";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../config/api";

type Department = {
  _id: string;
  name: string;
};

const AddDoctorPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const now = new Date();
  const pad = (num: number) => (num < 10 ? `0${num}` : num);
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const today = now.toISOString().split("T")[0];
 const [departments, setDepartments] = useState<Department[]>([]);

 useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/api/admin/departments", {
        withCredentials: true,
      });

      // adjust based on your backend response
      setDepartments(data.data || data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  fetchDepartments();
}, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      department: "",
      specialization: "",
      date: today,
      workingHours: { start: "09:00", end: "17:00" },
      breakTimes: [{ start: "", end: "" }],
      slotDuration: 15
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password required"),
      department: Yup.string().required("Department is required"),
      specialization: Yup.string().required("Specialization is required"),
      date: Yup.string().required("Date is required"),
      workingHours: Yup.object({
        start: Yup.string()
          .required("Start time required")
          .test("not-past-time", "Start time cannot be in the past", function (value) {
            const { date } = this.parent;
            if (!value) return true;
            if (date === today && value < currentTime) return false;
            return true;
          }),
        end: Yup.string()
          .required("End time required")
          .test("end-after-start", "End time must be after start time", function (value) {
            const { start } = this.parent;
            if (!value || !start) return true;
            return value > start;
          }),
      }),
      breakTimes: Yup.array().of(
        Yup.object({
          start: Yup.string()
            .required("Break start required")
            .test("within-working-hours", "Break must be within working hours", function (value) {
              const { start, end } = this.options.context?.workingHours || {};
              if (!value || !start || !end) return true;
              return value >= start && value <= end;
            }),
          end: Yup.string()
            .required("Break end required")
            .test("within-working-hours", "Break must be within working hours", function (value) {
              const { start, end } = this.options.context?.workingHours || {};
              if (!value || !start || !end) return true;
              return value >= start && value <= end;
            })
            .test("end-after-start", "Break end must be after break start", function (value) {
              const { start } = this.parent;
              if (!value || !start) return true;
              return value > start;
            }),
        })
      ),
      slotDuration: Yup.number().min(5, "Slot must be at least 5 min").required("Slot duration required")
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(createDoctor(values)).unwrap();
        toast.success("Doctor created successfully");
        resetForm();
        navigate("/admin/doctors");
      } catch (error: any) {
        toast.error(error?.message || "Failed to create doctor");
      }
    }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Add Doctor</h1>

        <form onSubmit={formik.handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4 max-w-lg">

          {/* Name, Email, Password, Department, Specialization */}
{["name","email","password","department","specialization"].map((field) => (
  <div key={field}>

   {field === "department" ? (
  <div className="flex gap-2">
    
    {/* Typing Input */}
    <input
      type="text"
      name="department"
      placeholder="Type department"
      value={formik.values.department}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      className="w-full border p-3 rounded"
    />

    {/* Dropdown Select */}
    <select
      onChange={(e) =>
        formik.setFieldValue("department", e.target.value)
      }
      className="border p-3 rounded"
    >
      <option value="">Select</option>
      {departments.map((dept) => (
        <option key={dept._id} value={dept.name}>
          {dept.name}
        </option>
      ))}
    </select>

  </div>
) : (
      <input
        name={field}
        type={field === "password" ? "password" : "text"}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        value={(formik.values as any)[field]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full border p-3 rounded"
      />
    )}

    {(formik.touched as any)[field] && (formik.errors as any)[field] && (
      <p className="text-red-600 text-sm">
        {(formik.errors as any)[field]}
      </p>
    )}

  </div>
))}

          {/* Date */}
          <input
            type="date"
            name="date"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded"
            min={today}
          />
          {formik.touched.date && formik.errors.date && <p className="text-red-600 text-sm">{formik.errors.date}</p>}

          {/* Working Hours */}
          <div className="flex gap-2">
            <input
              type="time"
              name="workingHours.start"
              value={formik.values.workingHours.start}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min={formik.values.date===today?currentTime:"00:00"}
              className="border p-2 rounded w-full"
            />
            <input
              type="time"
              name="workingHours.end"
              value={formik.values.workingHours.end}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min={formik.values.workingHours.start}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Break Times */}
          <div>
            <label className="block font-medium">Break Times</label>
            {formik.values.breakTimes.map((bt, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <input
                  type="time"
                  name={`breakTimes[${idx}].start`}
                  value={bt.start}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={formik.values.workingHours.start}
                  max={formik.values.workingHours.end}
                  className="border p-2 rounded w-full"
                />
                <input
                  type="time"
                  name={`breakTimes[${idx}].end`}
                  value={bt.end}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={bt.start || formik.values.workingHours.start}
                  max={formik.values.workingHours.end}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>

          {/* Slot Duration */}
          <input
            name="slotDuration"
            type="number"
            placeholder="Slot Duration"
            value={formik.values.slotDuration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded"
          />
          {formik.touched.slotDuration && formik.errors.slotDuration && (
            <p className="text-red-600 text-sm">{formik.errors.slotDuration}</p>
          )}

          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
            Create Doctor
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorPage;