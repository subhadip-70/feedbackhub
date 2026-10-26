
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected Successfully"))
  .catch((err) => console.log("MongoDB Error:", err));

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  courseId: {
    type: String,
    unique: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  courseDuration: {
    type: String,
    default: "3 Months",
  },
  feedbackComments: {
    type: String,
    required: true,
  },
  feedbackRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// GET: Fetch All Feedback
app.get("/api/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ _id: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Add Feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { courseName, feedbackComments, feedbackRating } = req.body;

    const feedback = new Feedback({
      courseId: "C" + Date.now(),
      courseName,
      courseDuration: "3 Months",
      feedbackComments,
      feedbackRating,
    });

    const savedFeedback = await feedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Update Feedback
app.put("/api/feedback/:id", async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Delete Feedback
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
