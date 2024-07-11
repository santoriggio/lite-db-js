import { DBInstance } from "./DB";
import Document from "./Document";
import generateUID from "./generateUID";
import Query from "./Query";
import { DocumentData } from "./types";

/**
 * Collection
 * @template T
 */
export default class Collection<T extends DocumentData = DocumentData> extends Query<T> {
  private _id: string;
  private _hashmap: Record<string, Document<T>> = {};
  private _docs: Document<T>[] = [];

  /**
   * @param {DBInstance} db Database
   * @param {string} id Collection id
   */
  constructor(
    private db: DBInstance,
    id: string,
  ) {
    super(db, id);
    this._id = id;
  }

  /**
   * @param {string} id Document id
   * @returns {Document<T>} Document
   */
  doc<E extends T>(id: string): Document<E | T> {
    if (this._hashmap[id]) {
      return this._hashmap[id];
    }

    const document = new Document<T>(this.db, id, this._id);

    this._docs.push(document);
    this._hashmap[id] = document;
    this.db.onAdd(document);

    return document;
  }

  /**
   * @param {Document<T>} doc Document
   */
  deleteDoc(doc: Document<T>) {
    if (typeof this._hashmap[doc.id] !== "undefined") {
      delete this._hashmap[doc.id];

      this._docs = this._docs.filter((item) => item.id !== doc.id);

      this.db.onDelete(doc);
    }
  }

  /**
   * @returns {string} Id
   */
  get id(): string {
    return this._id;
  }

  /**
   * @returns {Document<T>[]} Docs list
   */
  get docs(): Document<T>[] {
    return this._docs;
  }

  /**
   *
   * @param {T | T[]} data Data
   */
  add(data: T | T[]) {
    const documents = this._docs;
    if (Array.isArray(data)) {
      const added: Document<T>[] = [];

      data.forEach((item) => {
        const uniqueId = item.id || generateUID();

        if (typeof this._hashmap[uniqueId] !== "undefined") {
          this._hashmap[uniqueId].update(item);
        } else {
          const document = new Document<T>(this.db, uniqueId, this._id, item);

          documents.push(document);
          this._hashmap[uniqueId] = document;
          added.push(document);
        }
      });

      this.db.onAdd(added);
    } else {
      const uniqueId = data.id || generateUID();

      if (typeof this._hashmap[uniqueId] !== "undefined") {
        this._hashmap[uniqueId].update(data);
      } else {
        const document = new Document<T>(this.db, uniqueId, this._id, data);
        documents.push(document);
        this._hashmap[uniqueId] = document;
        this.db.onAdd(document);
      }
    }
  }
}
