import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { fetchMarketData } from '../../utils/market-data.util';
import { tool } from "@langchain/core/tools";
import { Command } from '@langchain/langgraph';
import { ToolMessage } from '@langchain/core/messages';

export const fetchMarketDataTool = tool(async (input: {
  symbol: string;
  interval: string;
  timeStart: string;
  timeEnd: string;
}, config) => {
  const marketData = await fetchMarketData(input.symbol, input.interval, input.timeStart, input.timeEnd);

  return new Command({
    update: {
      messages: [
        new ToolMessage({
          name: 'fetch_market_data',
          content: "Successfully fetched market data",
          tool_call_id: config.toolCall.id,
        })
      ],
      marketData: JSON.stringify(marketData)
    },
  })
}, {
  name: 'fetch_market_data',
  description: 'Get historical market data for a specific cryptocurrency symbol from Yahoo Finance',
  schema: z.object({
    symbol: z.string().describe('The cryptocurrency symbol to analyze (e.g., "BTC", "ETH", "SOL")'),
    interval: z.string().optional().describe('The data interval (e.g., "1d", "1h", "15m"). Default is "1d"'),
    timeStart: z.string().optional().describe('The start date of the data (e.g., "2024-01-01T15:30:00Z").'),
    timeEnd: z.string().optional().describe('The end date of the data (e.g., "2024-01-31T15:30:00Z").'),
  }),
})


export const getTradingRecommendationTool = new DynamicStructuredTool({
  name: 'get_trading_recommendation',
  description: 'Get a trading recommendation based on current market conditions',
  schema: z.object({
    symbol: z.string().describe('The stock symbol to get a recommendation for'),
    timeframe: z.string().describe('The timeframe for the recommendation (e.g., "short-term", "medium-term", "long-term")'),
  }),
  func: async ({ symbol, timeframe }) => {
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