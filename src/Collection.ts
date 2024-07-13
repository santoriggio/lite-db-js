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
  private hashmap: Record<string, Document<T>> = {};
  private documents: Document<T>[] = [];

  /**
   * @param {DBInstance} db Database
   * @param {string} path Collection path
   */
  constructor(
    private db: DBInstance,
    path: string,
  ) {
    super(db, path);
  }

  /**
   * @param {string} id Document id
   * @returns {Document<T>} Document
   */
  doc<E extends T>(id: string): Document<E | T> {
    if (this.hashmap[id]) {
      return this.hashmap[id];
    }

    const document = new Document<T>(this.db, id, this.path);

    this.documents.push(document);
    this.hashmap[id] = document;
    this.db.onAdd(document);

    return document;
  }

  /**
   * Delete document from collection
   * @param {Document<T>} doc Document
   */
  deleteDoc(doc: Document<T>) {
    if (typeof this.hashmap[doc.id] !== "undefined") {
      delete this.hashmap[doc.id];

      this.documents = this.documents.filter((item) => item.id !== doc.id);

      this.db.onDelete(doc);
    }
  }

  /**
   * @returns {Document<T>[]} Docs list
   */
  get docs(): Document<T>[] {
    return this.documents;
  }

  /**
   *
   * @param {T | T[]} data Data
   */
  add(data: T | T[]) {
    const documents = this.documents;
    if (Array.isArray(data)) {
      const added: Document<T>[] = [];

      data.forEach((item) => {
        const uniqueId = item.id || generateUID();

        if (typeof this.hashmap[uniqueId] !== "undefined") {
          this.hashmap[uniqueId].update(item);
        } else {
          const document = new Document<T>(this.db, uniqueId, this.path, item);

          documents.push(document);
          this.hashmap[uniqueId] = document;
          added.push(document);
        }
      });

      this.db.onAdd(added);
    } else {
      const uniqueId = data.id || generateUID();

      if (typeof this.hashmap[uniqueId] !== "undefined") {
        this.hashmap[uniqueId].update(data);
      } else {
        const document = new Document<T>(this.db, uniqueId, this.path, data);
        documents.push(document);
        this.hashmap[uniqueId] = document;
        this.db.onAdd(document);
      }
    }
  }

  /**
   * Clear collection
   */
  clear(): void {
    this.documents = [];
    this.hashmap = {};
  }
}
