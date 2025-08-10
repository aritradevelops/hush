import { RequestHandler } from "express";
import logger from "../utils/logger";


export function requestLogger(): RequestHandler {
  return async function (req, res, next) {
    const startTime = process.hrtime()
    res.once('finish', () => {
      const diff = process.hrtime(startTime)
      logger.http(req, res, diff[0] * 1e3 + diff[1] * 1e-6)
    })
    next()
  }
}