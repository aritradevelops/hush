type Weight = "A" | "B" | "C" | "D";
export const searchMap = new Map<string, [string, boolean, Weight][]>();

export default function Searchable({ coalesce, weight } = { coalesce: false, weight: "D" as Weight }) {
  return function (target: any, field: string) {
    const tableName = target.constructor.name;
    if (searchMap.has(tableName)) {
      searchMap.get(tableName)!.push([field, coalesce, weight]);
    } else {
      searchMap.set(tableName, [[field, coalesce, weight]]);
    }
  };
}
