
import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError } from "class-validator-custom-errors";
import { Request, Response } from "express";
import { GET, POST } from "../decorators/method";
import Route from "../decorators/route";
import User from "../entities/user";
import { BadRequestError } from "../errors/http/bad-request.error";
import env from "../lib/env";
import { ForgotPassword, ResetPassword, SignIn, VerifyEmail } from "../schemas/auth";
import authService, { AuthService } from "../services/auth.service";
import CrudController from "../utils/crud-controller";
@Route('auth')
export class AuthController extends CrudController<typeof User, AuthService> {
  constructor() {
    super(authService, User);
  }

  @POST()
  async signUp(req: Request, res: Response) {
    const sanitized = await this._validate(req.body, req.t)
    const data = await this.service.signUp(sanitized)
    res.status(201);
    return {
      message: req.t('user.registered'),
      data: data
    };
  }
  @POST()
  async verifyEmail(req: Request, res: Response) {
    const verifyEmailSchema = plainToInstance(VerifyEmail, req.body)
    await validateOrReject(verifyEmailSchema, {
      validationError: {
        transformFunction: (key: string) => req.t(`validation.${key}`)
      },
    })
    const foundAndVerified = await this.service.verifyEmail(req.body.hash as string)
    if (!foundAndVerified.success) throw new BadRequestError()
    return {
      message: req.t('user.verified_email'),
      data: {
        verified: true
      }
    }
  }
  @POST()
  async signIn(req: Request, res: Response) {
    const signInSchema = plainToInstance(SignIn, req.body)
    await validateOrReject(signInSchema, {
      validationError: {
        transformFunction: (key: string) => req.t(`validation.${key}`)
      },
    })
    const { access_token, refresh_token, access_token_expiry, refresh_token_expiry } = await this.service.signIn(req, signInSchema)
    res.cookie('access_token', access_token, { httpOnly: true, expires: access_token_expiry, secure: env.get('NODE_ENV') === 'production', maxAge: (access_token_expiry.getTime() - Date.now()) });
    res.cookie('refresh_token', refresh_token, { httpOnly: true, expires: refresh_token_expiry, secure: env.get('NODE_ENV') === 'production', maxAge: (refresh_token_expiry.getTime() - Date.now()) });
    return {
      message: req.t('user.signed_in'),
      data: {
        access_token,
        refresh_token,
        access_token_expiry,
        refresh_token_expiry
      }
    }
  }

  @POST()
  async forgotPassword(req: Request, res: Response) {
    const forgotPasswordSchema = plainToInstance(ForgotPassword, req.body)
    await validateOrReject(forgotPasswordSchema, {
      validationError: {
        transformFunction: (key: string) => req.t(`validation.${key}`)
      },
    })
    const data = await this.service.forgotPassword(req.body.email as string)
    return {
      message: req.t('user.forgot_password'),
      data
    }
  }

  @POST()
  async resetPassword(req: Request, res: Response) {
    const resetPasswordSchema = plainToInstance(ResetPassword, req.body)
    await validateOrReject(resetPasswordSchema, {
      validationError: {
        transformFunction: (key: string) => req.t(`validation.${key}`)
      },
    })
    await this.service.resetPassword(resetPasswordSchema.hash, resetPasswordSchema.password)
    return {
      message: req.t('user.reset_password'),
      data: {}
    }
  }

};
export default new AuthController();
