import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/api";
import { logout } from "../reducers/userSlice";
import toast from "react-hot-toast";

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_: void, { dispatch }) => {
    try {
      await api.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error: any) {
      console.error(
        "Logout API error:",
        error?.response?.data || error.message
      );
    } finally {
      dispatch(logout());
      toast.success("User logged out successfully");
    }
  }
);

