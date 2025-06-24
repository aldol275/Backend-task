const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: [true, "Course ID is required"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Course name is required"],
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);
