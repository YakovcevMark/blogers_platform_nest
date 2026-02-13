import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
const SMTP_EMAIL_ADDRESS = 'yakovcevmark@gmail.com';
const SMTP_EMAIL_PASSWORD = 'mjox zpta aprt zlcr';

@Injectable()
export class SmtpService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      // user: process.env.SMTP_EMAIL_ADDRESS,
      user: SMTP_EMAIL_ADDRESS,
      // pass: process.env.SMTP_EMAIL_PASSWORD,
      pass: SMTP_EMAIL_PASSWORD,
    },
  });

  sendMail(params: {
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    return this.transporter.sendMail({ ...params, to: params.to.join(' ,') });
  }
}
