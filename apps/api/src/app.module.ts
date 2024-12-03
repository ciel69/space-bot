import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TelegramModule } from './modules/telegram/telegram.module';
import { BattleModule } from './modules/battle/battle.module';
import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { EchoBotName } from './modules/grammy/grammy.constants';
import { EchoBotModule } from './modules/grammy/grammy.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'web/dist'),
    }),
    TelegramModule,
    BattleModule,
    NestjsGrammyModule.forRoot({
      botName: EchoBotName,
      token: process.env.TELEGRAM_BOT_TOKEN,
      include: [EchoBotModule],
      pollingOptions: {
        allowed_updates: ['chat_member', 'message', 'callback_query'],
      },
    }),
    EchoBotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
