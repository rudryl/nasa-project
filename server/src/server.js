const http = require("http");
require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

const { loadPlanets } = require("./models/planetModel");
const { loadLaunches } = require("./models/launchModel");

const PORT = 3000;

const MONGO_URL = process.env.MONGO_URL;

let server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("connection opened");
});

mongoose.connection.on("error", err => {
  console.log("something wrong happened with db conncetion", err);
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await loadPlanets();
  await loadLaunches();

  server.listen(PORT, () => {
    console.log("server listening on port ", PORT);
  });
}
startServer();
