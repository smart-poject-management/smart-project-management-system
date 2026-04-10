import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = error =>
  error?.response?.data?.message || "Failed to create deadline";

export const createDeadline = createAsyncThunk(
  "deadline/createDeadline",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/deadline/create-deadline/${id}`,
        data
      );

      toast.success(res.data?.message);

      return res.data?.data?.deadline || null;
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(msg);
    }
  }
);

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(createDeadline.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeadline.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item) state.deadlines.push(item);
      })
      .addCase(createDeadline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default deadlineSlice.reducer;
