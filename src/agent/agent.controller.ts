import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AgentService } from './agent.service';
import { Response } from 'express';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ImageChatDto } from './dto/image-chat.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    return {
      response: await this.agentService.processMessage(chatMessageDto.message),
    };
  }

  @Post('chat-with-image')
  async chatWithImage(@Body() imageChatDto: ImageChatDto) {
    return {
      response: await this.agentService.processMessageWithImage(
        imageChatDto.message,
        imageChatDto.filename
      ),
    };
  }

  @Post('chat-with-image-stream')
  async chatWithImageStream(@Body() imageChatDto: ImageChatDto, @Res() res: Response) {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    console.log(`Processing chat with image: ${imageChatDto.message}, filename: ${imageChatDto.filename}`);
    
    try {
      await this.agentService.streamMessageWithImage(
        imageChatDto.message,
        imageChatDto.filename,
        (token) => {
          console.log(`Sending token: ${token}`);
          res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
        },
        () => {
          console.log('Streaming complete');
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        },
        (error) => {
          console.error('Streaming error:', error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
      );
    } catch (error) {
      console.error('Error setting up stream:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  //https://js.langchain.com/docs/how_to/streaming/
  @Post('chat-stream')
  async chatStreamPost(@Body() chatMessageDto: ChatMessageDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    console.log(`Received POST request for streaming with message: ${chatMessageDto.message}`);
    
    try {
      await this.agentService.streamMessage(
        chatMessageDto.message,
        (token) => {
          console.log(`Sending token: ${token}`);
          res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
        },
        () => {
          console.log('Streaming complete');
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        },
        (error) => {
          console.error('Streaming error:', error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
      );
    } catch (error) {
      console.error('Error setting up stream:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }

  @Get('chat-stream')
  async chatStreamGet(@Query('message') message: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    console.log(`Received GET request for streaming with message: ${message}`);
    
    try {
      if (!message) {
        throw new Error('No message provided in query parameters');
      }
      
      await this.agentService.streamMessage(
        message,
        (token) => {
          console.log(`Sending token: ${token}`);
          res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
        },
        () => {
          console.log('Streaming complete');
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        },
        (error) => {
          console.error('Streaming error:', error);
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.end();
        }
      );
    } catch (error) {
      console.error('Error setting up stream:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
