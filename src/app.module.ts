import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [AgentModule, ImageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
