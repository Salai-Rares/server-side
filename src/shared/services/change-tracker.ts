export class ChangeTracker<T, K extends keyof T> {
  private changedFields = new Set<K>();

  mark(field: K) {
    this.changedFields.add(field);
  }

  toUpdate(obj: T): Partial<Pick<T, K>> {
    const updates: Partial<Pick<T, K>> = {};
    for (const key of this.changedFields) {
      updates[key] = obj[key];
    }
    return updates;
  }

  clear() {
    this.changedFields.clear();
  }

  hasChanges(): boolean {
    return this.changedFields.size > 0;
  }
}
