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

export const getAttendanceDayRecords = createAsyncThunk(
  "attendance/getDayRecords",
  async (filters = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append("date", filters.date);
      if (filters.department) params.append("department", filters.department);
      if (filters.session) params.append("session", filters.session);
      if (filters.semester) params.append("semester", filters.semester);
      const query = params.toString();

      const res = await axiosInstance.get(
        `/attendance/day-records${query ? `?${query}` : ""}`,
      );
      return res.data?.data?.records || [];
    } catch (error) {
      const msg = getErrorMessage(error);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const getOcAssignments = createAsyncThunk(
  "attendance/getOcAssignments",
  async (department = "", thunkAPI) => {
    try {
      const query = department ? `?department=${department}` : "";
      const res = await axiosInstance.get(`/attendance/oc-assignments${query}`);
      return res.data?.data?.assignments || [];
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const assignOc = createAsyncThunk(
  "attendance/assignOc",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/attendance/oc-assignments", payload);
      toast.success(res.data?.message || "OC assigned");
      return res.data?.data?.teacher;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const getTeacherAttendanceAccess = createAsyncThunk(
  "attendance/getTeacherAttendanceAccess",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/attendance/teacher-access");
      return (
        res.data?.data || {
          hasAccess: false,
          scopedDepartment: null,
          scopedSemester: null,
          assignments: [],
        }
      );
    } catch (error) {
      const msg = getErrorMessage(error);
      return thunkAPI.rejectWithValue(msg);
    }
  },
);

export const getMyOcAssignments = createAsyncThunk(
  "attendance/getMyOcAssignments",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/attendance/my-oc-assignments");
      return res.data?.data?.assignments || [];
    } catch (error) {
      const msg = getErrorMessage(error);
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
    dayRecords: [],
    ocAssignments: [],
    teacherOcAssignments: [],
    teacherAttendanceAccess: {
      hasAccess: false,
      scopedDepartment: null,
      scopedSemester: null,
      assignments: [],
    },
    loadingStudents: false,
    loadingMyAttendance: false,
    loadingOcAssignments: false,
    loadingTeacherAccess: false,
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
      .addCase(getAttendanceDayRecords.fulfilled, (state, action) => {
        state.dayRecords = action.payload || [];
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
      })
      .addCase(getOcAssignments.pending, (state) => {
        state.loadingOcAssignments = true;
      })
      .addCase(getOcAssignments.fulfilled, (state, action) => {
        state.loadingOcAssignments = false;
        state.ocAssignments = action.payload || [];
      })
      .addCase(getOcAssignments.rejected, (state, action) => {
        state.loadingOcAssignments = false;
        state.error = action.payload;
      })
      .addCase(getTeacherAttendanceAccess.pending, (state) => {
        state.loadingTeacherAccess = true;
      })
      .addCase(getTeacherAttendanceAccess.fulfilled, (state, action) => {
        state.loadingTeacherAccess = false;
        state.teacherAttendanceAccess = action.payload || {
          hasAccess: false,
          scopedDepartment: null,
          scopedSemester: null,
          assignments: [],
        };
      })
      .addCase(getTeacherAttendanceAccess.rejected, (state, action) => {
        state.loadingTeacherAccess = false;
        state.error = action.payload;
      })
      .addCase(getMyOcAssignments.fulfilled, (state, action) => {
        state.teacherOcAssignments = action.payload || [];
      });
  },
});

export default attendanceSlice.reducer;
