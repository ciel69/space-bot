import { Module } from '@nestjs/common';
import { GrammyService } from './grammy.service';
import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { EchoUpdate } from './grammy.update';

@Module({
  controllers: [EchoUpdate],
  imports: [
    NestjsGrammyModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
  ],
  providers: [GrammyService],
})
export class GrammyModule {}
