import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import env from "../lib/env";
import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import { UUID } from "node:crypto";
import { Socket } from "socket.io";
import * as cookie from "cookie";
import logger from "../utils/logger";
// TODO: handle this via decorator
const publcRoutes = ['auth_sign-in', 'auth_sign-up', 'auth_verify-email', 'auth_forgot-password', 'auth_reset-password', 'oauth_callback']
export const isAuthRequest = () => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const identifier = req.params.module + '_' + req.params.action
    if (publcRoutes.includes(identifier)) {
      return next();
    }
    let accessToken = req.cookies.access_token
    if (!accessToken) {
      accessToken = req.headers['authorization']?.split(' ')[1]
    }
    try {
      if (!accessToken) throw new UnauthenticatedError()
      const verified = await jwtVerify(accessToken, Buffer.from(env.get('JWT_SECRET')), {
        algorithms: ['HS256']
      })
      // @ts-ignore
      req.user = {
        scope: 'ROOT',
        ...verified.payload
      }
    } catch (err) {
      if (req.url.startsWith('/v1')) next(new UnauthenticatedError())
      else res.redirect('/login')
      return
    }
    return next();
  };
};
export const isAuthSocket = async (socket: Socket, next: (err?: Error) => void) => {

  // @ts-ignore
  if (socket.user) return next()
  let cookieStr = socket.request.headers.cookie
  let accessToken: string | undefined
  if (cookieStr) {
    accessToken = cookie.parse(cookieStr).access_token
  } else {
    accessToken = socket.request.headers['authorization']?.split(' ')[1]
  }
  try {
    if (!accessToken) throw new UnauthenticatedError()
    const verified = await jwtVerify(accessToken, Buffer.from(env.get('JWT_SECRET')), {
      algorithms: ['HS256']
    })
    // @ts-ignore
    socket.user = {
      ...verified.payload
    }
    return next()
  } catch (err) {
    socket.disconnect()
    logger.error(err)
    return next(err as Error)
  }
};