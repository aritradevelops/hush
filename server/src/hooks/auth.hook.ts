
import { UUID } from 'crypto';
import { Request, Response } from 'express';
import ResetPassword from '../emails/reset-password';
import Verification from '../emails/verification';
import User from '../entities/user';
import { InternalServerError } from '../errors/http/internal-server.error';
import env from '../lib/env';
import { Hook } from "../lib/hook-manager";
import mailer from '../lib/mailer';
import emailVerificationRequestRepository from '../repositories/email-verification-request.repository';
import resetPasswordRequestRepository from '../repositories/reset-password-request.repository';
import userRepository from '../repositories/user.repository';
import logger from "../utils/logger";

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
    try {
      const emailVerificationRequest = await emailVerificationRequestRepository.view({ created_by: resp.data.id })
      if (!emailVerificationRequest) throw new Error(`no emailVerificationRequest found for user ${resp.data.email}`)
      // for production send email
      if (env.get('APP_ENV') === 'production') {
        const { data, error } = await mailer.send({
          to: [resp.data.email],
          from: 'Hush <notify@authinifinity.com>',
          subject: 'Verify your email',
        }, new Verification(`${env.get('CLIENT_URL')}/verify-email?hash=${emailVerificationRequest.hash}`, 'Hush'))

        if (error) throw new Error(`Failed to sent email verification email to user ${resp.data.email} due to : ${error}`)
        logger.info("Verification email sent to", resp.data.email);
        // @ts-ignore
        resp.data.resend_id = data?.id
      } else {
        logger.info("Email verification link:", `${env.get('CLIENT_URL')}/verify-email?hash=${emailVerificationRequest.hash}`)
      }
    } catch (error) {
      logger.critical(error as Error)
      // rollback
      await userRepository.destroy({ id: resp.data.id });
      throw new InternalServerError()
    }
  }
}
export class VerifyEmail extends AuthHook {
  async after(req: Request, res: Response, resp: { message: string, data: User }) {
    // TODO:
  }
}

export class ForgotPassword extends AuthHook {
  async after(req: Request, res: Response, resp: { message: string, data: { user_id: UUID, email: string } }) {
    try {
      const resetPasswordRequest = await resetPasswordRequestRepository.view({ created_by: resp.data.user_id })
      if (!resetPasswordRequest) throw new Error(`no resetPasswordRequest found for user ${resp.data.email}`)
      // for production send email
      if (env.get('APP_ENV') === 'production') {
        const { data, error } = await mailer.send({
          to: [resp.data.email],
          from: 'Hush <notify@authinifinity.com>',
          subject: 'Reset Your Password',
        }, new ResetPassword(`${env.get('CLIENT_URL')}/reset-password?hash=${resetPasswordRequest.hash}`, 'Hush'))

        if (error) throw new Error(`Failed to sent reset password email to user ${resp.data.email} due to : ${error}`)
        logger.info("Reset password email sent to", resp.data.email);
        // @ts-ignore
        resp.data.resend_id = data?.id
      } else {
        logger.info("Reset Password Link:", `${env.get('CLIENT_URL')}/reset-password?hash=${resetPasswordRequest.hash}`)
      }
    } catch (error) {
      logger.critical(error as Error)
      throw new InternalServerError()
    }
  }
}