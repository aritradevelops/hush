
import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError } from "class-validator-custom-errors";
import { Request, Response } from "express";
import { GET, POST } from "../decorators/method";
import Route from "../decorators/route";
import User from "../entities/user";
import { BadRequestError } from "../errors/http/bad-request.error";
import env from "../lib/env";
import { SignIn } from "../schemas/sign-in";
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
  @GET()
  async verifyEmail(req: Request, res: Response) {
    if (!req.query.hash || typeof req.query.hash !== 'string') {
      res.render('verify-email', {
        verified: false
      });
    }
    const foundAndVerified = await this.service.verifyEmail(req.query.hash as string)
    if (!foundAndVerified.success) res.render('verify-email', {
      verified: false
    });
    res.render('verify-email', {
      verified: true
    })
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

};
export default new AuthController();
