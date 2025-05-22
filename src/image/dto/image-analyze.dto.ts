import { IsNotEmpty, IsString } from 'class-validator';

export class ImageAnalyzeDto {
  @IsString()
  @IsNotEmpty({ message: 'Filename is required' })
  filename: string;
} 