import dotenv from 'dotenv';
import { bot } from './telegramBot.js';
import { api } from './gpt.js';
import express from 'express';
import http from 'http';
import _ from 'lodash';

dotenv.config({ path: './config/settings.env' });

let conversationId;
let lastMsgId;
let lastMsgTxt;

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
server.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening on port ${process.env.PORT || 8080}`);
});

let firstMessage = true;

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (firstMessage) {
    firstMessage = false;
    bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  }

  switch (messageText) {
    case '/reset': {
      conversationId = undefined;
      lastMsgId = undefined;
      bot.sendMessage(chatId, 'Chat reset.');
      break;
    }
    case '/retry': {
      if (!conversationId) {
        bot.sendMessage(chatId, 'No message to retry.');
        break;
      }
      const response = await api.sendMessage(lastMsgTxt, {
        conversationId: conversationId,
        parentMessageId: lastMsgId
      });
      bot.sendMessage(chatId, response.text, {parse_mode: "Markdown"});
      break;
    }
    case '/help': {
      bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
      break;
    }
    default: {
      let response;
      let sentMsgId;

      bot.sendMessage(chatId, ". . .").then((sentMsg) => {
        sentMsgId = sentMsg.message_id;
      });
      
      if (conversationId) {
        response = await api.sendMessage(messageText, {
          onProgress: _.throttle(() => bot.sendChatAction(chatId, "typing"), 4000),
          conversationId: conversationId,
          parentMessageId: lastMsgId
        });
        lastMsgId = response.id;

      } else {
        
        response = await api.sendMessage(messageText, { 
          onProgress: _.throttle(() => bot.sendChatAction(chatId, "typing"), 4000),
        });
        conversationId = response.conversationId;
        lastMsgId = response.id;
      }
      lastMsgTxt = messageText;
      bot.editMessageText(response.text, { chat_id: chatId, message_id: sentMsgId, parse_mode: "Markdown" });
      break;
    }
  }
});