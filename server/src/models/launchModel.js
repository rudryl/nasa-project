const axios = require("axios");

const launchCollection = require("./launchesMongo");
const planets = require("./planetsMongo");

let updatedFlightNumber = 100;

async function getAllLaunches(skip, limit) {
  return await launchCollection
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: "-1" })
    .skip(skip)
    .limit(limit);
}
const spaceX_apiurl = "https://api.spacexdata.com/v4/launches/query";

async function loadLaunches() {
  //findOne: retrieve data coresponding to the filter
  let launch = await launchCollection.findOne({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  });
  if (launch) {
    console.log("SpacX launch already exist in DB");
    return;
  }
  const response = await axios.post(spaceX_apiurl, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          }
        },
        {
          path: "payloads",
          select: {
            customers: 1
          }
        }
      ]
    }
  });
  for (const launchDocs of response.data.docs) {
    const payloads = launchDocs["payloads"];
    const customers = payloads.flatMap(payload => {
      return payload["customers"];
    });
    // console.log("<><", launchDocs["flightNumber"]);
    //console.log("<><", launchDocs);
    let item = {
      flightNumber: launchDocs["flight_number"],
      mission: launchDocs["name"],
      rocket: launchDocs["rocket"]["name"],
      launchDate: launchDocs["date_local"],
      upcoming: launchDocs["upcoming"],
      success: launchDocs["success"],
      customer: customers
    };
    // findOneAndUpdate: find and update or create data
    await launchCollection.findOneAndUpdate(
      { flightNumber: item.flightNumber },
      item,
      {
        upsert: true
      }
    );
  }
}

async function saveLaunchToDb(launch) {
  let planet = await planets.findOne({ kepler_name: launch.target });

  if (!planet) {
    throw new Error("Planet not found in planets collection");
  }
  await launchCollection.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true
    }
  );
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchCollection.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return updatedFlightNumber;
  }
  return latestLaunch.flightNumber;
}

async function scheduleLaunch(launch) {
  let launchScheduled = Object.assign(launch, {
    flightNumber: (await getLatestFlightNumber()) + 1,
    customer: ["ZTM", "NASA"],
    upcoming: true,
    success: true
  });

  await saveLaunchToDb(launchScheduled);
}

async function abortLaunchById(id) {
  let aborted = await launchCollection.findOne({ flightNumber: id });
  if (!aborted) {
    return undefined;
  } else {
    let result = await launchCollection.updateOne(
      { flightNumber: id },
      { upcoming: false, success: false }
    );
    return result.matchedCount === 1 && result.modifiedCount === 1;
  }
}

module.exports = {
  getAllLaunches,
  abortLaunchById,
  scheduleLaunch,
  loadLaunches
};
