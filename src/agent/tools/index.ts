import { analyzeChartPatternTool, getTradingRecommendationTool } from './analyze.tools';
import { analyzeImageTool } from './vision.tools';
import { technicalAnalysisTool } from './technical-analysis.tools';

export {
  analyzeChartPatternTool, 
  getTradingRecommendationTool,
  analyzeImageTool,
  technicalAnalysisTool,
};

export const tools = [
  analyzeChartPatternTool,
  getTradingRecommendationTool,
  analyzeImageTool,
  technicalAnalysisTool,
]; 