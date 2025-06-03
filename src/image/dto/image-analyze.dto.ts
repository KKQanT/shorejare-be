import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImageAnalyzeDto {
  @ApiProperty({
    description: 'The filename of the uploaded image to analyze',
    example: '1632748505123-123456789.jpg',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Filename is required' })
  filename: string;
} 