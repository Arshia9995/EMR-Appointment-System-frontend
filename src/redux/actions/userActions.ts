import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";

interface LoginData {
  email: string;
  password: string;
}

export const userLogin = createAsyncThunk(
  "user/login",
  async (userCredentials: LoginData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", userCredentials);

      return data;
    }catch (error: any) {
  return rejectWithValue(
    error.response?.data?.message || error.message
  );
}
  }
);