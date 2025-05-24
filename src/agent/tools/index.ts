import { getMarketDataTool } from './market-data.tools';
import { analyzeChartPatternTool, getTradingRecommendationTool } from './trading.tools';
import { analyzeImageTool } from './vision.tools';

export {
  getMarketDataTool,
  analyzeChartPatternTool, 
  getTradingRecommendationTool,
  analyzeImageTool,
};

export const tools = [
  getMarketDataTool,
  analyzeChartPatternTool,
  getTradingRecommendationTool,
  analyzeImageTool,
]; 