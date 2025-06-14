export class ObjectSet<T> {
  private map: Map<string, T>;

  constructor(initial: T[] = [], private getId: (item: T) => string) {
    this.map = new Map(initial.map(item => [getId(item), item]));
  }

  add(item: T) {
    this.map.set(this.getId(item), item);
  }

  addMany(items: T[]) {
    for (const item of items) {
      this.add(item);
    }
  }

  toArray(): T[] {
    return Array.from(this.map.values());
  }

  has(item: T): boolean {
    return this.map.has(this.getId(item));
  }

  size(): number {
    return this.map.size;
  }
}
