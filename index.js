const TelegramBot = require('node-telegram-bot-api');
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const receptions = require("./routes/reception.routes");
const masters = require("./routes/master.routes");
const services = require("./routes/service.routes");
const corsMiddleware = require("./middleware/cors.middleware");

const token = config.get("telegramBotToken");
const webAppUrl = config.get("webAppUrl");

const app = express();
const bot = new TelegramBot(token, {polling: true});
const PORT = config.get("serverPort");

app.use(corsMiddleware);
app.use(express.json());

app.use("/api/", receptions);
app.use("/api/", masters);
app.use("/api/", services);

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
