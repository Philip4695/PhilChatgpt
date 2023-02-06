import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config({ path: './config/settings.env' });

const telegram_token = process.env.TELEGRAM_API_KEY;

export const bot = new TelegramBot(telegram_token, { polling: true });
