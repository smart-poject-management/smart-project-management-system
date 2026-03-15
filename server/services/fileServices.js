import fs from "fs";
import ErrorHandler from "../middlewares/error.js";
export const streamDownload = (fileUrl, res, originalName) => {
  try {
    if (fs.existsSync(fileUrl)) {
      throw new ErrorHandler("File not found", 404);
    }
    res.download(fileUrl, originalName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        throw new ErrorHandler("Error downloading file", 500);
      }
    });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
