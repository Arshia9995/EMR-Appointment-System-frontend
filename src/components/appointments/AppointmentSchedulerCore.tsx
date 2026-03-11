import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";

interface Doctor {
  _id: string;
  name: string;
  department: string;
  workingHours: { start: string; end: string };
  slotDuration: number;
  breakTimes: { start: string; end: string }[];
  isBlocked?: boolean;
}

interface Props {
  title: string;
  subtitle: string;
}

const AppointmentSchedulerCore: React.FC<Props> = ({ title, subtitle }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );
  const [bookedStarts, setBookedStarts] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get("/api/admin/doctors", {
          withCredentials: true,
        });
        if (data.success) {
          setDoctors(data.data);
        }
      } catch (error) {
        console.error("Error fetching doctors for scheduler:", error);
      }
    };

    fetchDoctors();
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    doctors
      .filter((d) => !d.isBlocked)
      .forEach((d) => set.add(d.department));
    return Array.from(set);
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors
      .filter((d) => !d.isBlocked)
      .filter((d) => (selectedDepartment ? d.department === selectedDepartment : true));
  }, [doctors, selectedDepartment]);

  const activeDoctor = useMemo(() => {
    if (!filteredDoctors.length) return null;
    const existsInFilter = filteredDoctors.some((d) => d._id === selectedDoctorId);
    if (selectedDoctorId && existsInFilter) {
      return filteredDoctors.find((d) => d._id === selectedDoctorId) || null;
    }
    return filteredDoctors[0] || null;
  }, [filteredDoctors, selectedDoctorId]);

  useEffect(() => {
    // Keep selected doctor consistent with department filter.
    // If current doctor is not in the filtered list, auto-select the first one.
    if (!filteredDoctors.length) {
      if (selectedDoctorId) setSelectedDoctorId("");
      return;
    }

    const existsInFilter = filteredDoctors.some((d) => d._id === selectedDoctorId);
    if (!selectedDoctorId || !existsInFilter) {
      setSelectedDoctorId(filteredDoctors[0]._id);
    }
  }, [filteredDoctors, selectedDoctorId]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = activeDoctor?._id;
      if (!doctorId) {
        setBookedStarts([]);
        return;
      }
      try {
        const requestedDoctorId = doctorId;
        const { data } = await api.get(
          `/api/admin/appointments/doctor/${requestedDoctorId}`,
          {
            params: { date: selectedDate },
            withCredentials: true,
          }
        );
        // Guard against race conditions (doctor changed while request in flight)
        if (requestedDoctorId !== activeDoctor?._id) return;

        if (data.success) {
          const starts: string[] = data.data.map((a: any) =>
            new Date(a.startTime).toISOString()
          );
          setBookedStarts(starts);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setBookedStarts([]);
      }
    };

    fetchAppointments();
  }, [activeDoctor?._id, selectedDate]);

  const createLocalDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    const base = new Date();
    base.setFullYear(y, m - 1, d);
    base.setHours(0, 0, 0, 0);
    return base;
  };

  const extractHoursMinutes = (dateStr: string) => {
    const dt = new Date(dateStr);
    return { h: dt.getHours(), min: dt.getMinutes() };
  };

  const buildSlotsForDoctor = (doctor: Doctor | null) => {
    if (!doctor) return [];

    const base = createLocalDate(selectedDate);

    const ws = extractHoursMinutes(doctor.workingHours.start);
    const we = extractHoursMinutes(doctor.workingHours.end);

    const workingStart = new Date(base);
    workingStart.setHours(ws.h, ws.min, 0, 0);
    const workingEnd = new Date(base);
    workingEnd.setHours(we.h, we.min, 0, 0);

    if (isNaN(workingStart.getTime()) || isNaN(workingEnd.getTime())) return [];

    const breaks = doctor.breakTimes.map((b) => {
      const bsHM = extractHoursMinutes(b.start);
      const beHM = extractHoursMinutes(b.end);

      const bs = new Date(base);
      bs.setHours(bsHM.h, bsHM.min, 0, 0);
      const be = new Date(base);
      be.setHours(beHM.h, beHM.min, 0, 0);

      if (isNaN(bs.getTime()) || isNaN(be.getTime())) return null;
      return { start: bs, end: be };
    }).filter(Boolean) as { start: Date; end: Date }[];

    const slots: { time: Date; status: "available" | "booked" | "past" }[] = [];
    const now = new Date();

    let current = new Date(workingStart);
    const slotMs = doctor.slotDuration * 60 * 1000;

    while (current < workingEnd) {
      const slotEnd = new Date(current.getTime() + slotMs);

      const inBreak = breaks.some(
        (b) => slotEnd > b.start && current < b.end
      );

      let status: "available" | "booked" | "past" = "available";
      const slotKey = new Date(current).toISOString();

      if (slotEnd <= now) {
        status = "past";
      }

      if (inBreak) {
        status = "past";
      }

      if (status === "available" && bookedStarts.includes(slotKey)) {
        status = "booked";
      }

      slots.push({ time: new Date(current), status });

      current = slotEnd;
    }

    return slots;
  };

  const slots = useMemo(
    () => buildSlotsForDoctor(activeDoctor),
    [activeDoctor, selectedDate, bookedStarts]
  );

  const formatTimeLabel = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleSlotClick = (slotTime: Date, status: "available" | "booked" | "past") => {
    if (status !== "available" || !activeDoctor) return;

    const query = new URLSearchParams({
      doctorId: activeDoctor._id,
      date: selectedDate,
      time: slotTime.toISOString(),
    }).toString();

    navigate(`/booking?${query}`);
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1 mt-1">
              <span className="h-3 w-3 rounded-full bg-red-500" /> Booked
            </span>
            <span className="flex items-center gap-1 mt-1">
              <span className="h-3 w-3 rounded-full bg-slate-300" /> Past
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Filter by
            </p>

            <label className="block text-xs text-slate-500 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                const dept = e.target.value;
                setSelectedDepartment(dept);

                const firstInDept = doctors
                  .filter((d) => !d.isBlocked)
                  .find((d) => (dept ? d.department === dept : true));
                setSelectedDoctorId(firstInDept?._id || "");
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <label className="block text-xs text-slate-500 mt-4 mb-1">
              Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filteredDoctors.length === 0 && (
                <option value="">No doctors found</option>
              )}
              {filteredDoctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.name} ({doc.department})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Pick a Date
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Time Slots
                </p>
                {activeDoctor ? (
                  <p className="text-sm text-slate-600">
                    Dr. {activeDoctor.name} • {activeDoctor.department}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    No doctor selected.
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {activeDoctor && slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {slots.map((slot) => {
                  const label = formatTimeLabel(slot.time);

                  const baseClasses =
                    "w-full rounded-lg px-2 py-2 text-xs font-medium text-center cursor-pointer border transition";
                  let stateClasses = "";

                  if (slot.status === "available") {
                    stateClasses =
                      "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100";
                  } else if (slot.status === "booked") {
                    stateClasses =
                      "bg-red-50 text-red-600 border-red-100 cursor-not-allowed";
                  } else {
                    stateClasses =
                      "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";
                  }

                  return (
                    <button
                      key={slot.time.toISOString()}
                      type="button"
                      className={`${baseClasses} ${stateClasses}`}
                      onClick={() => handleSlotClick(slot.time, slot.status)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-400">
                No slots available for the selected configuration.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSchedulerCore;

