const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const receptions = require("./routes/reception.routes");
const masters = require("./routes/master.routes");
const services = require("./routes/service.routes");
const corsMiddleware = require("./middleware/cors.middleware");

const app = express();
const PORT = config.get("serverPort");

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/", receptions);
app.use("/api/", masters);
app.use("/api/", services);

const start = async () => {
  try {
    mongoose.connect(config.get("dbUrl"), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    app.listen(PORT, () => {
      console.log("Server started on port", PORT);
    });
  } catch (e) {
    console.log("Error! ", e);
  }
};

start();
