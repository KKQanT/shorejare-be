import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { 
  calculateSMA, 
  calculateRSI, 
  calculateMACD, 
  calculateBollingerBands 
} from '../../utils/technical-indicators.util';
import { fetchMarketData, ChartDataPoint } from '../../utils/market-data.util';

export const technicalAnalysisTool = new DynamicStructuredTool({
  name: 'analyze_technical_indicators',
  description: 'Analyze cryptocurrency market data using technical indicators (RSI, MACD, Bollinger Bands, etc.)',
  schema: z.object({
    symbol: z.string().describe('The cryptocurrency symbol to analyze (e.g., "BTC", "ETH", "SOL")'),
    interval: z.string().optional().describe('The data interval (e.g., "1d", "1h", "15m"). Default is "1d"'),
    indicators: z.array(z.enum(['sma', 'rsi', 'macd', 'bollinger'])).describe('List of indicators to calculate'),
    params: z.object({
      smaPeriod: z.number().optional().describe('Period for SMA calculation (default: 14)'),
      rsiPeriod: z.number().optional().describe('Period for RSI calculation (default: 14)'),
      macdFastPeriod: z.number().optional().describe('Fast period for MACD calculation (default: 12)'),
      macdSlowPeriod: z.number().optional().describe('Slow period for MACD calculation (default: 26)'),
      macdSignalPeriod: z.number().optional().describe('Signal period for MACD calculation (default: 9)'),
      bollingerPeriod: z.number().optional().describe('Period for Bollinger Bands calculation (default: 20)'),
      bollingerMultiplier: z.number().optional().describe('Standard deviation multiplier for Bollinger Bands (default: 2)'),
    }).optional().describe('Optional parameters for indicator calculations'),
  }),
  func: async ({ symbol, interval = '1d', indicators, params = {} }) => {
    try {
      const marketData = await fetchMarketData(symbol, interval);
      
      const result: {
        marketData: ChartDataPoint[],
        indicators: {
          sma?: (number | null)[],
          rsi?: (number | null)[],
          macd?: {
            macd: (number | null)[],
            signal: (number | null)[],
            histogram: (number | null)[]
          },
          bollinger?: {
            upper: (number | null)[],
            middle: (number | null)[],
            lower: (number | null)[]
          }
        }
      } = {
        marketData,
        indicators: {}
      };
      
      for (const indicator of indicators) {
        switch (indicator) {
          case 'sma':
            result.indicators.sma = calculateSMA(
              marketData, 
              params.smaPeriod || 14
            );
            break;
            
          case 'rsi':
            result.indicators.rsi = calculateRSI(
              marketData, 
              params.rsiPeriod || 14
            );
            break;
            
          case 'macd':
            result.indicators.macd = calculateMACD(
              marketData, 
              params.macdFastPeriod || 12,
              params.macdSlowPeriod || 26,
              params.macdSignalPeriod || 9
            );
            break;
            
          case 'bollinger':
            result.indicators.bollinger = calculateBollingerBands(
              marketData, 
              params.bollingerPeriod || 20,
              params.bollingerMultiplier || 2
            );
            break;
        }
      }
      
      return JSON.stringify(result);
    } catch (error) {
      console.error('Error in technical analysis tool:', error);
      return JSON.stringify({
        error: 'Failed to perform technical analysis',
        message: error.message || 'Unknown error',
      });
    }
  },
}); 