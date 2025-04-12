import * as inflection from 'inflection';
import { confirm } from '@inquirer/prompts';
import { pascalToCamel, pascalToKebab, pascalToSnake } from '../../src/utils/string';
import logger from '../../src/utils/logger';
import path from 'path';
import fs from 'fs';
const ITEMS = ['entity', 'repository', 'service', 'controller', 'hook'] as const;

const templates: Record<typeof ITEMS[number], (moduleName: string) => string> = {
  controller: (moduleName: string) => `
import ${moduleName} from "../entities/${pascalToKebab(moduleName)}";
import ${pascalToCamel(moduleName)}Service, { ${moduleName}Service } from "../services/${pascalToKebab(moduleName)}.service";
import CrudController from "../utils/crud-controller";
export class ${moduleName}Controller extends CrudController<typeof ${moduleName}, ${moduleName}Service> {
  constructor() {
    super(${pascalToCamel(moduleName)}Service, ${moduleName});
  }
};
export default new ${moduleName}Controller();
  `,
  entity: (moduleName: string) => `
import { Trim } from "class-sanitizer";
import { Expose } from "class-transformer";
import { IsString, MinLength } from "class-validator-custom-errors";
import { Column, Entity } from "typeorm";
import Searchable from "../decorators/searchable";
import { PrimaryColumns } from "../lib/primary-columns";

@Entity({ name: '${inflection.pluralize(pascalToSnake(moduleName))}' })
export default class ${moduleName} extends PrimaryColumns {
  @Expose()
  @IsString()
  @MinLength(3)
  @Trim()
  @Searchable()
  @Column()
  title!: string;
}
  `,
  service: (moduleName: string) => `
import ${pascalToCamel(moduleName)}Repository, { ${moduleName}Repository } from "../repositories/${pascalToKebab(moduleName)}.repository";
import CrudService from "../utils/crud-service";

export class ${moduleName}Service extends CrudService<${moduleName}Repository> {
  constructor() {
    super(${pascalToCamel(moduleName)}Repository);
  }
}
export default new ${moduleName}Service();
  `,
  repository: (moduleName: string) => `
import ${moduleName} from "../entities/${pascalToKebab(moduleName)}";
import { Repository } from "../lib/repository";

export class ${moduleName}Repository extends Repository<typeof ${moduleName}> {
  constructor() {
    super(${moduleName});
  }
};
export default new ${moduleName}Repository();
  `,
  hook: (modelName: string) => `
import { Request, Response } from 'express';
import { Hook } from "../lib/hook-manager";
import logger from "../utils/logger";

class ${modelName}Hook extends Hook {
  before(req: Request, res: Response, data: any): void {
    // logger.info("I was called before");
  }
  after(req: Request, res: Response, data: any): void {
    // logger.info("I was called after", data);
  }
}
export class List extends ${modelName}Hook { }
export class View extends ${modelName}Hook { }
export class Create extends ${modelName}Hook { }
export class Update extends ${modelName}Hook { }
export class Delete extends ${modelName}Hook { }
export class Destroy extends ${modelName}Hook { }
export class Restore extends ${modelName}Hook { }
  `
};
/**
 * 
 * @param moduleName {uuid} - The name of the module to generate the CRUD for
 */
export async function generateCRUD(moduleName: string) {
  const kebabCaseName = pascalToKebab(moduleName);

  for (const item of ITEMS) {
    const templateContent = templates[item](moduleName);
    const pluralizedDir = inflection.pluralize(item);
    const fileSuffix = item !== 'entity' ? `.${item}` : '';
    const fileName = `${kebabCaseName}${fileSuffix}.ts`;
    const filePath = path.join('./', 'src', pluralizedDir, fileName);

    logger.info(`Generating ${item} for module: ${moduleName}`);
    logger.notice(`Target file path: ${filePath}`);


    try {
      const fileExists = fs.existsSync(filePath);
      if (fileExists) {
        logger.critical(`File already exists: ${fileName}`);
        const shouldOverwrite = await confirm({
          message: `File "${fileName}" already exists. Overwrite?`,
          default: false,
        });
        if (!shouldOverwrite) {
          logger.warning(`Skipped generating ${item} for ${moduleName}.`);
          continue;
        }
      }

      await fs.writeFileSync(filePath, templateContent);
      logger.info(`Generated ${item} successfully: ${fileName}`);
    } catch (error) {
      logger.error(`Error while processing ${item} for ${moduleName}: ${(error as Error).message}`);
    }
  }
}
