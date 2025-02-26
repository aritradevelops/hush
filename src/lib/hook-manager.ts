import { Request, Response } from 'express';
import * as inflection from 'inflection';
import fs from 'node:fs/promises';
import path from 'node:path';
import { kebabToCamel, kebabToPascal, pascalToKebab } from '../utils/string';
import env from './env';
import { routeMap } from '../decorators/route';
export abstract class Hook {
  abstract before(req: Request, res: Response, data: any): void | Promise<void>;
  abstract after(req: Request, res: Response, data: any): void | Promise<void>;
}
class HookManager {
  private hooks: Record<string, Hook> = {};
  async init() {
    const files = await fs.readdir(path.resolve(process.cwd(), `./${env.get('ROOT')}/hooks`), { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const module: Record<string, any> = await import(path.resolve(process.cwd(), `${env.get('ROOT')}/hooks`, file.name));
        for (const action in module) {
          if (typeof module[action] === 'function'
            && (Object.getPrototypeOf(module[action]) === Hook
              || Object.getPrototypeOf(Object.getPrototypeOf(module[action])) === Hook)
          ) {
            this.hooks[`${routeMap.get(kebabToPascal(file.name.replace('.hook.ts', '-controller'))) || inflection.pluralize(file.name.replace('.hook.ts', ''))}.${pascalToKebab(action)}`] = new module[action]();
          }
        }
      }
    }
  }
  async trigger(type: 'before' | 'after', req: Request, res: Response, data?: any) {
    if (this.hooks[`${req.params.module}.${req.params.action || 'list'}`]) {
      await this.hooks[`${req.params.module}.${req.params.action || 'list'}`][type](req, res, data);
    }
  }
}
export default new HookManager();