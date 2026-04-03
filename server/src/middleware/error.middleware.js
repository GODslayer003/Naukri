const errorMiddleware = (err, req, res, next) => {
  if (err?.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size exceeds the 8MB upload limit",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: err.message || "Invalid file upload request",
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const safeMessage = err.message || "Internal Server Error";

  // Keep logs production-friendly: full stack for server faults, concise logs for expected client/auth errors.
  if (statusCode >= 500) {
    console.error(err);
  } else {
    console.warn(`[${req.method} ${req.originalUrl}] ${statusCode} ${safeMessage}`);
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    stack: process.env.NODE_ENV === "development" && statusCode >= 500 ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
