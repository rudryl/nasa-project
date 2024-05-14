const express = require("express");
const {
  httpGetAllLaunches,
  httpCreateLaunch,
  httpAbortLaunch
} = require("./launchController");
const launchesRouter = express.Router();

launchesRouter.get("/launches", httpGetAllLaunches);
launchesRouter.post("/launches", httpCreateLaunch);
launchesRouter.delete("/launches/:id", httpAbortLaunch);

module.exports = launchesRouter;
