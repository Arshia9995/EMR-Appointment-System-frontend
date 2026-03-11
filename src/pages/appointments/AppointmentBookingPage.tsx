import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../config/api";
import type { RootState } from "../../redux/store";
import Sidebar from "../../components/common/Sidebar";
import ReceptionistSidebar from "../../components/receptionist/ReceptionistSidebar";

interface Doctor {
  _id: string;
  name: string;
  department: string;
}

type PatientType = "new" | "existing";

const AppointmentBookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);

  const params = new URLSearchParams(location.search);
  const doctorId = params.get("doctorId") || "";
  const date = params.get("date") || "";
  const timeIso = params.get("time") || "";

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patientType, setPatientType] = useState<PatientType>("new");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [existingIdentifier, setExistingIdentifier] = useState("");
  const [patientResults, setPatientResults] = useState<
    { _id: string; name: string; mobile: string; age?: number }[]
  >([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      try {
        const { data } = await api.get(`/api/admin/doctors/${doctorId}`, {
          withCredentials: true,
        });
        if (data.success) {
          setDoctor(data.data);
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const formattedTime = timeIso
    ? new Date(timeIso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const handleConfirm = async () => {
    if (!doctorId || !timeIso) {
      toast.error("Missing doctor or time");
      return;
    }

    if (patientType === "new") {
      if (!name || !mobile) {
        toast.error("Name and mobile are required for new patient");
        return;
      }
    } else if (!existingIdentifier) {
      toast.error("Please search and select an existing patient");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/api/admin/appointments/book",
        {
          doctorId,
          time: timeIso,
          patientType,
          name,
          mobile,
          age: age === "" ? undefined : age,
          existingIdentifier,
          patientId: patientType === "existing" ? selectedPatientId : undefined,
          purpose,
          notes,
        },
        { withCredentials: true }
      );
      toast.success("Appointment booked successfully");

      if (user?.role === "super_admin") {
        navigate("/admin/appointments");
      } else if (user?.role === "receptionist") {
        navigate("/scheduler");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      const msg =
        err?.response?.status === 409
          ? "This slot has just been booked. Please choose another."
          : err?.response?.data?.message || "Failed to book appointment";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPatient = async () => {
    const q = existingIdentifier.trim();
    if (!q) {
      toast.error("Enter name or mobile to search");
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get("/api/admin/patients/search", {
        params: { q },
        withCredentials: true,
      });
      if (data.success) {
        setPatientResults(data.data);
        setSelectedPatientId("");
        if (data.data.length === 0) {
          toast.error("No patient found");
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Patient search failed");
    } finally {
      setSearching(false);
    }
  };

  const LeftSidebar =
    user?.role === "super_admin"
      ? Sidebar
      : user?.role === "receptionist"
      ? ReceptionistSidebar
      : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {LeftSidebar ? <LeftSidebar /> : null}

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Confirm Appointment
        </h1>

        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">
            {doctor
              ? `Dr. ${doctor.name} • ${doctor.department}`
              : "Loading doctor..."}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formattedDate} • {formattedTime}
          </p>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setPatientType("new")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              patientType === "new"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            New Patient
          </button>
          <button
            type="button"
            onClick={() => setPatientType("existing")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              patientType === "existing"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            Existing Patient
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm max-w-xl space-y-4">
          {patientType === "new" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Patient Name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mobile
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={age}
                  onChange={(e) =>
                    setAge(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Search Existing Patient (name / mobile / ID)
              </label>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={existingIdentifier}
                  onChange={(e) => setExistingIdentifier(e.target.value)}
                  placeholder="Type name or mobile"
                />
                <button
                  type="button"
                  onClick={handleSearchPatient}
                  disabled={searching}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {searching ? "..." : "Search"}
                </button>
              </div>

              {patientResults.length > 0 && (
                <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
                  {patientResults.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(p._id);
                        setName(p.name);
                        setMobile(p.mobile);
                        setAge(p.age ?? "");
                        toast.success("Patient selected");
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                        selectedPatientId === p._id ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="font-semibold text-slate-900">
                        {p.name}{" "}
                        <span className="font-normal text-slate-500">
                          ({p.mobile})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Age: {p.age ?? "—"}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedPatientId && (
                <p className="text-xs text-emerald-700 mt-2">
                  Selected patient will be used for this booking.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Purpose of Visit
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Notes (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;

