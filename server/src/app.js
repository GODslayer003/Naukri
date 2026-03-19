const express = require("express");
const cors = require("cors");

const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const companyRoutes = require("./routes/company.routes");
const jobRoutes = require("./routes/job.routes");
const qrRoutes = require("./routes/qr.routes");
const crmRoutes = require("./routes/crm.routes");
const crmPanelRoutes = require("./routes/crm-panel.routes");
const leadGeneratorRoutes = require("./routes/lead-generator.routes");
const landingRoute = require("./routes/landing.routes");
const adminRoutes = require("./routes/admin.routes");
const candidateRoutes = require("./routes/candidate.routes");

const app = express();

// Basic Middlewares
app.use(cors());
app.use(express.json());

// -----------------------------
// API Versioning
// -----------------------------
const API_VERSION = process.env.APP_VERSION || "1";

// Example: /api/v1/auth
const BASE_ROUTE = `/api/v${API_VERSION}`;

// Routes
app.use(`${BASE_ROUTE}/auth`, authRoutes);
app.use(`${BASE_ROUTE}/company`, companyRoutes);
app.use(`${BASE_ROUTE}/job`, jobRoutes);
app.use(`${BASE_ROUTE}/qr`, qrRoutes);
app.use(`${BASE_ROUTE}/crm`, crmRoutes);
app.use(`${BASE_ROUTE}/crm-panel`, crmPanelRoutes);
app.use(`${BASE_ROUTE}/lead-generator`, leadGeneratorRoutes);
app.use(`${BASE_ROUTE}/landing`, landingRoute);
app.use(`${BASE_ROUTE}/admin`, adminRoutes);
app.use(`${BASE_ROUTE}/candidate`, candidateRoutes);

// Health Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `${process.env.APP_NAME} API Running`,
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  });
});

// Error Handler (must be last)
app.use(errorMiddleware);

module.exports = app;
