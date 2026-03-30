const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const validateEvent = require("../middleware/validateEvent");

// CREATE
router.post("/create", validateEvent, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json({ message: "Event Created Successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL
router.get("/", async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event Deleted Successfully" });
});

// UPDATE
router.put("/:id", async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Event Updated Successfully" });
});

module.exports = router;
