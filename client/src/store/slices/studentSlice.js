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
      return res.data.data?.project;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/supervisor");
      return res.data.data?.supervisor;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch supervisor"
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchAllSupervisor = createAsyncThunk(
  "student/fetchAllSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors");

      return res.data.data?.supervisor;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch available supervisor"
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/request-supervisor")
      thunkAPI.dispatch(getSupervisor());
      return res.data.data?.supervisor;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to request supervisor"
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
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
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(res.data.message || "Files uploaded successfully");
      return res.data.data.project || res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to upload files");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "fetchDashboardStats", // fixin the spealing  ""fetchDsahboardStats" and check
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "/student/fetch-dashboard-stats")
      return res.data.data || res.data
    } catch (error) {
      toast.error(error?.response?.data?.message || "failed to fetch student dashboard Stats ");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getFeedback = createAsyncThunk(
  "getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/student/feedback/${projectId}`)
      return res.data.data?.feedback || res.data.data || res.data
    } catch (error) {
      toast.error(error?.response?.data?.message || "failed to feedback ");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const downloadFile = createAsyncThunk(
  "downloadfile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
        { responseType: "blob" }
      )
      return { blob: res.data, projectId, fileId }
    } catch (error) {
      toast.error(error?.response?.data?.message || "failed to download file ");
      return thunkAPI.rejectWithValue(error.response.data.message);
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
        state.project = action.payload?.project || action.payload || null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.project = action.payload?.project || action.payload || null;
      })
      .addCase(getSupervisor.fulfilled, (state, action) => {
        state.supervisor = action.payload?.supervisor || action.payload || null;
      })
      .addCase(fetchAllSupervisor.fulfilled, (state, action) => {
        state.supervisors = action.payload?.supervisor || action.payload || [];
      })

      .addCase(uploadFiles.fulfilled, (state, action) => {
        const newFiles = action.payload?.project?.files || action.payload?.files || [];
        state.files = Array.isArray(newFiles) ? newFiles : [];
      })
      .addCase(getFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload || []
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload || []
      });
  },
});

export default studentSlice.reducer;
