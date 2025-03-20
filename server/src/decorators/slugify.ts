
/**
 * Map <tableName, [column, onColumn, isUnique][]>
 * @see It can be called in only one column
 */
export const slugMap = new Map<string, [string, string, boolean][]>();


export default function Slugify(on: string, options?: { unique?: boolean }) {
  return function (target: any, fieldName: string) {
    const tableName = target.constructor.name;
    if (slugMap.has(tableName)) {
      slugMap.get(tableName)!.push([fieldName, on, options?.unique ?? false]);
    } else {
      slugMap.set(tableName, [[fieldName, on, options?.unique ?? false]]);
    }
  }
}