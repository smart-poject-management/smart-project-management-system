import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = error =>
  error?.response?.data?.message || "Something went wrong";

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

export const getAssignedStudents = createAsyncThunk(
  "teacher/getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/assigned-students");
      return res?.data?.data?.students || [];
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

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

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    selectedStudent: null,
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
    messages: [],
  },

  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getAssignedStudents.pending, state => {
        state.loading = true;
      })
      .addCase(getAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStudents = action.payload;
      })
      .addCase(getAssignedStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
        if (state.selectedStudent?.project?._id === projectId) {
          state.selectedStudent = {
            ...state.selectedStudent,
            project: {
              ...state.selectedStudent.project,
              feedback: [...(state.selectedStudent.project.feedback || []), feedback],
            },
          };
        }
      })
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
        if (state.selectedStudent?.project?._id === projectId) {
          state.selectedStudent = {
            ...state.selectedStudent,
            project: {
              ...state.selectedStudent.project,
              status: "completed",
            },
          };
        }
      })
      .addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload?.data?.dashboardStats;
      })
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
      .addCase(getTeacherFiles.fulfilled, (state, action) => {
        state.files = action.payload?.data?.files || [];
      });
  },
});

export const { setSelectedStudent } = teacherSlice.actions;

export default teacherSlice.reducer;