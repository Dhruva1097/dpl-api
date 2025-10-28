"use strict";

require("dotenv").config();
const express = require("express");
const compression = require("compression");
const multer = require("multer");
const { performance } = require("perf_hooks");

const db = require("./models");
const router = require("./routes");
const services = require("./services");
const {
  group_filling,
  level_filling_update,
} = require("./controllers/contests");

// -------------------------
// Memory-only logger (no deps)
// -------------------------
function perRequestMem(req, res, next) {
  const start = process.memoryUsage();
  const t0 = performance.now();
  res.on("finish", () => {
    const end = process.memoryUsage();
    const rssDeltaMB = ((end.rss - start.rss) / 1048576).toFixed(2);
    console.log(`${req.method} ${req.originalUrl || req.url} (${rssDeltaMB})`);
  });
  next();
}

const app = express();
app.disable("x-powered-by");
app.use(perRequestMem);
app.use(compression());

// CORS (simple, permissive)
app.use((req, res, next) => {
  res.header({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  });
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
    limit: 10000,
    parameterLimit: 2,
  })
);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 2 } });

app.use(upload.any());
app.get("/", (req, res) => res.send("DPL11 Backend"));
app.use("/", router);

db.sequelize
  .sync()
  .then(() => {
    app.listen(process.env.NODE_ENV_PORT || 3000, () => {
      console.log(`DPL11 API Running Successfully`);
    });
  })
  .catch((err) => console.log(err.message));
