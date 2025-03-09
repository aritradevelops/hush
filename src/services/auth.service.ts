
import bcrypt from 'bcrypt';
import { Request } from "express";
import { IsNull, LessThan, MoreThan } from "typeorm";
import User from "../entities/user";
import { BadRequestError } from "../errors/http/bad-request.error";
import authRepository, { AuthRepository } from "../repositories/auth.repository";
import { SignIn } from "../schemas/auth";
import CrudService from "../utils/crud-service";
import { generateHash, hash } from "../utils/string";
import jwtService from "./jwt.service";
import ms from 'ms'
import { NotFoundError } from '../errors/http/not-found.error';
export class AuthService extends CrudService<AuthRepository> {
  globalCreatedBy = '9d78bc6f-8fba-4387-81b2-f53d4b41e5b4'
  constructor() {
    super(authRepository);
  }
  async signUp(user: User) {
    const emailVerificationHash = generateHash(32)
    user.email_verification_hash = emailVerificationHash
    user.created_by = this.globalCreatedBy
    user.contacts = [this.globalCreatedBy];
    const data = await this.repository.create(user)
    const newUser = data.raw[0] as User
    // @ts-ignore
    delete newUser.password
    delete newUser.search
    return newUser
  }
  async verifyEmail(token: string) {
    const result = await this.repository.update({ email_verification_hash: token }, { email_verification_hash: null })
    return { success: !!result.affected, row: result.raw[0] }
  }
  async signIn(req: Request, payload: SignIn) {
    const user = await this.repository.view({ email: payload.email, email_verification_hash: IsNull() })
    if (!user) throw new BadRequestError(req.t('invalid_email_or_password'))
    if (!user.password) throw new BadRequestError(req.t('invalid_login_method'))
    const isValidPassword = await bcrypt.compare(payload.password, user.password)
    if (!isValidPassword) throw new BadRequestError(req.t('invalid_email_or_password'))
    const data = await jwtService.sign(user)
    return data
  }

  async forgotPassword(email: string) {
    const resetPasswordHash = generateHash(32)
    const result = await this.repository.update({ email: email }, { reset_password_hash: resetPasswordHash, reset_password_hash_expiry: new Date(Date.now() + ms('15m')) })
    if (!result.affected) throw new NotFoundError()
    return { reset_password_hash: resetPasswordHash, email }
  }

  async resetPassword(resetPasswordHash: string, password: string) {
    const hashedPassword = hash(password)
    const result = await this.repository.update({ reset_password_hash: resetPasswordHash, reset_password_hash_expiry: MoreThan(new Date()) }, { password: hashedPassword, reset_password_hash_expiry: null })
    if (!result.affected) throw new NotFoundError()
    return { success: !!result.affected }
  }
}
export default new AuthService();
