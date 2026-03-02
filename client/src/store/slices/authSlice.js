import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data, {
      headers: { "Content-Type": "application/json" },
    });
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});
export const forgotPassword = createAsyncThunk(
  "forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", email);
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to send reset email");
    }
  }
);
export const resetPassword = createAsyncThunk(
  "auth/password/reset",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/auth/password/reset/${token}`, { password, confirmPassword });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to reset password");
    }
  }
);
export const getUser = createAsyncThunk(
  "auth/me", async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/auth/me`);
      return res.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to get user");
    }
  });
export const logout = createAsyncThunk("logout", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.post(`/auth/logout`);
    return null;
  } catch (error) {
    toast.error(error.response.data.message || "Failed to logout");
    return thunkAPI.rejectWithValue(
      error.response.data.message || "Failed to logout"
    );
  }
});
const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, state => {
        state.isLoggingIn = false;
      })
      .addCase(getUser.pending, state => {
        state.isRequestingForToken = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isRequestingForToken = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, state => {
        state.isLoggingIn = false;
      })
      .addCase(forgotPassword.pending, state => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, state => {
        state.isRequestingForToken = false;
      })
      .addCase(resetPassword.pending, state => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
      })
      .addCase(resetPassword.rejected, state => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
