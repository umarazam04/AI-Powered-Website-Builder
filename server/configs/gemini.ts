import { GoogleGenAI } from '@google/genai';
import dns from 'node:dns';

// Prioritize IPv4 to resolve Google API connection timeouts
dns.setDefaultResultOrder('ipv4first');

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Add it to your server .env file.');
  }

  return new GoogleGenAI({ apiKey });
};

const ai = getGeminiClient();

export default ai;

export const getAiModel = () => process.env.GEMINI_MODEL || DEFAULT_MODEL;

export const cleanHtmlCode = (code: string) =>
  code
    .replace(/^\s*```[a-z0-9_-]*\s*/i, '')
    .replace(/```\s*$/g, '')
    .trim();

/**
 * Helper to delay execution for retry logic
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a chat completion with Gemini API, with retry logic for transient failures.
 */
export const createChatCompletionText = async (messages: ChatMessage[]): Promise<string> => {
  const systemInstruction = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n');

  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await getGeminiClient().models.generateContent({
        model: getAiModel(),
        contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: 0.7,
          maxOutputTokens: 65000,
        },
      });

      const text = response.text?.trim() || '';

      if (!text) {
        throw new Error('Gemini returned an empty response. Please try again.');
      }

      return text;
    } catch (error: any) {
      lastError = error;
      console.error(`Gemini API attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

      // Don't retry on auth errors or invalid API key
      if (error.status === 401 || error.status === 403 || error.message?.includes('API_KEY')) {
        throw error;
      }

      if (attempt < MAX_RETRIES) {
        const waitTime = RETRY_DELAY_MS * attempt;
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
      }
    }
  }

  throw lastError || new Error('Gemini API failed after all retries. Please try again.');
};