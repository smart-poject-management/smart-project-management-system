import fs from "fs";
import path from "path";
import ErrorHandler from "../middlewares/error.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Streams a file download to the client
 * @param {string} fileUrl - Local path to the file
 * @param {string} originalName - Original filename for the download
 * @param {object} res - Express response object
 */
export const streamDownload = (fileUrl, originalName, res) => {
  return new Promise((resolve, reject) => {
    let absolutePath;
    
    if (path.isAbsolute(fileUrl)) {
      absolutePath = fileUrl;
    } else {
      absolutePath = path.join(__dirname, "../uploads", fileUrl);
    }

    absolutePath = path.normalize(absolutePath);
    const uploadsDir = path.normalize(path.join(__dirname, "../uploads"));
    
    if (!absolutePath.startsWith(uploadsDir)) {
      return reject(new ErrorHandler("Invalid file path", 400));
    }

    if (!fs.existsSync(absolutePath)) {
      return reject(new ErrorHandler("File not found on server", 404));
    }

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
