import * as cookie from "cookie";
import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { Socket } from "socket.io";
import { UnauthenticatedError } from "../errors/http/unauthenticated.error";
import { UnauthorizedError } from "../errors/http/unauthorized.error";
import env from "../lib/env";
import { userPermissions } from "../lib/permissions";
import logger from "../utils/logger";
// TODO: handle this via decorator
const publicRoutes = ['auth_sign-in', 'auth_sign-up', 'auth_verify-email', 'auth_forgot-password', 'auth_reset-password', 'auth_refresh', 'oauth_callback']
export const isAuthRequest = () => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const identifier = req.params.module + '_' + req.params.action
    if (publicRoutes.includes(identifier)) {
      // @ts-ignore
      req.user = {
        scope: 'ALL'
      }
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
      const scope = userPermissions[`${req.params.module}_${req.params.action}`]
      if (!scope) throw new UnauthorizedError()
      // @ts-ignore
      req.user = {
        scope,
        ...verified.payload
      }
    } catch (err) {
      return next(err as Error)
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