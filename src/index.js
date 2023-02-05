import dotenv from 'dotenv';
import { bot } from './telegramBot.js';
import { api } from './gpt.js';
import express from 'express';
import http from 'http';

dotenv.config({ path: '../config/settings.env' });

let conversationId;
let lastMsgId;

const app = express();
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = http.createServer(app);
server.listen(process.env.PORT || 8080);

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/reset') {
    conversationId = undefined;
    bot.sendMessage(chatId, 'Chat reset.');
    return;
  }

  let response;
 
  if (conversationId) {
    response = await api.sendMessage(messageText, {
      conversationId: conversationId,
      parentMessageId: lastMsgId
    });
    lastMsgId = response.id;
  } else {
    response = await api.sendMessage(messageText);
    conversationId = response.conversationId;
    lastMsgId = response.id;
  }

  bot.sendMessage(chatId, response.text);
});