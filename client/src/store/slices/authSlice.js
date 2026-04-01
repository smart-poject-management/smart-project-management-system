import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/login", data, {
      headers: { "Content-Type": "application/json" },
    });
    toast.success(res.data.message);
    return res.data.user;
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Login failed"
    );
  }
});

export const forgotPassword = createAsyncThunk(
  "forgotPassword",
  async ({ email }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/password/forgot", { email });
      toast.success(res.data.message);
      return null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/password/reset/${token}`, {
        password,
        confirmPassword,
      });
      toast.success(res.data.message);
      return res.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

export const getUser = createAsyncThunk("me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/me");
    return res.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to get user"
    );
  }
});

export const logout = createAsyncThunk("logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/logout");
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to logout");
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "Failed to logout"
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
        state.isCheckingAuth = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, state => {
        state.isCheckingAuth = false;
      })

      .addCase(logout.fulfilled, state => {
        state.authUser = null;
      })

      .addCase(forgotPassword.pending, state => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, state => {
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
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, state => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
