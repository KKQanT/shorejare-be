import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeImageTool } from '../agent/tools';

@Injectable()
export class ImageService {
  async analyzeImage(filename: string) {
    try {

      //TO DO: maybe put image in cloud storage
      const imagePath = path.join(process.cwd(), 'uploads/images', filename);
      
      if (!fs.existsSync(imagePath)) {
        throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
      }
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      const analysisResult = await analyzeImageTool.func({ image: base64Image });
      
      let resultObj;
      try {
        resultObj = JSON.parse(analysisResult);
      } catch (e) {
        console.error('Failed to parse JSON from image analysis tool', e);
        throw new Error('Failed to parse analysis result');
      }
      
      return {
        filename,
        analysisResult: resultObj,
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new HttpException(
        `Failed to analyze image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getImagePath(filename: string): Promise<string> {
    const imagePath = path.join(process.cwd(), 'uploads/images', filename);
    
    if (!fs.existsSync(imagePath)) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    
    return imagePath;
  }
}
