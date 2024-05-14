const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planets = require("./planetsMongo");

const habitablePlanets = [];

function isHabitable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.38 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanets() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "cumulativeData.csv")
    )
      .pipe(parse({ comment: "#", columns: true })) // pipe and parse are used to transform streamed data from csv to js objects
      .on("data", async data => {
        if (isHabitable(data)) {
          try {
            await planets.updateOne(
              {
                kepler_name: data.kepler_name
              },
              { kepler_name: data.kepler_name },
              { upsert: true }
            );
          } catch (err) {
            console.log("could not create planet collection", err);
          }

          //habitablePlanets.push(data);
        }
      })
      .on("error", error => {
        console.log(error);
        reject(error);
      })
      .on("end", () => {
        console.log("streaming ends");
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}, { __v: 0, _id: 0 });
  //return habitablePlanets;
}

module.exports = { habitablePlanets, loadPlanets, getAllPlanets };
