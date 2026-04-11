import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getNotifications = createAsyncThunk(
  "notification/getNotifications",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/notification");

      return {
        list: res.data?.data || [],
        unreadCount: res.data?.unreadCount || 0,
      };
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to fetch notifications";
      toast.error(msg);
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.put(`/notification/${id}/read`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Error"
      );
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.put(`/notification/read-all`);
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Error"
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/notification/${id}/delete`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Error"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: builder => {
    builder.addCase(getNotifications.pending, state => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload.list;
      state.unreadCount = action.payload.unreadCount;
    });

    builder.addCase(getNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.list.find(n => n._id === action.payload);

      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllAsRead.fulfilled, state => {
      state.list = state.list.map(n => ({
        ...n,
        isRead: true,
      }));
      state.unreadCount = 0;
    });

    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const removed = state.list.find(n => n._id === action.payload);

      state.list = state.list.filter(n => n._id !== action.payload);

      if (removed && !removed.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
  },
});

export default notificationSlice.reducer;
