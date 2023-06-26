const { Schema, model } = require("mongoose");

const Master = new Schema({
  name: { type: String, required: true },
  photo: { type: String },
});

module.exports = model("Master", Master);
