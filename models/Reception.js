const { Schema, model } = require("mongoose");

const Reception = new Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  masterId: { type: Schema.Types.ObjectId, ref: "Master" },
  services: { type: [Schema.Types.ObjectId], ref: "Service" },
});

module.exports = model("Reception", Reception);
