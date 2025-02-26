import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import env from "../lib/env";
import { UnauthenticatedError } from "../errors/http/unauthenticated.error";

const publcRoutes = ['auth_sign-in', 'auth_sign-up', 'auth_verify-email']
export const isAuth = () => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const identifier = req.params.module + '_' + req.params.action
    if (publcRoutes.includes(identifier)) {
      return next();
    }
    const accessToken = req.cookies.access_token
    try {
      const verified = await jwtVerify(accessToken, Buffer.from(env.get('JWT_SECRET')), {
        algorithms: ['HS256']
      })
      // @ts-ignore
      req.user = {
        scope: 'ROOT',
        ...verified.payload
      }
    } catch (err) {
      if (req.url.startsWith('/v1')) throw new UnauthenticatedError()
      else res.redirect('/login')
      return
    }
    return next();
  };
};
