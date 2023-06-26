const { Schema, model } = require("mongoose");

const Service = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  category: { type: String, required: true },
  time: { type: String, required: true },
});

module.exports = model("Service", Service);
