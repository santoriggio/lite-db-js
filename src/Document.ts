import { DBInstance } from "./DB";
import { DocumentData } from "./types";

export default class Document<T extends DocumentData> {
  private _id: string;
  private _path: string;
  private _data: T;
  private _db: DBInstance;

  /**
   *
   * @param db
   * @param id
   * @param collection
   * @param data
   */
  constructor(db: DBInstance, id: string, collection: string, data?: T) {
    this._id = id;
    this._data = data;
    this._path = collection;
    this._db = db;
  }

  /**
   *
   * @param data
   */
  set(data: T) {
    const prev = this._data;

    this._data = data;
    this._db.onEdit(prev, this);
  }

  /**
   *
   * @param data
   */
  update(data: Partial<T>) {
    const prev = this._data;

    this._data = {
      ...this._data,
      ...data,
    };

    this._db.onEdit(prev, this);
  }

  /**
   *
   */
  delete() {
    this._data = undefined;

    this._db.collections[this._path].deleteDoc(this);
  }

  /**
   *
   * @param callback
   */
  on(callback: (snapshot: Document<T>) => void) {
    callback(this);

    return this._db.addDocListener(this, callback);
  }

  /**
   *
   */
  get exists() {
    if (typeof this._data === "undefined") return false;
    if (
      typeof this._data === "object" &&
      Object.keys(this._data).length === 0
    ) {
      return false;
    }
    if (this._data === null) return false;

    return true;
  }

  /**
   *
   */
  get data(): T {
    return this.exists ? this._data : undefined;
  }

  /**
   *
   */
  get id() {
    return this._id;
  }

  /**
   *
   */
  get path() {
    return this._path;
  }
}
