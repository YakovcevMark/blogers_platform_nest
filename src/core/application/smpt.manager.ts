import { Injectable } from '@nestjs/common';
import { SmtpService } from './smtp.service';

@Injectable()
export class SmtpManager {
  constructor(private smtpService: SmtpService) {}

  sendRegistrationCodeEmail(params: { email: string; code: string }) {
    return this.smtpService.sendMail({
      to: [params.email],
      subject: 'Register',
      from: 'Blogs Platform',
      html: `<div>
           <h1>To complete the registration follow the link belown:</h1>
           <a href='https://somesite.com/confirm-email?code=${params.code}'>complete registration</a>
      </div>
`,
    });
  }

  sendPasswordRecoveryCodeEmail(params: { email: string; code: string }) {
    return this.smtpService.sendMail({
      to: [params.email],
      subject: 'Password Recovery',
      from: 'Blogs Platform',
      html: `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${params.code}'>recovery password</a>
      </p>
`,
    });
  }
}
