import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";
import { StructuredTool } from "@langchain/core/tools";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { Runnable } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { fetchMarketDataTool } from "../tools/analyze.tools";
import dotenv from 'dotenv';

dotenv.config();

export async function createReceptionAgent() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const tools = [
    fetchMarketDataTool,
  ]

  const formattedTools = tools.map((t) => convertToOpenAITool(t));


  //new prompt
  let newprompt = PromptTemplate.fromTemplate(
    `System prompt:
    You are a reception agent that is responsible for receiving messages from the user.
    If user ask for trading recommendation, you should use the fetch_market_data tool to get the market data.
    If user didn't mention period of time, you should ask user for the period of time. (e.g. What time period do you want me to consider?  
    want me to consider price of the coin in the last 1 hour, 1 day, 1 week, 1 month, 1 year, etc.)
    If user ask for other things, you should response with a message to the user that you are not able to help with that.
    then add prefix your response with FINAL ANSWER so the system knows to stop the agent graph
    You have access to the following tools: {tool_names}

    Now answer the following question:
    {messages}
    `
  );  

  return newprompt.pipe(llm.bind({ tools: formattedTools }));

}
