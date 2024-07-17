import { DBInstance } from "./DB";
import Document from "./Document";
import extractKey from "./extractKey";
import { DocumentData, NestedKeyOf, Operator } from "./types";

/**
 *
 *
 */
export default class Query<T extends DocumentData> {
  private uniquePath: string;
  private _db: DBInstance;
  private _filters: any[] = [];

  /**
   *
   * @param db
   * @param path
   * @param filters
   */
  constructor(db: DBInstance, path: string, filters: any[] = []) {
    this._filters = [...this._filters, ...filters];

    this.uniquePath = path;
    this._db = db;
  }

  /**
   * @returns {boolean} Returns true if query is empty
   */
  get empty(): boolean {
    return this.docs.length === 0;
  }

  /**
   *
   */
  get filters() {
    return this._filters;
  }

  /**
   *
   */
  get count() {
    return this.docs.length;
  }

  /**
   *
   */
  get docs(): Document<T>[] {
    const array: Document<T>[] = [];
    const collection = this._db.collections[this.path];

    if (typeof collection === "undefined") return [];

    const docs = collection.docs;

    if (this.filters.length === 0) return docs;

    if (this._filters.length > 0) {
      docs.forEach((doc) => {
        if (this.isValidDoc(doc.data)) {
          array.push(doc);
        }
      });
    }

    return array;
  }

  /**
   *
   * @param key
   * @param operator
   * @param value
   */
  where<E extends NestedKeyOf<T>>(key: E, operator: Operator, value: any) {
    return new Query<T>(this._db, this.path, [...this._filters, { key, operator, value }]);
  }

  /**
   *
   * @param callback
   */
  on(callback: (snapshot: Query<T>) => void) {
    callback(this);

    return this._db.addListener(this, callback);
  }

  /**
   *
   */
  isValidDoc(documentData: Document<T>["data"]): boolean {
    for (const filter of this.filters) {
      const isValid = isValidFilter(documentData, filter.key, filter.operator, filter.value);

      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  /**
   *
   */
  get path() {
    return this.uniquePath;
  }
}

/**
 *
 */
function isValidFilter(data: Record<string, any>, key: string, operator: Operator, value: any): boolean {
  const extracted = extractKey(data, key);
  if (typeof extracted === "undefined" || extracted === null) {
    return false;
  }

  if (operator === "==") {
    if (extracted !== value) {
      return false;
    }
  }

  if (operator === "<") {
    if (extracted >= value) {
      return false;
    }
  }

  if (operator === ">") {
    if (extracted <= value) {
      return false;
    }
  }

  if (operator === "<=") {
    if (extracted > value) {
      return false;
    }
  }

  if (operator === ">=") {
    if (extracted < value) {
      return false;
    }
  }

  if (operator === "has") {
    if (typeof extracted === "string" || Array.isArray(extracted)) {
      if (extracted.includes(value) === false) {
        return false;
      }
    }

    if (typeof extracted === "object" && !Array.isArray(extracted)) {
      if (typeof extracted[value] === "undefined") {
        return false;
      }
    }
  }

  if (operator === "!has") {
    if (typeof extracted === "string" || Array.isArray(extracted)) {
      if (extracted.includes(value)) {
        return false;
      }
    }

    if (typeof extracted === "object" && !Array.isArray(extracted)) {
      if (typeof extracted[value] !== "undefined") {
        return false;
      }
    }
  }

  return true;
}
