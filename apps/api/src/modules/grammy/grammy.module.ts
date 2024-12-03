import { InjectBot } from '@grammyjs/nestjs';
import { Logger, Module } from '@nestjs/common';
import { Bot, Context } from 'grammy';

import { EchoBotName } from './grammy.constants';
import { EchoUpdate } from './grammy.update';
import { ResponseTime } from './lib';

const logger = new Logger('bot:bot.module');

@Module({
  providers: [EchoUpdate],
  imports: [],
})
export class EchoBotModule {
  constructor(@InjectBot(EchoBotName) private readonly bot: Bot<Context>) {
    this.bot.use(ResponseTime);
    logger.log('EchoBotModule initialized');
  }
}
