import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = error =>
  error?.response?.data?.message || "Something went wrong";

export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/project-proposal", data);
      toast.success(res.data?.message);
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/project");
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/supervisor");
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchAllSupervisor = createAsyncThunk(
  "student/fetchAllSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors");
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
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

      toast.success(res.data?.message);

      thunkAPI.dispatch(getSupervisor());
      thunkAPI.dispatch(fetchAllSupervisor());

      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const requestAdminSupervisor = createAsyncThunk(
  "student/requestAdminSupervisor",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        "/student/request-admin-supervisor",
        {
          message: data.message,
        }
      );

      toast.success(res.data?.message || "Request sent to admin");

      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);


export const submitDeadlineExtensionRequest = createAsyncThunk(
  "student/submitDeadlineExtensionRequest",
  async (formData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        "/student/deadline-extension-request",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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

export const getDeadlineExtensionRequest = createAsyncThunk(
  "student/getDeadlineExtensionRequest",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "/student/get-deadline-extension-request"
      );
      return res.data?.request || res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
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

      toast.success(res.data?.message);
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
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

export const deleteProjectFile = createAsyncThunk(
  "student/deleteProjectFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/student/file/${projectId}/${fileId}`
      );

      toast.success(res.data?.message);
      return { ...res.data, fileId };
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "student/fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-dashboard-stats");
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const getFeedback = createAsyncThunk(
  "student/getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/student/feedback/${projectId}`);
      return res.data;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const getMyFees = createAsyncThunk(
  "student/getMyFees",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/my-fees");
      return res.data?.data?.fees || [];
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const payFees = createAsyncThunk(
  "student/payFees",
  async ({ semester, amount }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/pay-fees", { semester, amount });
      toast.success(res.data?.message || "Fee paid successfully");
      return res.data?.data?.fee;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    pendingSupervisorRequestIds: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    fees: [],
    status: null,

    // ✅ NEW
    adminRequestSent: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder

      .addCase(submitProjectProposal.fulfilled, (state, action) => {
        state.project = action.payload?.data?.project || null;
      })

      .addCase(fetchProject.fulfilled, (state, action) => {
        const project = action.payload?.data?.project || null;
        state.project = project;
        state.files = project?.files || [];
      })

      .addCase(getSupervisor.fulfilled, (state, action) => {
        state.supervisor = action.payload?.data?.supervisor || null;
      })

      .addCase(fetchAllSupervisor.fulfilled, (state, action) => {
        const data = action.payload?.data || {};
        state.supervisors = data.supervisors || [];
        state.pendingSupervisorRequestIds =
          data.pendingSupervisorRequestIds || [];
      })

      .addCase(requestAdminSupervisor.fulfilled, state => {
        state.adminRequestSent = true;
      })

      .addCase(uploadFiles.fulfilled, (state, action) => {
        const files =
          action.payload?.data?.project?.files ||
          action.payload?.data?.files ||
          [];
        state.files = files;
      })

      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload?.data || {};
      })

      .addCase(getFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload?.data?.feedback || [];
      })
      .addCase(getMyFees.fulfilled, (state, action) => {
        state.fees = action.payload || [];
      })
      .addCase(payFees.fulfilled, (state, action) => {
        const updatedFee = action.payload;
        if (!updatedFee) return;

        state.fees = state.fees.map((fee) =>
          fee.semester === updatedFee.semester ? updatedFee : fee
        );
      })

      .addCase(deleteProjectFile.fulfilled, (state, action) => {
        const deletedId = action.payload?.fileId;

        if (deletedId) {
          state.files = state.files.filter(f => f._id !== deletedId);
        }

        if (action.payload?.data?.project) {
          state.project = action.payload.data.project;
          state.files = action.payload.data.project.files || [];
        }
      });
  },
});

export default studentSlice.reducer;
