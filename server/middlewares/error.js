class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  console.error("Error Middleware Caught:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose/JWT specific errors
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate key error";
  }
  if (err.name === "jsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }
  if (err.errors) {
    message = Object.values(err.errors).map((val) => val.message).join(", ");
    statusCode = 400;
  }

  // Final single response
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default ErrorHandler;