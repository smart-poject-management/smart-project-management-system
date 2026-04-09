import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = error =>
  error?.response?.data?.message || error?.response?.data?.error || "Something went wrong";

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/department");
      return res.data.departments;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchExpertiseByDepartment = createAsyncThunk(
  "department/fetchExpertiseByDepartment",
  async (departmentId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/department/${departmentId}/expertise`);
      return res.data.expertise;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    expertise: [],
    loadingDepartments: false,
    loadingExpertise: false,
    error: null,
  },
  reducers: {
    clearExpertise(state) {
      state.expertise = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDepartments.pending, state => {
        state.loadingDepartments = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loadingDepartments = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loadingDepartments = false;
        state.error = action.payload;
      })
      .addCase(fetchExpertiseByDepartment.pending, state => {
        state.loadingExpertise = true;
        state.error = null;
      })
      .addCase(fetchExpertiseByDepartment.fulfilled, (state, action) => {
        state.loadingExpertise = false;
        state.expertise = action.payload;
      })
      .addCase(fetchExpertiseByDepartment.rejected, (state, action) => {
        state.loadingExpertise = false;
        state.error = action.payload;
      });
  },
});

export const { clearExpertise } = departmentSlice.actions;
export default departmentSlice.reducer;
