const mongoose = require('mongoose');

const shapeSchema = new mongoose.Schema({
  type: String,
  startX: Number,
  startY: Number,
  endX: Number,
  endY: Number
});

module.exports = mongoose.model('Shape', shapeSchema);