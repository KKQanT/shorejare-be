import { fetchMarketDataTool, getTradingRecommendationTool } from './analyze.tools';
import { analyzeImageTool } from './vision.tools';
import { technicalAnalysisTool } from './technical-analysis.tools';

export {
  fetchMarketDataTool,
  getTradingRecommendationTool,
  analyzeImageTool,
  technicalAnalysisTool,
};

export const tools = [
  fetchMarketDataTool,
  getTradingRecommendationTool,
  analyzeImageTool,
  technicalAnalysisTool,
]; 