import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import Sidebar from "../../components/common/Sidebar";
import api from "../../config/api";

interface DoctorResponse {
  _id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  workingHours: { start: string; end: string };
  breakTimes: { start: string | null; end: string | null }[];
  slotDuration: number;
}

interface FormValues {
  name: string;
  email: string;
  department: string;
  specialization: string;
  date: string;
  workingHours: { start: string; end: string };
  breakTimes: { start: string; end: string }[];
  slotDuration: number;
}

const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);

const extractDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
};

const extractTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EditDoctorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: DoctorResponse }>(
          `/api/admin/doctors/${id}`,
          { withCredentials: true }
        );

        if (data.success && data.data) {
          const doctor = data.data;
          const date = extractDate(doctor.workingHours.start);

          setInitialValues({
            name: doctor.name,
            email: doctor.email,
            department: doctor.department,
            specialization: doctor.specialization,
            date,
            workingHours: {
              start: extractTime(doctor.workingHours.start),
              end: extractTime(doctor.workingHours.end),
            },
            breakTimes:
              doctor.breakTimes && doctor.breakTimes.length > 0
                ? doctor.breakTimes.map((bt) => ({
                    start: bt.start ? extractTime(bt.start) : "",
                    end: bt.end ? extractTime(bt.end) : "",
                  }))
                : [{ start: "", end: "" }],
            slotDuration: doctor.slotDuration,
          });
        } else {
          toast.error("Failed to load doctor details");
          navigate("/admin/doctors");
        }
      } catch (error) {
        toast.error("Failed to load doctor details");
        navigate("/admin/doctors");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    }
  }, [id, navigate]);

  const now = new Date();
  const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const today = now.toISOString().split("T")[0];

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues:
      initialValues || {
        name: "",
        email: "",
        department: "",
        specialization: "",
        date: today,
        workingHours: { start: "09:00", end: "17:00" },
        breakTimes: [{ start: "", end: "" }],
        slotDuration: 15,
      },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      department: Yup.string().required("Department is required"),
      specialization: Yup.string().required("Specialization is required"),
      date: Yup.string().required("Date is required"),
      workingHours: Yup.object({
        start: Yup.string().required("Start time required"),
        end: Yup.string()
          .required("End time required")
          .test("end-after-start", "End time must be after start time", function (value) {
            const { start } = this.parent as { start: string };
            if (!value || !start) return true;
            return value > start;
          }),
      }),
      breakTimes: Yup.array().of(
        Yup.object({
          start: Yup.string().nullable(),
          end: Yup.string()
            .nullable()
            .test("end-after-start", "Break end must be after break start", function (value) {
              const { start } = this.parent as { start: string };
              if (!value || !start) return true;
              return value > start;
            }),
        })
      ),
      slotDuration: Yup.number().min(5, "Slot must be at least 5 min").required("Slot duration required"),
    }),
    onSubmit: async (values) => {
      try {
        await api.put(`/api/admin/doctors/${id}`, values, { withCredentials: true });
        toast.success("Doctor updated successfully");
        navigate("/admin/doctors");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to update doctor");
      }
    },
  });

  if (loading || !initialValues) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          <p>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Doctor</h1>

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
              name="department"
              type="text"
              placeholder="Department"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-3 rounded"
            />
            {formik.touched.department && formik.errors.department && (
              <p className="text-red-600 text-sm">{formik.errors.department}</p>
            )}
          </div>

          <div>
            <input
              name="specialization"
              type="text"
              placeholder="Specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-3 rounded"
            />
            {formik.touched.specialization && formik.errors.specialization && (
              <p className="text-red-600 text-sm">{formik.errors.specialization}</p>
            )}
          </div>

          <input
            type="date"
            name="date"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border p-3 rounded"
            min={today}
          />
          {formik.touched.date && formik.errors.date && (
            <p className="text-red-600 text-sm">{formik.errors.date}</p>
          )}

          <div className="flex gap-2">
            <input
              type="time"
              name="workingHours.start"
              value={formik.values.workingHours.start}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min={formik.values.date === today ? currentTime : "00:00"}
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
                  className="border p-2 rounded w-full"
                />
                <input
                  type="time"
                  name={`breakTimes[${idx}].end`}
                  value={bt.end}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  min={bt.start || formik.values.workingHours.start}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}
          </div>

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
            Update Doctor
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorPage;

