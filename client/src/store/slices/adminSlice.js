import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

/* =============================
   STUDENT API CALLS
============================= */

export const createStudent = createAsyncThunk(
  "createStudent",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-student", data);
      toast.success(res.data.message || "Student created successfully");
      return res.data.data.user;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create student";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateStudent = createAsyncThunk(
  "updateStudent",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-student/${id}`, data);
      toast.success(res.data.message || "Student updated successfully");
      return res.data.data.user;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update student";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "deleteStudent",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/admin/delete-student/${id}`);
      toast.success("Student deleted successfully");
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete student";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createTeacher = createAsyncThunk(
  "createTeacher",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-teacher", data);
      toast.success(res.data.message || "Teacher created successfully");
      return res.data.data.user;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to create teacher";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "updateTeacher",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);
      toast.success(res.data.message || "Teacher updated successfully");
      return res.data.data.user;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update teacher";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "deleteTeacher",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/admin/delete-teacher/${id}`);
      toast.success("Teacher deleted successfully");
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete teacher";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/users");
      return res.data.data.users;
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to fetch users";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",

  initialState: {
    users: [],
    projects: [],
    stats: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(getAllUsers.pending, state => {
        state.loading = true;
      })

      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })

      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createStudent.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })

      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          user => user._id === action.payload._id
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })

      .addCase(createTeacher.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })

      .addCase(updateTeacher.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          user => user._id === action.payload._id
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
