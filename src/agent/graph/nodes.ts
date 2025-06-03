import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { AgentGlobalState } from './types';
import {ToolNode} from '@langchain/langgraph/prebuilt';
import { fetchMarketDataTool } from '../tools';
import { createReceptionAgent } from './agents';
import { ChartDataPoint } from 'src/utils/market-data.util';


export async function agentRouter(state: typeof AgentGlobalState.State): Promise<string> { 
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage | ToolMessage;

  if (lastMessage instanceof ToolMessage) {
    if (lastMessage.name === "fetch_market_data") {
      const marketDate : ChartDataPoint[] = JSON.parse(lastMessage.content as string);
      //update the state with the market data
      state.marketData = marketDate;
      return "analyze_market_data";
    }
  }

  if (state.sender === "analyze_market_data") {
    return "end";
  }

  if (
    lastMessage instanceof AIMessage &&
    lastMessage.tool_calls 
    && lastMessage.tool_calls.length > 0
  ) {
    return "call_tool";
  }

  if (typeof lastMessage?.content === "string" && lastMessage.content.includes("FINAL ANSWER")) {
    return "end";
  }
  
  return "reception_agent";
}

//reception agent
export async function receptionAgentNode(state: typeof AgentGlobalState.State) {
  console.log('reception agent state', state);
  const receptionAgent = await createReceptionAgent();
  console.log('state.messages for receptionAgentNode', state.messages);
  let result = await receptionAgent.invoke({
    messages: state.messages,
    tool_names: tools.map((tool) => tool.name).join(", "),
  });
  return {
    messages: [...state.messages, result],
    sender: "reception_agent",
  }
}

export async function analyzeMarketDataNode(state: typeof AgentGlobalState.State) {
  const marketData = state.marketData;

  console.log("marketData: ", marketData);
  
  return {
    messages: [...state.messages, new AIMessage("You should buy this coin")],
    sender: "analyze_market_data",
  }
}

export async function endNode(state: typeof AgentGlobalState.State) {
  return {
    messages: [...state.messages, new AIMessage("You should buy this coin")],
    sender: "end",
  }
}

const tools = [
  fetchMarketDataTool,
]

export const toolNode = new ToolNode<typeof AgentGlobalState.State>(tools);





