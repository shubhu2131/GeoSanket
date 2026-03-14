require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use("/api/auth",          require("./routes/auth"));
app.use("/api/zones",         require("./routes/zones"));
app.use("/api/projects",      require("./routes/projects"));
app.use("/api/location",      require("./routes/location"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/analytics",     require("./routes/analytics"));
app.use("/api/admin",         require("./routes/admin"));

app.get("/", (req, res) => res.json({ status: "GeoSanket API running ✅" }));

module.exports = app;