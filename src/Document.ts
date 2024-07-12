import { DBInstance } from "./DB";
import { DocumentData, Document } from "./types";

/**
 * @template T
 * @implements {Document<T>}
 */
export default class DocumentReference<T extends DocumentData> implements Document<T> {
  private uniqueId: string;
  private uniquePath: string;
  private documentData: T | undefined;

  /**
   * @param {DBInstance} db Database Instance
   * @param {string} id document Id
   * @param {string} collection Collection path
   * @param {T} data Document initial Data
   */
  constructor(
    private db: DBInstance,
    id: string,
    collection: string,
    data?: T,
  ) {
    this.uniqueId = id;
    this.uniquePath = `${collection}/${id}`;
    this.documentData = data;
  }

  /**
   * Set new document data
   * @param {T} data Document data
   */
  set(data: T) {
    const prev = this.documentData;

    this.documentData = data;
    this.db.onEdit(prev, this);
  }

  /**
   * Update existing document data with merge
   * @param {Partial<T>} data Document updated data
   */
  update(data: Partial<T>) {
    const prev = this.documentData;

    if (typeof this.documentData !== "undefined") {
      this.documentData = {
        ...this.documentData,
        ...data,
      };

      this.db.onEdit(prev, this);
    }

    if (typeof this.documentData === "undefined") {
      this.set(data as T);
    }
  }

  /**
   * Delete document
   */
  delete() {
    const collectionPath = this.uniquePath.split("/").slice(0, -1).join("/");

    if (typeof this.db.collections[collectionPath] !== "undefined") {
      this.db.collections[collectionPath].deleteDoc(this);
    }
  }

  /**
   * Add listener on change of the document
   * @param {(snapshot: Document<T>)=> void} callback Function to be called on change document
   * @returns {()=> void} remove function
   */
  on(callback: (snapshot: Document<T>) => void): () => void {
    callback(this);

    return this.db.addDocListener(this, callback);
  }

  /**
   * @returns {boolean} Return true is document is not empty
   */
  get exists(): boolean {
    if (typeof this.documentData === "undefined") return false;

    return this.db.docExists(this.uniquePath);
  }

  /**
   * @returns {T} Return T
   */
  get data(): T | undefined {
    return this.documentData;
  }

  /**
   * @returns {string} id
   */
  get id(): string {
    return this.uniqueId;
  }

  /**
   * @returns {string} Document Path
   */
  get path(): string {
    return this.uniquePath;
  }
}
