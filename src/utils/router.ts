import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { pluralize } from "inflection";
import path from "path";
import Bind from "../decorators/bind";
import { methodMap } from "../decorators/method";
import { routeMap } from "../decorators/route";
import { MethodNotAllowedError } from "../errors/http/method-not-allowed.error";
import { NotFoundError } from "../errors/http/not-found.error";
import Controller from "../lib/controller";
import env from "../lib/env";
import hookManager from "../lib/hook-manager";
import { camelToKebab, kebabToCamel, pascalToCamel } from "../utils/string";
import logger from "./logger";
export class Router {
  protected store = new Map<string, Controller>();
  constructor() {
    try {
      const files = fs.readdirSync(path.resolve(process.cwd(), `./${env.get('ROOT')}/controllers`), { withFileTypes: true });
      for (const file of files) {
        if (file.isFile() && file.name.endsWith(`controller.${env.get('EXT')}`)) {
          const { default: controller }: { default: Controller; } = require(
            path.resolve(process.cwd(), `${env.get('ROOT')}/controllers`, file.name)
          );
          this.store.set(
            routeMap.get(controller.constructor.name) ||
            pluralize(camelToKebab(pascalToCamel(controller.constructor.name.replace('Controller', '')))),
            controller,
          );
        }
      }
    } catch (error) {
      logger.error(error);
    }
  }
  @Bind
  async handle(req: Request, res: Response, next: NextFunction) {
    try {
      const route = req.params.module;
      const action = kebabToCamel(req.params.action || "list");
      const controller = this.store.get(route);

      if (!controller || !controller[action as keyof Controller] ||
        typeof controller[action as keyof Controller] !== "function"
      ) throw new NotFoundError();
      if (
        req.method !== methodMap.get(`${controller.constructor.name}_${action}`) &&
        req.method !== methodMap.get(`${Object.getPrototypeOf(controller.constructor).name}_${action}`)
      )
        throw new MethodNotAllowedError();
      await hookManager.trigger('before', req, res, null);
      // @ts-ignore
      const result = await controller[action as keyof Controller](req, res);
      await hookManager.trigger('after', req, res, result);
      res.json(result);
    } catch (error) {
      next(error)
    }
  }

  get routes() {
    return this.store;
  }
}
export default new Router();