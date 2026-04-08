import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const getErrorMessage = error =>
  error?.response?.data?.message || "Failed to download file";

export const downloadProjectFile = createAsyncThunk(
  "project/downloadProjectFile",
  async ({ projectId, fileId, name }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/project/${projectId}/files/${fileId}/download`,
        { responseType: "blob" }
      );

      const fileName = name || "download";

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded Successfully`);

      return { success: true, fileId, projectId };
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    selected: null,
  },
  reducers: {},
  extraReducers: builder => {},
});

export default projectSlice.reducer;
