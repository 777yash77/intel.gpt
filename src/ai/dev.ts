'use server';
import { config } from 'dotenv';
config();

import './flows/summarize-legal-article.ts';
import './flows/legal-ai-chatbot.ts';
import './flows/generate-legal-precedents.ts';
