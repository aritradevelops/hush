
import bcrypt from 'bcrypt';
import { Request } from "express";
import { IsNull } from "typeorm";
import User from "../entities/user";
import { BadRequestError } from "../errors/http/bad-request.error";
import authRepository, { AuthRepository } from "../repositories/auth.repository";
import { SignIn } from "../schemas/sign-in";
import CrudService from "../utils/crud-service";
import { generateHash } from "../utils/string";
import jwtService from "./jwt.service";
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
}
export default new AuthService();
