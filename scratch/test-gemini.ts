import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  
  const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'];
  
  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello');
      console.log(`Success with ${modelName}`);
      break;
    } catch (e: any) {
      console.log(`Failed with ${modelName}: ${e.message}`);
    }
  }
}
test();
