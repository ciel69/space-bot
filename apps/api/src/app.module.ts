import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TelegramModule } from './modules/telegram/telegram.module';
import { BattleModule } from './modules/battle/battle.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'web/dist'),
    }),
    TelegramModule,
    BattleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
