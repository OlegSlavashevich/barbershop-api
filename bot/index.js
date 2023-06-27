const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TelegramBotToken;

if (!token) {
  throw new Error('token doent exists');
}

const bot = new TelegramBot(token, {polling: true});

module.exports = bot;