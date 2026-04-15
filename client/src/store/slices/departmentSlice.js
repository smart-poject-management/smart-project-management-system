import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = (error) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  "Something went wrong";
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
      const res = await axiosInstance.get(
        `/department/${departmentId}/expertise`
      );
      return res.data.expertise;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/department/create", data);
      return res.data.department;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createExpertise = createAsyncThunk(
  "department/createExpertise",
  async ({ departmentId, name }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/department/${departmentId}/expertise/create`,
        { name }
      );
      return res.data.expertise;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);


export const deleteExpertise = createAsyncThunk(
  "department/deleteExpertise",
  async ({ departmentId, expertiseId }, thunkAPI) => {
    try {
      await axiosInstance.delete(
        `/department/${departmentId}/expertise/delete/${expertiseId}`
      );
      return expertiseId;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "department/deleteDepartment",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/department/delete/${id}`);
      return id;
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
    clearExpertise: (state) => {
      state.expertise = [];
    },
  },

  extraReducers: (builder) => {
    builder


      .addCase(fetchDepartments.pending, (state) => {
        state.loadingDepartments = true;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loadingDepartments = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loadingDepartments = false;
        state.error = action.payload;
      })


      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments = [action.payload, ...state.departments];
      })

      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter(
          (d) => d._id !== action.payload
        );
      })

      .addCase(fetchExpertiseByDepartment.pending, (state) => {
        state.loadingExpertise = true;
      })
      .addCase(fetchExpertiseByDepartment.fulfilled, (state, action) => {
        state.loadingExpertise = false;
        state.expertise = action.payload;
      })
      .addCase(fetchExpertiseByDepartment.rejected, (state, action) => {
        state.loadingExpertise = false;
        state.error = action.payload;
      })

      .addCase(createExpertise.fulfilled, (state, action) => {
        state.expertise = [action.payload, ...state.expertise];
      })
      .addCase(deleteExpertise.fulfilled, (state, action) => {
        state.expertise = state.expertise.filter(
          (e) => e._id !== action.payload
        );
      });
  },
});

export const { clearExpertise } = departmentSlice.actions;
export default departmentSlice.reducer;