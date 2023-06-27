if (process.env.MODE === 'development') {
  require('dotenv').config();
}
const TelegramBot = require('node-telegram-bot-api');
const express = require("express");
const mongoose = require("mongoose");
const receptions = require("./routes/reception.routes");
const masters = require("./routes/master.routes");
const services = require("./routes/service.routes");
const corsMiddleware = require("./middleware/cors.middleware");

const token = process.env.TelegramBotToken;
const webAppUrl = process.env.WebAppUrl;
const dbUrl = process.env.DBUrl

if (!token) {
  throw new Error('token doent exists');
}

if (!webAppUrl) {
  throw new Error('webAppUrl doent exists');
}

if (!dbUrl) {
  throw new Error('dbUrl doent exists');
}

const app = express();
const bot = new TelegramBot(token, {polling: true});
const PORT = process.env.PORT || 4000;

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/", receptions);
app.use("/api/", masters);
app.use("/api/", services);

app.get("/", (req, res) => {
  res.send("Main page!");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start') {
      await bot.sendMessage(chatId, 'Заходи в наше приложение для заказа', {
          reply_markup: {
              inline_keyboard: [
                  [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
              ]
          }
      })
  }
});

const start = async () => {
  try {
    mongoose.connect(process.env.DBUrl, {
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

module.exports = app