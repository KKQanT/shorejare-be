import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

// Setup the vision model
const visionModel = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.2,
});

// Example tool to get current market data
export const getMarketDataTool = new DynamicStructuredTool({
  name: 'get_market_data',
  description: 'Get the current market data for a specific stock symbol',
  schema: z.object({
    symbol: z.string().describe('The stock symbol to get market data for'),
  }),
  func: async ({ symbol }) => {
    // TO DO: This is a placeholder. In a real implementation, this would call a market data API
    return JSON.stringify({
      symbol,
      price: Math.random() * 1000,
      change: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
    });
  },
});

//mock tool
export const analyzeChartPatternTool = new DynamicStructuredTool({
  name: 'analyze_chart_pattern',
  description: 'Analyze the chart pattern for a specific trading indicator',
  schema: z.object({
    indicator: z.string().describe('The trading indicator to analyze (e.g., "RSI", "MACD", "Moving Average")'),
  }),
  func: async ({ indicator }) => {
    // This is a placeholder. In a real implementation, this would analyze the chart
    const patterns = ['bullish', 'bearish', 'neutral'];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    return JSON.stringify({
      indicator,
      pattern: randomPattern,
      strength: Math.random() * 10,
      timestamp: new Date().toISOString(),
    });
  },
});

// Example tool to get trading recommendations
export const getTradingRecommendationTool = new DynamicStructuredTool({
  name: 'get_trading_recommendation',
  description: 'Get a trading recommendation based on current market conditions',
  schema: z.object({
    symbol: z.string().describe('The stock symbol to get a recommendation for'),
    timeframe: z.string().describe('The timeframe for the recommendation (e.g., "short-term", "medium-term", "long-term")'),
  }),
  func: async ({ symbol, timeframe }) => {
    // This is a placeholder. In a real implementation, this would provide a real recommendation
    const actions = ['buy', 'sell', 'hold'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    return JSON.stringify({
      symbol,
      action: randomAction,
      entryPoint: Math.random() * 1000,
      stopLoss: Math.random() * 900,
      targetPrice: Math.random() * 1100,
      timeframe,
      confidence: Math.random(),
      timestamp: new Date().toISOString(),
    });
  },
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
      
      // Detect if it's a base64 image or URL
      const content = image.startsWith('data:') || image.startsWith('http') 
        ? image 
        : `data:image/jpeg;base64,${image}`;
      
      // Setup prompt for vision model
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

export const tools = [
  getMarketDataTool,
  analyzeChartPatternTool,
  getTradingRecommendationTool,
  analyzeImageTool,
]; 