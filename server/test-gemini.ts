import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
};

async function test() {
  try {
    const response = await getGeminiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Hello, create a basic webpage' }]
        }
      ],
      config: {
        systemInstruction: 'You are an expert web developer.',
        temperature: 0.7,
        maxOutputTokens: 12000,
      },
    });
    console.log('Response succeeded! Length:', response.text?.length);
  } catch (error: any) {
    console.error('Error during generation:', error);
  }
}

test();
