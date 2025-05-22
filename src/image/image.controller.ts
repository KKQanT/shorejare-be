import { Controller, Post, UseInterceptors, UploadedFile, Body, HttpException, HttpStatus, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { ImageService } from './image.service';
import * as fs from 'fs';
import * as path from 'path';
import { ImageAnalyzeDto } from './dto/image-analyze.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {

      //TO DO: maybe put image in cloud storage
      //TO DO: or maybe use image data in base64 format and send to bot
      //directly
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {

          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
      },
      fileFilter: (req, file, callback) => {
        // Only accept images
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new HttpException(
              'Only image files are allowed (JPEG, PNG, GIF, WEBP)',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      return {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/image/${file.filename}`, 
      };
    } catch (error) {
      throw new HttpException(
        `Failed to upload image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze')
  async analyzeImage(@Body() analyzeDto: ImageAnalyzeDto) {
    try {
      const analysisResult = await this.imageService.analyzeImage(analyzeDto.filename);
      return analysisResult;
    } catch (error) {
      throw new HttpException(
        `Failed to analyze image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload-and-analyze')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, 
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new HttpException(
              'Only image files are allowed (JPEG, PNG, GIF, WEBP)',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAndAnalyzeImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const fileInfo = {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/image/${file.filename}`,
      };

      const analysisResult = await this.imageService.analyzeImage(file.filename);

      return {
        file: fileInfo,
        analysis: analysisResult.analysisResult,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to upload and analyze image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const imagePath = path.join(process.cwd(), 'uploads/images', filename);
    
    if (!fs.existsSync(imagePath)) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    
    res.sendFile(imagePath);
  }
}
