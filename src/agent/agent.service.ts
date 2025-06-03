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
        if (typeof chunk === 'object') {

          console.log('chunk sender: ', chunk.sender);

          if (chunk.sender === "reception_agent") {
            //console.log('chunk receptionist: ', chunk);

            //check if the latest message is a tool call
            const lastMessage = chunk.messages[chunk.messages.length - 1];
            if (lastMessage.type === "tool_call") {
              console.log('tool call: ', lastMessage.content);
            }

            continue;
          }

          if (chunk.sender === "end") {
            const lastMessage = chunk.messages[chunk.messages.length - 1];
            //remove the word "FINAL ANSWER"
            onToken((lastMessage.content as string).replace("FINAL ANSWER", ""));
            continue;
          }
        }

        //if (chunk.content) {
        //  onToken(chunk.content as string);
        //  continue;
        //}

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
