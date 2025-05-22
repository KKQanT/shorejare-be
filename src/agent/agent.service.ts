import { Injectable } from '@nestjs/common';
import { runTradingAgent } from './trading-agent';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeImageTool } from './tools';

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

  async processMessageWithImage(message: string, filename: string): Promise<string> {
    console.log(`Processing message with image: ${message}, filename: ${filename}`);
    
    try {
      const imagePath = path.join(process.cwd(), 'uploads', filename);
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      const imageAnalysis = await analyzeImageTool.func({
        image: base64Image,
      });
      
      console.log('Image analysis result:', imageAnalysis);
      
      const analysisResult = JSON.parse(imageAnalysis);
      
      const refinedMessage = `
User message: ${message}

I'm looking at a trading chart image. Here's what I can see:
${analysisResult.chart_type ? `Chart Type: ${analysisResult.chart_type}` : ''}
${analysisResult.timeframe ? `Timeframe: ${analysisResult.timeframe}` : ''}
${analysisResult.symbols?.length > 0 ? `Trading Symbols: ${analysisResult.symbols.join(', ')}` : ''}
${analysisResult.indicators?.length > 0 ? `Indicators: ${analysisResult.indicators.join(', ')}` : ''}
${analysisResult.patterns?.length > 0 ? `Patterns: ${analysisResult.patterns.join(', ')}` : ''}
${analysisResult.price_levels?.length > 0 ? `Price Levels: ${analysisResult.price_levels.join(', ')}` : ''}
${analysisResult.description ? `Description: ${analysisResult.description}` : ''}

Please analyze this chart and ${message}
      `;
      
      return this.processMessage(refinedMessage);
    } catch (error) {
      console.error('Error processing message with image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
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
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      const imageAnalysis = await analyzeImageTool.func({
        image: base64Image,
      });
      
      console.log('Image analysis result:', imageAnalysis);
      
      const analysisResult = JSON.parse(imageAnalysis);
      
      const refinedMessage = `
User message: ${message}

I'm looking at a trading chart image. Here's what I can see:
${analysisResult.chart_type ? `Chart Type: ${analysisResult.chart_type}` : ''}
${analysisResult.timeframe ? `Timeframe: ${analysisResult.timeframe}` : ''}
${analysisResult.symbols?.length > 0 ? `Trading Symbols: ${analysisResult.symbols.join(', ')}` : ''}
${analysisResult.indicators?.length > 0 ? `Indicators: ${analysisResult.indicators.join(', ')}` : ''}
${analysisResult.patterns?.length > 0 ? `Patterns: ${analysisResult.patterns.join(', ')}` : ''}
${analysisResult.price_levels?.length > 0 ? `Price Levels: ${analysisResult.price_levels.join(', ')}` : ''}
${analysisResult.description ? `Description: ${analysisResult.description}` : ''}

Please analyze this chart and ${message}
      `;
      
      await this.streamMessage(refinedMessage, onToken, onComplete, onError);
    } catch (error) {
      console.error('Error streaming message with image:', error);
      onError(new Error(`Failed to process image: ${error.message}`));
    }
  }
}
