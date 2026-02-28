class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ error: message });
  if (err.code === 11000) {
    res.status(400).json({ error: "Duplicate key error" });
  }
  if (err.name === "jsonWebTokenError") {
    res.status(401).json({ error: "Invalid token" });
  } 
     if (err.name === "TokenExpiredError") {
    res.status(401).json({ error: "Token expired" });
  }
  if (err.name === "CastError") {
    res.status(400).json({ error: "Invalid ID format" });
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((val) => val.message)
        .join(", ")
    : "Internal Server Error";
  res.status(statusCode).json({ error: errorMessage });
};

export default ErrorHandler;