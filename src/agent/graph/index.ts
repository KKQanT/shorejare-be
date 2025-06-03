import {END, START, StateGraph} from '@langchain/langgraph';
import { AgentGlobalState } from './types';
import { analyzeMarketDataNode, toolNode, receptionAgentNode, agentRouter, endNode } from './nodes';

const workflow = new StateGraph(AgentGlobalState)
  .addNode("reception_agent", receptionAgentNode)
  .addNode("analyze_market_data", analyzeMarketDataNode)
  .addNode("call_tool", toolNode)
  .addNode("end", endNode)
  .addEdge(START, "reception_agent")
  .addConditionalEdges("reception_agent", agentRouter)
  .addConditionalEdges("call_tool", agentRouter)
  .addConditionalEdges("analyze_market_data", agentRouter)
  .addEdge("end", END);


export const createTradingCopilotGraph = () => {
  return workflow.compile();
};
