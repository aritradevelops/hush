
import bcrypt from 'bcrypt';
import { UUID } from 'crypto';
import { Request, Response } from "express";
import ms from 'ms';
import { IsNull } from "typeorm";
import { v4 } from 'uuid';
import User from "../entities/user";
import { BadRequestError } from "../errors/http/bad-request.error";
import { NotFoundError } from '../errors/http/not-found.error';
import authRepository, { AuthRepository } from "../repositories/auth.repository";
import { SignIn, SignUp } from "../schemas/auth";
import CrudService from "../utils/crud-service";
import { generateHash, hash } from "../utils/string";
import emailVerificationRequestService from './email-verification-request.service';
import jwtService from "./jwt.service";
import passwordService from './password.service';
import resetPasswordRequestService from './reset-password-request.service';
import sessionService from './session.service';
export class AuthService extends CrudService<AuthRepository> {
  constructor() {
    super(authRepository);
  }
  async signUp(req: Request, res: Response, data: SignUp) {
    const emailVerificationHash = generateHash(32)
    const id = v4() as UUID
    const userInsertResult = await this.repository.create({ ...data, created_by: id, id })
    const newUser = userInsertResult.raw[0] as User
    // @ts-ignore
    req.user?.id = newUser.id
    await Promise.all([
      emailVerificationRequestService.create(req, res, {
        user_id: newUser.id,
        hash: emailVerificationHash,
        expires_at: new Date(Date.now() + ms('1d'))
      }),
      passwordService.create(req, res, { password: hash(data.password), user_id: newUser.id })
    ])
    return newUser
  }
  async verifyEmail(req: Request, res: Response, token: string) {
    const emailVerificationRequest = await emailVerificationRequestService.getValidRequestByHash(req, res, token)
    if (!emailVerificationRequest) return { success: false }
    const result = await this.repository.update({
      id: emailVerificationRequest.user_id, email_verified: false, deleted_at: IsNull()
    }, { email_verified: true })
    // @ts-ignore
    req.user.id = emailVerificationRequest.user_id
    await emailVerificationRequestService.delete(req, res, emailVerificationRequest.id)
    return { success: !!result.affected, row: result.raw[0] }
  }
  async signIn(req: Request, res: Response, payload: SignIn) {
    const user = await this.repository.view({ email: payload.email, email_verified: true })
    if (!user) throw new BadRequestError(req.t('invalid_email_or_password'))
    const credentials = await passwordService.getByUserId(req, res, user.id)
    if (!credentials) throw new BadRequestError(req.t('invalid_login_method'))
    const isValidPassword = await bcrypt.compare(payload.password, credentials.password)
    if (!isValidPassword) throw new BadRequestError(req.t('invalid_email_or_password'))
    const data = await jwtService.sign(user)
    return data
  }

  async forgotPassword(req: Request, res: Response, email: string) {
    const resetPasswordHash = generateHash(32)
    const user = await this.repository.view({ email: email, email_verified: true, deleted_at: IsNull() })
    if (!user) throw new NotFoundError(req.t('resource_not_found', { resource: 'User' }))
    // @ts-ignore
    req.user.id = user.id
    await resetPasswordRequestService.create(req, res, {
      user_id: user.id, hash: resetPasswordHash,
      expires_at: new Date(Date.now() + ms('15m'))
    })
    return { user_id: user.id, email }
  }

  async resetPassword(req: Request, res: Response, resetPasswordHash: string, password: string) {
    const hashedPassword = hash(password)
    const resetPasswordRequest = await resetPasswordRequestService.getValidRequestByHash(req, res, resetPasswordHash)
    if (!resetPasswordRequest) return { success: false }
    const existingPassword = await passwordService.getByUserId(req, res, resetPasswordRequest.user_id)
    // @ts-ignore
    req.user.id = resetPasswordRequest.user_id
    if (existingPassword) {
      await passwordService.update(req, res, existingPassword.id, { password: hashedPassword })
    } else {
      await passwordService.create(req, res, { password: hashedPassword })
    }
    await resetPasswordRequestService.delete(req, res, resetPasswordRequest.id)
    return { success: true }
  }

  async refresh(req: Request, res: Response, refreshToken: string) {
    if (!refreshToken) throw new BadRequestError(req.t('invalid_refresh_token'))
    // TODO: add ip and user agent checking
    const activeSession = await sessionService.getActiveSession(req, res, { refreshToken })
    if (!activeSession) throw new BadRequestError(req.t('invalid_refresh_token'))
    const user = await this.repository.view({ id: activeSession.user_id, email_verified: true, deleted_at: IsNull() })
    if (!user) throw new BadRequestError(req.t('invalid_refresh_token'))
    const data = await jwtService.sign(user)
    return data
  }
}
export default new AuthService();
