import dotenv from 'dotenv';
import { ChatGPTAPI } from 'chatgpt';

dotenv.config({ path: '../config/settings.env' });

const apiKey = process.env.OPENAI_API_KEY;

console.log(apiKey);

export const api = new ChatGPTAPI({ apiKey: apiKey });
