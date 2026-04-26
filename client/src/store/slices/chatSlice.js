import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// ✅ FETCH MESSAGES
export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (receiverId, thunkAPI) => {
    try {
      // Backend expects: /api/chat/:receiverId
      const res = await axiosInstance.get(`/chat/${receiverId}`);
      return res.data?.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

// ✅ SEND MESSAGE
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, text }, thunkAPI) => {
    try {
      // Backend expects: /api/chat/send with body { receiverId, text }
      const res = await axiosInstance.post("/chat/send", {
        receiverId,
        text,
      });
      return res.data?.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send message";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    isLoading: false,
  },

  reducers: {
    // 🔥 Socket se aane wale message ko yahan handle karenge
    receiveMessage: (state, action) => {
      const incoming = action.payload;
      if (incoming?._id) {
        const exists = state.messages.some(m => m?._id === incoming._id);
        if (!exists) {
          state.messages.push(incoming);
        }
      }
    },
    clearChat: state => {
      state.messages = [];
    },
  },

  extraReducers: builder => {
    builder
      // Get Messages Cases
      .addCase(getMessages.pending, state => {
        state.isLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(getMessages.rejected, state => {
        state.isLoading = false;
      })

      // Send Message Cases
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!action.payload) return;
        const incoming = action.payload;
        const exists = state.messages.some(m => m?._id === incoming._id);
        if (!exists) {
          state.messages.push(incoming);
        }
      });
  },
});

export const { receiveMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
