import 'dotenv/config';
import ai from "./configs/gemini.js";

async function test() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Say hello",
  });

  console.log(response.text);
}

test();