import * as inflection from 'inflection';
import { pascalToKebab } from '../../src/utils/string';
import logger from '../../src/utils/logger';
import path from 'path';
import { unlink } from 'fs/promises';
import fs from 'fs';
const ITEMS = ['entity', 'repository', 'service', 'controller', 'hook'] as const;

export async function removeCRUD(moduleName: string) {
  const kebabCaseName = pascalToKebab(moduleName);

  for (const item of ITEMS) {
    const pluralizedDir = inflection.pluralize(item);
    const fileSuffix = item !== 'entity' ? `.${item}` : '';
    const fileName = `${kebabCaseName}${fileSuffix}.ts`;
    const filePath = path.join('./', 'src', pluralizedDir, fileName);

    logger.info(`Deleting ${item} for module: ${moduleName}`);
    logger.notice(`Target file path: ${filePath}`);

    try {
      const fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        logger.warning(`File does not exist: ${fileName}. Skipping.`);
        continue;
      }

      await unlink(filePath);
      logger.info(`Deleted ${item} successfully: ${fileName}`);
    } catch (error) {
      logger.error(`Error while deleting ${item} for ${moduleName}: ${(error as Error).message}`);
    }
  }
}
