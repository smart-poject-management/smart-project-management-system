import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api/chat";

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async ({ senderId, receiverId }) => {
    const res = await axios.get(
      `${API}/${senderId}/${receiverId}`,
      { withCredentials: true }
    );
    return res.data.data;
  }
);
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ sender, receiver, text }) => {
    const res = await axios.post(
      `${API}/send`,
      { sender, receiver, text },
      { withCredentials: true }
    );
    return res.data.data;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
  },

  reducers: {
    receiveMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    clearChat: (state) => {
      state.messages = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { receiveMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;