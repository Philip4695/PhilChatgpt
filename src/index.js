import dotenv from 'dotenv';
import { bot } from './telegramBot.js';
import { api } from './gpt.js';
import express from 'express';
import http from 'http';

dotenv.config({ path: '../config/settings.env' });

let conversationId;
let lastMsgId;

const helpMessage = `*ChatGPT Bot*🤖
Available commands:
  - /reset: resets the chat
  - /retry: retries the last message sent
  - /help: displays this help message`;

const app = express();
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


const server = http.createServer(app);
server.listen(process.env.PORT || 8080);

let firstMessage = true;

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (firstMessage) {
    firstMessage = false;
  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  }

  if (messageText === '/reset') {
    conversationId = undefined;
    bot.sendMessage(chatId, 'Chat reset.');
    return;
  }

  if (messageText === '/retry') {
    if (!conversationId) {
      bot.sendMessage(chatId, 'No message to retry.');
      return;
    }
    const response = await api.sendMessage(messageText, {
      conversationId: conversationId,
      parentMessageId: lastMsgId
    });
    bot.sendMessage(chatId, response.text);
    return;
  }

  if (messageText === '/help') {
    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
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
