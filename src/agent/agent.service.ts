import { Injectable } from '@nestjs/common';
import { runTradingAgent } from './trading-agent';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';

@Injectable()
export class AgentService {
  async processMessage(message: string): Promise<string> {
    try {
      let finalResponse = '';
      
      for await (const chunk of await runTradingAgent(message)) {
        finalResponse += chunk.output;
      }
      
      return finalResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return `Error: ${error.message}`;
    }
  }

  async streamMessage(message: string, onToken: (token: string) => void, onComplete: () => void, onError: (error: Error) => void) {
    try {
      const callbackHandler = BaseCallbackHandler.fromMethods({
        handleLLMNewToken: (token: string) => {
          console.log('Token received:', token); // Log for debugging
          onToken(token);
        },
        handleLLMError: (error: Error) => {
          console.error('LLM error in callback:', error);
          onError(error);
        },
      });
      
      const stream = await runTradingAgent(message, [callbackHandler]);
      
      let hasOutput = false;
      for await (const chunk of stream) {
        if (chunk.output) {
          hasOutput = true;
          console.log('Chunk output:', chunk.output); 
          onToken(chunk.output);
        }
      }
      
      if (!hasOutput) {
        console.log('No streaming tokens detected, might be using a non-streaming provider');
      }
      
      onComplete();
    } catch (error) {
      console.error('Error streaming message:', error);
      onError(error);
    }
  }
}
