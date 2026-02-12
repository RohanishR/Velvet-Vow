module.exports = (req, res, next) => {
  const { eventName, members, date, contact, city, catering, type } = req.body;

  if (!eventName || !members || !date || !contact || !city || !catering || !type) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (members <= 0) {
    return res.status(400).json({ message: "Members must be greater than 0" });
  }

  next();
};
