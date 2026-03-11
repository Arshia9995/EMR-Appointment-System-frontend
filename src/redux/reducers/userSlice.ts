import { createSlice } from "@reduxjs/toolkit";
import { userLogin } from "../actions/userActions";

interface UserState {
  user: any;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

     .addCase(userLogin.fulfilled, (state, action) => {
     state.loading = false;
     state.user = action.payload.data;
      })

      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;