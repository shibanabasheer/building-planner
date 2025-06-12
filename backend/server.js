const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Shape = require('./models/Shape');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/building_planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/shapes', async (req, res) => {
  const shapes = await Shape.find();
  res.json(shapes);
});

app.post('/shapes', async (req, res) => {
  const shape = new Shape(req.body);
  await shape.save();
  res.json(shape);
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));