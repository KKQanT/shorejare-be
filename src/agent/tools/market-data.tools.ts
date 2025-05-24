import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export const getMarketDataTool = new DynamicStructuredTool({
  name: 'get_market_data',
  description: 'Get the current market data for a specific stock symbol',
  schema: z.object({
    symbol: z.string().describe('The stock symbol to get market data for'),
  }),
  func: async ({ symbol }) => {
    return JSON.stringify({
      symbol,
      price: Math.random() * 1000,
      change: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
    });
  },
}); 