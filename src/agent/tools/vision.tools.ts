import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

const visionModel = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.2,
});

export const analyzeImageTool = new DynamicStructuredTool({
  name: 'analyze_image',
  description: "Analyze an image to get the symbol of the coin (example: BTC, ETH, SOL, etc.), and the timeframe of the chart (example: 1h, 4h, 1d, etc.) so that the agent can use this information to call the get_market_data tool",
  schema: z.object({
    image: z.string().describe('The image URL or base64 data to analyze'),
  }),
  func: async ({ image }) => {
    try {
      console.log('Analyzing image...');
      
      const content = image.startsWith('data:') || image.startsWith('http') 
        ? image 
        : `data:image/jpeg;base64,${image}`;
      
      const prompt = `
        You are an expert trading chart analyzer. Analyze this trading chart image and extract:
        1. The cryptocurrency or stock symbol (e.g., BTC, ETH, AAPL)
        2. The timeframe of the chart (e.g., 1m, 5m, 15m, 1h, 4h, 1d)
        3. Any key price levels visible (support/resistance)
        4. Current trend direction (bullish, bearish, or ranging)
        
        Format your response as a JSON object with these exact keys:
        {
          "symbol": "detected_symbol",
          "timeframe": "detected_timeframe",
          "priceLevels": [list_of_key_levels],
          "trend": "detected_trend"
        }
        
        Only return the JSON object, no other text.
      `;
      
      const message = new HumanMessage({
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: content } }
        ],
      });
      
      const response = await visionModel.invoke([message]);
      
      const responseText = typeof response.content === 'string' 
        ? response.content 
        : JSON.stringify(response.content);
      
      let jsonStart = responseText.indexOf('{');
      let jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('Could not extract JSON from model response');
      }
      
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      const analysisResult = JSON.parse(jsonString);
      
      console.log('Analysis result:', analysisResult);
      
      return JSON.stringify(analysisResult);
    } catch (error) {
      console.error('Error analyzing image:', error);
      return JSON.stringify({
        error: 'Failed to analyze image',
        message: error.message,
      });
    }
  },
}); 