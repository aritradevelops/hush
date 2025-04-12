import { NextFunction, Request, Response } from "express";
import { AssertionError } from "node:assert";
import { HttpError } from "../errors/http.error";
import { InternalServerError } from "../errors/http/internal-server.error";
import logger from "../utils/logger";
import { pascalToKebab } from "../utils/string";
import { QueryFailedError } from "typeorm";
import { BadRequestError } from "../errors/http/bad-request.error";
export const defaultErrors = [AssertionError, RangeError, ReferenceError, SyntaxError, TypeError];

const errorHandler = () =>
  (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    console.log(err)
    switch (true) {
      case err instanceof HttpError: {
        res.status(err.status)
        res.json({
          message: err.message || req.t(`errors.${pascalToKebab(err.constructor.name.replace('Error', ''))}`),
          errors: err.render(),
          ...(req.query.debug === 'yes' &&
            { devResponse: err.stack, devErrorCode: err.devErrorCode })
        });
        break;
      }
      case err instanceof QueryFailedError: {
        // TODO: create a special class to handle database errors
        // @ts-ignore
        if (err.code === "23505") {
          // @ts-ignore
          err = new BadRequestError(req.t('db.isUnique', { key: err.detail.match(/\((.*?)\)/)?.[1] }))
        } else {
          err = new InternalServerError(req.t('errors.internal-server'))
        }
        res.status(err.status)
        res.json({
          message: err.message,
          errors: err.render(),
          ...(req.query.debug === 'yes' &&
            { devResponse: err.stack, devErrorCode: err.devErrorCode })
        })
        break;
      }
      // TODO: handle axios error
      case err.constructor && defaultErrors.includes(err.constructor):
      // fall through
      default: {
        const err = new InternalServerError();
        res.status(err.status)
        res.json({
          message: req.t(`errors.${pascalToKebab(err.constructor.name.replace('Error', ''))}`),
          errors: err.render(),
          ...(req.query.debug === 'yes' &&
            { devResponse: err.stack, devErrorCode: err.devErrorCode })
        });
        break;
      }
    }
  };

export default errorHandler;