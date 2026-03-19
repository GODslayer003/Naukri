const errorMiddleware = (err, req, res, next) => {
  console.error(err);

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

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
