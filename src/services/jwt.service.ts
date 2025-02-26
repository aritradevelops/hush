import * as jose from "jose";
import ms from "ms";
import User from "../entities/user";
import sessionRepository from "../repositories/session.repository";
import { generateHash } from "../utils/string";
import env from "../lib/env";
export class JwtService {


  async sign(user: User) {
    let access_token = ''
    let refresh_token = generateHash(64)
    const payload = { id: user.id }

    access_token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode(env.get('JWT_SECRET')))

    await sessionRepository.create({
      user_ip: 'some',
      user_id: user.id,
      refresh_token,
      user_agent: 'randomuseragent',
      created_by: user.id
    })
    return {
      access_token, refresh_token,
      access_token_expiry: new Date(Date.now() + ms('1d')),
      refresh_token_expiry: new Date(Date.now() + ms('15d'))
    };
  }

}

export default new JwtService();