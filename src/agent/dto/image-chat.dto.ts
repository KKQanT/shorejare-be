import { IsNotEmpty, IsString } from 'class-validator';

export class ImageChatDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'Filename is required' })
  filename: string;
} 