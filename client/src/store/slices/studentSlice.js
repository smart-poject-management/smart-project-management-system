import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/project-proposal", data);
      toast.success("Project proposal submitted successfully");
      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit project proposal"
      );
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/project");
      return res.data.data?.project || null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/supervisor");
      return res.data.data?.supervisor || null;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch supervisor"
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchAllSupervisor = createAsyncThunk(
  "student/fetchAllSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors");
      return res.data.data?.supervisors || [];
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch available supervisors"
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/request-supervisor", {
        teacherId: data.teacherId,
        message: data.message,
      });
      toast.success("Supervisor request sent successfully");
      thunkAPI.dispatch(getSupervisor());
      return res.data.data?.supervisor || null;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to request supervisor"
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const uploadFiles = createAsyncThunk(
  "student/uploadFiles",
  async ({ projectId, files }, thunkAPI) => {
    try {
      const form = new FormData();
      for (const file of files) form.append("files", file);
      const res = await axiosInstance.post(
        `/student/upload/${projectId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message || "Files uploaded successfully");
      return res.data.data?.project || res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload files");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "student/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-dashboard-stats");
      return res.data.data || res.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch dashboard stats"
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getFeedback = createAsyncThunk(
  "student/getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/student/feedback/${projectId}`);
      return res.data.data?.feedback || res.data.data || res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch feedback");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const downloadFile = createAsyncThunk(
  "student/downloadFile",
  async ({ projectId, fileId, fileName }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, fileId };

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);
const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(submitProjectProposal.fulfilled, (state, action) => {
        state.project = action.payload || null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.project = action.payload || null;
        state.files = action.payload?.files || [];
      })
      .addCase(getSupervisor.fulfilled, (state, action) => {
        state.supervisor = action.payload || null;
      })
      .addCase(fetchAllSupervisor.fulfilled, (state, action) => {
        state.supervisors = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        const newFiles =
          action.payload?.project?.files || action.payload?.files || [];
        state.files = Array.isArray(newFiles) ? newFiles : [];
      })
      .addCase(getFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload || [];
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload || [];
      });
  },
});

export default studentSlice.reducer;