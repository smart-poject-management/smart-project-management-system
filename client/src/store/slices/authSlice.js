import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/login", data, {
      headers: { "Content-Type": "application/json" },
    });

    toast.success(res.data.message);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Login failed";

    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/password/forgot", { email });

      toast.success(res.data.message);
      return res.data.message;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send reset email";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/password/reset/${token}`, {
        password,
        confirmPassword,
      });

      toast.success(res.data.message);
      return res.data; // { user, message }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to reset password";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/me");
    return res.data.user;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unauthorized";

    if (error.response?.status !== 401) {
      toast.error(message);
    }
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/logout");

    toast.success("Logged out successfully");
    return null;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to logout";

    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isLoggingIn: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
    isAuthChecked: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.error = action.payload;
      })
      .addCase(getUser.pending, state => {
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isAuthChecked = true;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, state => {
        state.isCheckingAuth = false;
        state.isAuthChecked = true;
        state.authUser = null;
      })
      .addCase(logout.fulfilled, state => {
        state.authUser = null;
      })

      .addCase(forgotPassword.pending, state => {
        state.isRequestingForToken = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isRequestingForToken = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, state => {
        state.isUpdatingPassword = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload.user;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
