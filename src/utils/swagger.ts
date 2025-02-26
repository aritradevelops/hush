import { getMetadataStorage } from 'class-validator-custom-errors';
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import fs from "fs";
import path from "path";
import strTemp from "string-template";
import yaml from "yaml";
import { methodMap } from "../decorators/method";
import db from "../lib/db";
import router from "./router";
import { camelToKebab } from "./string";
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

interface SwaggerDoc {
  paths: Record<string, unknown>;
  components: { schemas: Record<string, object>; };
}
export class Swagger {
  templates: Record<string, string> = {};
  constructor() {
    const templates = fs.readdirSync(path.resolve(process.cwd(), "swagger-templates"), { withFileTypes: true });
    for (const type of templates) {
      if (type.isFile() && type.name.endsWith(".yml")) {
        this.templates[type.name.replace(".yml", "")] = fs.readFileSync(path.resolve(process.cwd(), "swagger-templates", type.name), { encoding: "utf8" });
      }
    }
  }
  compile(action: string, meta: { route: string, entity: string; method: string; }) {
    if (!this.templates[action]) return null;
    return yaml.parse(
      strTemp(
        this.templates[action],
        { ...meta, id: "id" }
      )
    ) as Record<string, object>;
  }
  static generate() {
    const swagger = new Swagger();
    const existingDoc: SwaggerDoc = yaml.parse(fs.readFileSync(path.resolve(process.cwd(), 'docs', 'swagger.yml'), { encoding: 'utf8' }));
    const reservedKeys = [
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toString',
      'valueOf',
      'toLocaleString'
    ];
    const allSchemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      // @ts-ignore
      classValidatorMetadataStorage: getMetadataStorage()
    });
    const entities = db.entities();
    const filterSchemas: typeof allSchemas = {};
    for (const entity of entities) {
      filterSchemas[entity] = allSchemas[entity];
    }
    const paths = existingDoc.paths;
    for (const [route, handler] of router.routes) {
      const properties: string[] = [];
      let proto = handler.constructor.prototype;
      while (proto) {
        properties.push(...Reflect.ownKeys(proto) as string[]);
        proto = Object.getPrototypeOf(proto);
      }
      const actions = properties.filter(key => !key.startsWith('_') && !reservedKeys.includes(key)).map(e => camelToKebab(e));
      for (const action of actions) {
        const meta = {
          route,
          entity: handler.constructor.name.replace('Controller', ''),
          method: methodMap.get(`${handler.constructor.name}_${action}`) || methodMap.get(`${Object.getPrototypeOf(handler.constructor).name}_${action}`) as string
        };
        meta.method = (meta.method || 'POST').toLowerCase();
        const path = swagger.compile(action, meta);
        if (path && !paths[Object.keys(path)[0]]) {
          Object.assign(paths, path);
        }
      }
    }
    Object.assign(existingDoc.components.schemas, filterSchemas);
    fs.writeFileSync(path.resolve(process.cwd(), 'docs', 'swagger.yml'), yaml.stringify(existingDoc));
  }
}