import bcrypt from "bcrypt";
import crypto from "crypto";
/**
 * Converts PascalCase to camelCase.
 * @param str - The PascalCase string to convert.
 * @returns The converted camelCase string.
 */
export const pascalToCamel = (str: string): string =>
  str.charAt(0).toLowerCase() + str.slice(1);

/**
 * Converts PascalCase to kebab-case.
 * @param str - The PascalCase string to convert.
 * @returns The converted kebab-case string.
 */
export const pascalToKebab = (str: string): string =>
  str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Converts PascalCase to snake_case.
 * @param str - The PascalCase string to convert.
 * @returns The converted snake_case string.
 */
export const pascalToSnake = (str: string): string =>
  str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

/**
 * Converts camelCase to kebab-case.
 * @param str - The camelCase string to convert.
 * @returns The converted kebab-case string.
 */
export const camelToKebab = (str: string): string =>
  str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Converts camelCase to PascalCase.
 * @param str - The camelCase string to convert.
 * @returns The converted PascalCase string.
 */
export const camelToPascal = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Converts camelCase to snake_case.
 * @param str - The camelCase string to convert.
 * @returns The converted snake_case string.
 */
export const camelToSnake = (str: string): string =>
  str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

/**
 * Converts kebab-case to PascalCase.
 * @param str - The kebab-case string to convert.
 * @returns The converted PascalCase string.
 */
export const kebabToPascal = (str: string): string =>
  str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

/**
 * Converts kebab-case to camelCase.
 * @param str - The kebab-case string to convert.
 * @returns The converted camelCase string.
 */
export const kebabToCamel = (str: string): string => {
  const pascalCase = kebabToPascal(str);
  return pascalToCamel(pascalCase);
};

/**
 * Converts kebab-case to snake_case.
 * @param str - The kebab-case string to convert.
 * @returns The converted snake_case string.
 */
export const kebabToSnake = (str: string): string =>
  str.replace(/-/g, '_');

/**
 * Converts snake_case to PascalCase.
 * @param str - The snake_case string to convert.
 * @returns The converted PascalCase string.
 */
export const snakeToPascal = (str: string): string =>
  str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

/**
 * Converts snake_case to camelCase.
 * @param str - The snake_case string to convert.
 * @returns The converted camelCase string.
 */
export const snakeToCamel = (str: string): string => {
  const pascalCase = snakeToPascal(str);
  return pascalToCamel(pascalCase);
};

/**
 * Converts snake_case to kebab-case.
 * @param str - The snake_case string to convert.
 * @returns The converted kebab-case string.
 */
export const snakeToKebab = (str: string): string =>
  str.replace(/_/g, '-');

export const hash = (str: string): string => bcrypt.hashSync(str, 10)

export const generateHash = (bytes: number) => crypto.randomBytes(bytes).toString("hex")