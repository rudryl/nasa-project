const {
  getAllLaunches,
  abortLaunchById,
  scheduleLaunch
} = require("../../models/launchModel");

const getPagination = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpCreateLaunch(req, res) {
  let launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "one of the input is missing"
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "invalid launch date"
    });
  }
  await scheduleLaunch(launch);
  launch.upcoming = true;
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = +req.params.id;
  let aborted = await abortLaunchById(launchId);

  if (aborted) {
    return res.status(200).json({ ok: true });
  } else {
    return res.status(404).json({
      error: " launch to be deleted not found or has already been updated"
    });
  }
}
module.exports = {
  httpGetAllLaunches,
  httpCreateLaunch,
  httpAbortLaunch
};
