import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { tools } from './tools';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set in the environment variables.');
}

export const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2,
  streaming: true,
  verbose: true,
});

const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    `You are ShareJore AI, an expert trading analysis assistant.
Your job is to analyze trading charts, provide market insights, and recommend trading actions.
Be precise, professional, and provide clear justifications for your recommendations.
Always present trading recommendations with appropriate risk considerations.

When analyzing charts:
1. Identify key patterns and indicators
2. Assess market trends and sentiment
3. Provide clear buy/sell recommendations with entry points and stop losses
4. Explain your reasoning in a concise, professional manner

Remember trading involves risk, and you should acknowledge this in your recommendations.`
  ),
  new MessagesPlaceholder('chat_history'),
  HumanMessagePromptTemplate.fromTemplate('{input}'),
  new MessagesPlaceholder('agent_scratchpad'),
]);

export const createAgent = async () => {
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  return executor;
};

export const runTradingAgent = async (
  input: string,
  callbacks: any[] = [],
) => {
  const executor = await createAgent();
  return executor.stream({
    input,
    chat_history: [],
    callbacks,
  });
}; 