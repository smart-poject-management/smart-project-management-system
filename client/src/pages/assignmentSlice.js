import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
export const getAssignments = createAsyncThunk(
  "assignment/getAssignments",
  async (studentId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/assignment/${studentId}`);
      return res.data.assignments || [];
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch assignments");
    }
  }
);
export const createAssignment = createAsyncThunk(
  "assignment/createAssignment",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/assignment/create", data);
      toast.success("Assignment created!");
      return res.data.assignment;
    } catch (error) {
      toast.error("Create failed");
      return thunkAPI.rejectWithValue("Failed to create assignment");
    }
  }
);
export const markAsRead = createAsyncThunk(
  "assignment/markAsRead",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/assignment/read/${id}`);
      return res.data.assignment;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to mark as read");
    }
  }
);

export const submitAssignment = createAsyncThunk(
  "assignment/submitAssignment",
  async ({ id, fileUrl }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/assignment/submit/${id}`, {
        fileUrl,
      });
      toast.success("Assignment submitted!");
      return res.data.assignment;
    } catch (error) {
      toast.error("Submit failed");
      return thunkAPI.rejectWithValue("Failed to submit assignment");
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  "assignment/deleteAssignment",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/assignment/delete/${id}`);
      toast.success("Assignment deleted!");
      return id;
    } catch (error) {
      toast.error("Delete failed");
      return thunkAPI.rejectWithValue("Delete failed");
    }
  }
);

const assignmentSlice = createSlice({
  name: "assignment",
  initialState: {
    assignments: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // 🔹 GET
      .addCase(getAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(getAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔹 CREATE
      .addCase(createAssignment.fulfilled, (state, action) => {
        if (action.payload) {
          state.assignments.unshift(action.payload);
        }
      })

      // 🔹 DELETE
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        const id = action.payload;
        state.assignments = state.assignments.filter((a) => a._id !== id);
      })

      // 🔥 COMMON MATCHER (LAST)
      .addMatcher(
        (action) =>
          [
            markAsRead.fulfilled.type,
            submitAssignment.fulfilled.type,
          ].includes(action.type),

        (state, action) => {
          const updated = action.payload;
          if (!updated?._id) return;

          const index = state.assignments.findIndex(
            (a) => a._id === updated._id
          );

          if (index !== -1) {
            state.assignments[index] = {
              ...state.assignments[index],
              ...updated,
            };
          }
        }
      );
  },
});

export default assignmentSlice.reducer;