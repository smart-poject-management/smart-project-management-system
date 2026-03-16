import fs from "fs";
import ErrorHandler from "../middlewares/error.js";

export const streamDownload = (fileUrl, res, originalName) => {
  try {
    if (!fs.existsSync(fileUrl)) {
      throw new ErrorHandler("File not found", 404);
    }

    res.download(fileUrl, originalName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);

        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error downloading file",
          });
        }
      }
    });

  } catch (error) {
    if (!res.headersSent) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
};
