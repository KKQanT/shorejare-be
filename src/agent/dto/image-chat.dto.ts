import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImageChatDto {
  @ApiProperty({
    description: 'The message to send to the AI agent',
    example: 'What can you tell me about this image?',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @ApiProperty({
    description: 'The filename of the uploaded image to analyze',
    example: '1632748505123-123456789.jpg',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Filename is required' })
  filename: string;
} 