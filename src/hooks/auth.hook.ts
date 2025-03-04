
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";
import User from '../entities/user';
import mailer from '../lib/mailer';
import Welcome from '../emails/welcome';
import userRepository from '../repositories/user.repository';
import { InternalServerError } from '../errors/http/internal-server.error';
import env from '../lib/env';
import Verification from '../emails/verification';

class AuthHook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // console.log("I was called after", data);
  }
}
export class SignUp extends AuthHook {
  async after(req: Request, res: Response, resp: { message: string, data: User }) {
    // for production send email
    if (env.get('APP_ENV') === 'production') {
      const { data, error } = await mailer.send({
        to: [resp.data.email],
        from: 'Hush <notify@authinifinity.com>',
        subject: 'Verify your email',
      }, new Verification(`https://${req.hostname}/v1/auth/verify-email?hash=${resp.data.email_verification_hash}`, 'Hush'))

      if (error) {
        logger.critical(error)
        // rollback
        await userRepository.destroy({ id: resp.data.id });
        throw new InternalServerError()
      }
      logger.info("Verification email sent to", resp.data.email);
      // @ts-ignore
      resp.data.resend_id = data?.id
    } else {
      logger.info("Email verification link:", `http://${req.hostname}:${env.get('PORT')}/v1/auth/verify-email?hash=${resp.data.email_verification_hash}`)
    }
    // @ts-ignore
    delete resp.data.email_verification_hash
  }
}
export class VerifyEmail extends AuthHook {
  async after(req: Request, res: Response, resp: { message: string, data: User }) {
    // TODO:
  }
}
