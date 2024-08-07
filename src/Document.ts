import { DBInstance } from "./DB";
import { DocumentData } from "./types";

/**
 * @template T
 */
export default class Document<T extends DocumentData> {
  private collectionPath: string;
  private uniqueId: string;
  private uniquePath: string;
  private documentData: T | undefined;
  private prevDocumentData: T | undefined;

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
    this.collectionPath = collection;

    if (typeof data !== "undefined") {
      this.documentData = data;
    }
  }

  /**
   * Set new document data
   * @param {T} data Document data
   */
  set(data: T) {
    this.prevDocumentData = this.documentData;
    this.documentData = data;

    this.db.onEdit(this);
  }

  /**
   * Update existing document data with merge
   * @param {Partial<T>} data Document updated data
   */
  update(data: Partial<T>) {
    if (typeof this.documentData !== "undefined") {
      this.prevDocumentData = this.documentData;
      this.documentData = {
        ...this.documentData,
        ...data,
      };

      this.db.onEdit(this);
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
   * @returns {{id: string; remove: ()=>void}} remove function
   */
  on(callback: (snapshot: Document<T>) => void): {
    id: string;
    remove: () => void;
  } {
    callback(this);

    // @ts-ignore
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
  get data(): T {
    return this.documentData;
  }

  /**
   * @returns {T} Return prev document data
   */
  get prevData(): T {
    return this.prevDocumentData;
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

  /**
   * @returns {string} Collection path
   */
  get collection(): string {
    return this.collectionPath;
  }
}
