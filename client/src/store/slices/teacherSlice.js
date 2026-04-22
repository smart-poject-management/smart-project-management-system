import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = error =>
  error?.response?.data?.message || "Something went wrong";

/* ================================
   DASHBOARD
================================ */
export const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

/* ================================
   REQUESTS
================================ */
export const getTeacherRequests = createAsyncThunk(
  "teacher/getRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`
      );
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  "teacher/acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/accept`
      );
      toast.success(res.data?.message);
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "teacher/rejectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/reject`
      );
      toast.success(res.data?.message);
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

/* ================================
   STUDENTS (🔥 MAIN FEATURE)
================================ */
export const getAssignedStudents = createAsyncThunk(
  "teacher/getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/assigned-students");

      // ✅ SAFE NORMALIZATION
      return res?.data?.data?.students || [];
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

/* ================================
   PROJECT ACTIONS
================================ */
export const markComplete = createAsyncThunk(
  "teacher/markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/mark-complete/${projectId}`
      );
      toast.success(res.data?.message);
      return { projectId };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const addFeedback = createAsyncThunk(
  "teacher/addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload
      );
      toast.success(res.data?.message);
      return {
        projectId,
        feedback: res.data?.data?.feedback,
      };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

/* ================================
   FILES
================================ */
export const downloadTeacherFile = createAsyncThunk(
  "teacher/downloadFile",
  async ({ projectId, fileId, fileName }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "download";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Downloaded Successfully");

      return { success: true };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const getTeacherFiles = createAsyncThunk(
  "teacher/getFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/files");
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

/* ================================
   SLICE
================================ */
const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    selectedStudent: null, // 🔥 IMPORTANT
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },

  reducers: {
    // 🔥 SELECT STUDENT (UI FIX)
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
  },

  extraReducers: builder => {
    builder

      /* ======================
         STUDENTS
      ====================== */
      .addCase(getAssignedStudents.pending, state => {
        state.loading = true;
      })
      .addCase(getAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStudents = action.payload;

        // ⭐ AUTO SELECT FIRST STUDENT
        if (action.payload.length > 0) {
          state.selectedStudent = action.payload[0];
        }
      })
      .addCase(getAssignedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ======================
         FEEDBACK
      ====================== */
      .addCase(addFeedback.fulfilled, (state, action) => {
        const { projectId, feedback } = action.payload;

        state.assignedStudents = state.assignedStudents.map(student => {
          if (student.project?._id === projectId) {
            return {
              ...student,
              project: {
                ...student.project,
                feedback: [...(student.project.feedback || []), feedback],
              },
            };
          }
          return student;
        });
      })

      /* ======================
         MARK COMPLETE
      ====================== */
      .addCase(markComplete.fulfilled, (state, action) => {
        const { projectId } = action.payload;

        state.assignedStudents = state.assignedStudents.map(student => {
          if (student.project?._id === projectId) {
            return {
              ...student,
              project: {
                ...student.project,
                status: "completed",
              },
            };
          }
          return student;
        });
      })

      /* ======================
         DASHBOARD
      ====================== */
      .addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload?.data?.dashboardStats;
      })

      /* ======================
         REQUESTS
      ====================== */
      .addCase(getTeacherRequests.fulfilled, (state, action) => {
        state.list = action.payload?.data?.requests || [];
      })

      .addCase(acceptRequest.fulfilled, (state, action) => {
        const updated = action.payload?.data?.request;

        state.list = state.list.map(r => (r._id === updated._id ? updated : r));
      })

      .addCase(rejectRequest.fulfilled, (state, action) => {
        const rejected = action.payload?.data?.request;

        state.list = state.list.filter(r => r._id !== rejected._id);
      })

      /* ======================
         FILES
      ====================== */
      .addCase(getTeacherFiles.fulfilled, (state, action) => {
        state.files = action.payload?.data?.files || [];
      });
  },
});

export const { setSelectedStudent } = teacherSlice.actions;

export default teacherSlice.reducer;
