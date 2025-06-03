import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeImageTool } from './tools';
import { createTradingCopilotGraph } from './graph';
import { HumanMessage } from '@langchain/core/messages';

@Injectable()
export class AgentService {
  constructor() { }



  async streamMessage(
    message: string,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {

      const tradingCopilotGraph = createTradingCopilotGraph();
      const streamResults = await tradingCopilotGraph.stream(
        {
          messages: [new HumanMessage(message)],
        },
        { streamMode: "values" }
      );


      for await (const chunk of streamResults) {
        console.log('chunk', chunk);
        if (typeof chunk === 'object') {
          if (chunk.messages) {
            for (const message of chunk.messages) {
              onToken(message.content as string);
            }
          }
        }

        if (chunk.content) {
          onToken(chunk.content as string);
        }

      }

      onComplete();

    } catch (error) {
      console.error('Error streaming message:', error);
      onError(error);
    }
  }

  //deprecated
  async streamMessageWithImage(
    message: string,
    filename: string,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    console.log(`Streaming message with image: ${message}, filename: ${filename}`);

    try {
      const imagePath = path.join(process.cwd(), 'uploads', filename);

      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // to be implemented
    } catch (error) {
      console.error('Error streaming message with image:', error);
      onError(new Error(`Failed to process image: ${error.message}`));
    }
  }
}
