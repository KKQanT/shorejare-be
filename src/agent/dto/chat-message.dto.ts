import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({
    description: 'The message to send to the AI agent',
    example: 'How do I analyze market trends?',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  message: string;
} 