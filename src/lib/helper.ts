
export type ValueOf<T> = T[keyof T];
export type AnyObj<T = unknown> = Record<string, T>;
// export type NestedKeyOf<O extends Schema> = { [key in keyof O]: O[key] extends AnyObj ? `${string & key}.${string & NestedKeyOf<O[key]>}` : key }[keyof O];
export function mapToString(map: Map<string, unknown>) {
  return JSON.stringify(map, (key, value) => (value instanceof Map ? [...value] : value));
}