import { DocumentData, Document } from "./types";
import { DBInstance } from "./DB";

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
  }

  /**
   * Delete document
   */
  delete() {
    this.documentData = undefined;

    const collectionId = this.uniquePath.split("/").slice(0, -1).join("/");
    this.db.collections[collectionId].deleteDoc(this);
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
    if (typeof this.documentData === "object" && Object.keys(this.documentData).length === 0) {
      return false;
    }
    if (this.documentData === null) return false;

    return true;
  }

  /**
   * @returns {T} Return T if document.esists === true
   */
  get data(): T | null {
    return this.exists ? (this.documentData as T) : null;
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
