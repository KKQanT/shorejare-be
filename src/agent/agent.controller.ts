import { Body, Controller, Post, Res } from '@nestjs/common';
import { ImageChatDto } from './dto/image-chat.dto';
import { Response } from 'express';
import { ChatMessageDto } from './dto/chat-message.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AgentService } from './agent.service';

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService
  ) {}

  @Post('chat-with-image-stream')
  @ApiOperation({ summary: 'Chat with AI about an image (streamed)', description: 'Send a message and image filename to the AI agent and receive a streamed response' })
  @ApiBody({ type: ImageChatDto })
  @ApiResponse({ status: 200, description: 'Stream established successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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

  @Post('chat-stream')
  @ApiOperation({ summary: 'Chat with AI (streamed)', description: 'Send a message to the AI agent and receive a streamed response' })
  @ApiBody({ type: ChatMessageDto })
  @ApiResponse({ status: 200, description: 'Stream established successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
        //call back function to send token to the client -> this is the onToken function
        (token) => {
          //console.log(`Sending token: ${token}`);
          res.write(`data: ${JSON.stringify({ content: token })}\n\n`);
        },
        //call back function to send done signal to the client -> this is the onComplete function
        () => {
          //console.log('Streaming complete');
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        },
        //if error occurs, this will be called -> this is the onError function
        (error) => {
          //console.error('Streaming error:', error);
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
