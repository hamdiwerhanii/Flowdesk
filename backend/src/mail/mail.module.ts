import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import type { Env } from '../config/env.validation';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const user = config.get('MAIL_USER', { infer: true });
        return {
          transport: {
            host: config.get('MAIL_HOST', { infer: true }),
            port: config.get('MAIL_PORT', { infer: true }),
            secure: config.get('MAIL_SECURE', { infer: true }),
            auth: user
              ? { user, pass: config.get('MAIL_PASSWORD', { infer: true }) }
              : undefined,
          },
          defaults: { from: config.get('MAIL_FROM', { infer: true }) },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
          options: {
            partials: {
              dir: join(__dirname, 'templates', 'partials'),
              options: { strict: true },
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
