import dotenv from 'dotenv';
import fetch from "node-fetch";
import { ChatGPTAPI } from 'chatgpt';

globalThis.fetch = fetch

dotenv.config({ path: '../config/settings.env' });

const apiKey = process.env.OPENAI_API_KEY;

export const api = new ChatGPTAPI({ apiKey: apiKey });
