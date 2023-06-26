const { Schema, model } = require("mongoose");

const Client = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  comment: { type: String },
  reminder: { type: String },
});

module.exports = model("Client", Client);
