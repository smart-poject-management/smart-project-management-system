
import fs from "fs";
import path from "path";
import ErrorHandler from "../middlewares/error.js";

/**
 * Streams a file download to the client
 * @param {string} fileUrl - Local path to the file
 * @param {string} originalName - Original filename for the download
 * @param {object} res - Express response object
 */
export const streamDownload = (fileUrl, originalName, res) => {
  return new Promise((resolve, reject) => {

    if (!fs.existsSync(fileUrl)) {
      return reject(new ErrorHandler("File not found on server", 404));
    }

    const absolutePath = path.resolve(fileUrl);


    res.setHeader("Content-Disposition", `attachment; filename="${originalName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    const fileStream = fs.createReadStream(absolutePath);

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      reject(new ErrorHandler("Error reading file", 500));
    });

    fileStream.on("end", () => resolve());

    fileStream.pipe(res);
  });
};