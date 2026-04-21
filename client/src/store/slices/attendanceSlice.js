import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";

const getErrorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  "Something went wrong";

export const getAttendanceStudents = createAsyncThunk(
  "attendance/getStudents",
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.session) params.append("session", filters.session);
      if (filters.semester) params.append("semester", filters.semester);

      const query = params.toString();
      // Temporary debug log for API call.
      console.log("[Attendance][Slice] GET /attendance/students", query || "(no filters)");
      const res = await axiosInstance.get(
        `/attendance/students${query ? `?${query}` : ""}`,
      );
      return res.data?.data?.students || [];
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const markBulkAttendance = createAsyncThunk(
  "attendance/markBulk",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/attendance/mark-bulk", payload);
      toast.success(res.data?.message || "Attendance marked");
      return payload;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const getMyAttendance = createAsyncThunk(
  "attendance/getMy",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/attendance/my");
      return res.data?.data || { history: [], summary: {} };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const getAttendanceOverview = createAsyncThunk(
  "attendance/getOverview",
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.session) params.append("session", filters.session);
      if (filters.semester) params.append("semester", filters.semester);
      const query = params.toString();

      const res = await axiosInstance.get(
        `/attendance/overview${query ? `?${query}` : ""}`,
      );

      return (
        res.data?.data || {
          rows: [],
          totals: { students: 0, present: 0, classes: 0, percentage: 0 },
        }
      );
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    students: [],
    overviewRows: [],
    overviewTotals: { students: 0, present: 0, classes: 0, percentage: 0 },
    history: [],
    summary: { present: 0, total: 0, percentage: 0 },
    loadingStudents: false,
    loadingMyAttendance: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAttendanceStudents.pending, (state) => {
        state.loadingStudents = true;
        state.error = null;
      })
      .addCase(getAttendanceStudents.fulfilled, (state, action) => {
        state.loadingStudents = false;
        state.students = action.payload;
      })
      .addCase(getAttendanceStudents.rejected, (state, action) => {
        state.loadingStudents = false;
        state.error = action.payload;
      })
      .addCase(getMyAttendance.pending, (state) => {
        state.loadingMyAttendance = true;
      })
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        state.loadingMyAttendance = false;
        state.history = action.payload?.history || [];
        state.summary = action.payload?.summary || {
          present: 0,
          total: 0,
          percentage: 0,
        };
      })
      .addCase(getMyAttendance.rejected, (state, action) => {
        state.loadingMyAttendance = false;
        state.error = action.payload;
      })
      .addCase(getAttendanceOverview.fulfilled, (state, action) => {
        state.overviewRows = action.payload?.rows || [];
        state.overviewTotals = action.payload?.totals || {
          students: 0,
          present: 0,
          classes: 0,
          percentage: 0,
        };
      });
  },
});

export default attendanceSlice.reducer;
