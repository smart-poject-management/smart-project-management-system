import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, role }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/login", data, {
      headers: { "Content-Type": "application/json" },
    });
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login failed",
    );
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/auth/password/forgot", { email });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send reset email",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/auth/password/reset/${token}`, {
        password,
        confirmPassword,
      });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reset password",
      );
    }
  },
);

export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to get user",
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.post("/auth/logout");
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to logout");
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to logout",
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
  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.authUser = action.payload;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isSigningUp = false;
      })

      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
      })

      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
