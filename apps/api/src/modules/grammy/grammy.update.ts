import { Bot, Context } from 'grammy';
import {
  InjectBot,
  Update,
  // Message,
  Start,
  // Hears,
  Ctx,
  Help,
  // Admin,
} from '@grammyjs/nestjs';
import { Logger, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrammyExceptionFilter, ResponseTimeInterceptor } from './lib';
import { EchoBotName } from './grammy.constants';
// import { GrammyService } from './grammy.service';

const logger = new Logger('bot:echo.update');

@Update()
@UseInterceptors(ResponseTimeInterceptor)
@UseFilters(GrammyExceptionFilter)
export class EchoUpdate {
  constructor(
    @InjectBot(EchoBotName)
    private readonly bot: Bot<Context>,
  ) {
    logger.debug(
      `Initializing`,
      bot.isInited() ? bot.botInfo.first_name : '(pending)',
    );
  }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    logger.debug(
      'onStart!!',
      this.bot ? this.bot.botInfo.first_name : '(booting)',
    );
    // const me = await this.bot.api.getMe()
    ctx.reply(`Hey, I'm ${this.bot.botInfo.first_name}`);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    ctx.reply('Send me any text');
  }

  // @Admin()
  // @UseGuards(AdminGuard)
  // async onAdminCommand(@Ctx() ctx: Context): Promise<void> {
  //   ctx.reply('Welcome, Judge');
  // }
  //
  // @Hears('greetings')
  // async onMessage(
  //   @Ctx() ctx: Context,
  //   @Message('text', new ReverseTextPipe()) reversedText: string,
  // ): Promise<void> {
  //   ctx.reply(reversedText);
  // }
}
