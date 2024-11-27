import { Body, Controller, Post } from '@nestjs/common';
import { isErrorOfType, parse, validate } from '@telegram-apps/init-data-node';

@Controller('telegram')
export class TelegramController {
  @Post('auth')
  validateTelegramData(@Body() body: { initData: string }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    try {
      validate(body.initData, token);
      const data = parse(body.initData);
      return {
        success: true,
        userId: data.user.id,
        username: data.user.username,
      };
    } catch (e) {
      if (isErrorOfType(e, 'ERR_SIGN_INVALID')) {
        console.log('Sign is invalid');
        return { success: false, message: 'Invalid signature' };
      }
    }
  }
}
