const mongoose = require("mongoose");

const launchSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true
  },
  launchDate: {
    type: Date,
    required: true
  },
  mission: {
    type: String,
    required: true
  },
  rocket: {
    type: String,
    required: true
  },
  target: {
    type: String
  },
  customer: [String],
  upcoming: {
    type: Boolean,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  }
});

// this line just created a collection in MongDb called launches.
//That collection is going to have many launch object stored inside
// MongoDb calls each launch stored the collectino a document.

module.exports = mongoose.model("Launch", launchSchema);
