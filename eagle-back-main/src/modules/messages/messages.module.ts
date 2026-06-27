import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { MessagesGateway } from './messages.gateway';
import { WebRTCController } from './webrtc.controller';
import { WebRTCGateway } from './webrtc.gateway';
import { WebRTCService } from './webrtc.service';
import { WebRTCRepository } from './webrtc.repository';
import { FirebaseModule } from 'src/config/firebase';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    FirebaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MessagesController, WebRTCController],
  providers: [
    MessagesService,
    MessagesRepository,
    MessagesGateway,
    WebRTCGateway,
    WebRTCService,
    WebRTCRepository,
  ],
  exports: [MessagesService, MessagesRepository, WebRTCService, WebRTCRepository],
})
export class MessagesModule {}
