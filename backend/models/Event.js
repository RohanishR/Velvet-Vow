const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventName: String,
  members: Number,
  date: Date,
  contact: String,
  city: String,
  catering: String,
  type: String,
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
