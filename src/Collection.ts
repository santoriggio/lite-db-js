import { DBInstance } from "./DB";
import Document from "./Document";
import generateUID from "./generateUID";
import Query from "./Query";
import { DocumentData } from "./types";

export default class Collection<
  T extends DocumentData = DocumentData,
> extends Query<T> {
  private _id: string;
  private _hashmap: Record<string, Document<T>> = {};
  private _docs: Document<T>[] = [];

  /**
   *
   * @param db
   * @param id
   */
  constructor(
    private db: DBInstance,
    id: string,
  ) {
    super(db, id);

    this._id = id;
  }

  /**
   *
   * @param id
   */
  doc<E extends T>(id: string): Document<E | T> {
    if (this._hashmap[id]) {
      return this._hashmap[id];
    }

    const document = new Document<T>(this.db, id, this._id);

    this.db.collections[this._id].docs.push(document);
    this._hashmap[id] = document;
    this.db.onAdd(document);

    return document;
  }

  /**
   *
   * @param doc
   */
  deleteDoc(doc: Document<T>) {
    if (typeof this._hashmap[doc.id] !== "undefined") {
      delete this._hashmap[doc.id];

      this._docs = this._docs.filter((item) => item.id !== doc.id);

      this.db.onDelete(doc);
    }
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
  get docs() {
    return this._docs;
  }

  /*
   * constructor(id: string) {
   *   super();
   *   this._id = id;
   */

  // }

  /**
   *
   * @param data
   */
  add(data: T | T[]) {
    const coll = this.db.collections[this._id];

    /*
     * Aggiungi logica per aggiungere documenti come desiderato
     * Questo è solo un esempio
     */
    if (Array.isArray(data)) {
      const added: Document<T>[] = [];

      data.forEach((item) => {
        const uniqueId = item.id || generateUID();

        if (typeof this._hashmap[uniqueId] !== "undefined") {
          this._hashmap[uniqueId].update(item);
        } else {
          const document = new Document<T>(this.db, uniqueId, this._id, item);

          coll.docs.push(document);
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

        coll.docs.push(document);
        this._hashmap[uniqueId] = document;
        this.db.onAdd(document);
      }
    }
  }

  /*
   * doc(id: string) {
   *   if (typeof this._hashmap[id] !== "undefined") {
   *     return this._hashmap[id];
   *   } else {
   *     const newDoc = new Document<T>(id);
   *     this._hashmap[id] = newDoc;
   *     this._docs.push(newDoc);
   *     return newDoc;
   *   }
   * }
   */

  /*
   * get id() {
   *   return this._id;
   * }
   */

  /*
   * get docs() {
   *   return this._docs;
   * }
   */

  /*
   * get empty() {
   *   return this._empty;
   * }
   */
}
