import { OpenAI } from 'openai';
import { OPENAI_KEY } from '@/config';

export const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

export const responseCleaner = (response: string) => {
  return response
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/_/g, '') // Remove underscores
    .replace(/`/g, '') // Remove code blocks
    .replace(/#{1,6}\s/g, '') // Remove headers
    .trim(); // Remove extra whitespace
};
