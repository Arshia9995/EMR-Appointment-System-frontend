import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

export const createDoctor = createAsyncThunk(
  "admin/createDoctor",
  async (doctorData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/admin/doctor", doctorData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch doctors
export const fetchDoctors = createAsyncThunk(
  "admin/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/admin/doctors");
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Block / unblock doctor
export const blockDoctor = createAsyncThunk(
  "admin/blockDoctor",
  async (doctorId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/admin/doctors/${doctorId}/block`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);