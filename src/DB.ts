import Document from "./Document";
import Collection from "./Collection";
import generateUID from "./generateUID";
import { DocumentData, CollListener } from "./types";

/**
 *
 * @template T
 */
export default class DB {
  private db = new DBInstance();

  /**
   *
   * @param {string} path The path of the collection
   * @returns {Collection<T>} Collection Reference
   */
  collection<T extends DocumentData>(path: string): Collection<T> {
    if (typeof this.db.collections[path] !== "undefined") {
      return this.db.collections[path];
    }

    const newCollection = new Collection<T>(this.db, path);
    this.db.collections[path] = newCollection;

    return newCollection;
  }

  /**
   *
   * @param {string} id The id of the document
   * @returns {Document<T>} Document Reference
   */
  doc<T extends DocumentData>(id: string): Document<T> {
    const splitted = id
      .split("/")
      .filter(
        (str) =>
          str.trim() !== "" && typeof str !== "undefined" && str !== null,
      );

    if (splitted.length === 0) {
      throw Error("invalid_path: " + id);
    }

    const docId = splitted.pop();

    if (typeof docId !== "string") {
      throw Error("invalid_id: " + id);
    }

    const collectionId = splitted.join("/");

    return this.collection<T>(collectionId).doc<T>(docId);
  }

  /**
   *
   *
   */
  clear() {
    this.db = new DBInstance();
  }
}

/**
 * @template T
 */
export class DBInstance {
  collections: Record<string, Collection<any>> = {};
  listeners: CollListener<any>[] = [];
  docListeners: CollListener<any>[] = [];

  /**
   *
   * @param query
   * @param callback
   */
  addListener(
    query: CollListener<any>["query"],
    callback: (snapshot: any) => void,
  ) {
    const uniqueId = generateUID();

    const remove = () => {
      this.listeners = this.listeners.filter(
        (listener) => listener.id !== uniqueId,
      );
    };

    this.listeners.push({
      id: uniqueId,
      func: callback,
      query,
      remove,
    });

    return {
      id: uniqueId,
      remove,
    };
  }

  /**
   * @param query
   * @param callback
   */
  addDocListener(
    query: CollListener<any>["query"],
    callback: (snapshot: any) => void,
  ) {
    const uniqueId = generateUID();

    const remove = () => {
      this.docListeners = this.docListeners.filter(
        (listener) => listener.id !== uniqueId,
      );
    };

    this.docListeners.push({
      id: uniqueId,
      func: callback,
      query,
      remove,
    });

    return {
      id: uniqueId,
      remove,
    };
  }

  /**
   *
   * @param a
   */
  onAdd(a: Document<any> | Document<any>[]) {
    let toCall: Record<string, CollListener<any>> = {};
    const list = Array.isArray(a) ? a : [a];

    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];

      if (typeof listener === "undefined") return;

      const docs = listener.query.docs;
      for (let j = 0; j < list.length; j++) {
        if (toCall[listener.id]) {
          continue;
        }

        const doc = list[j];
        if (doc && doc.exists) {
          const index = docs.findIndex((curr) => curr.id === doc.id);
          if (index >= 0) {
            toCall = {
              ...toCall,
              [listener.id]: listener,
            };
          }
        }
      }
    }

    Object.values(toCall).forEach((listener) => {
      listener.func(listener.query);
    });
  }

  /**
   * @param prev
   * @param current
   * @param prevDocumentData
   * @param document
   */
  onEdit(document: Document<any>) {
    const listeners = this.listeners;

    // PERF: Check if listeners.length === 0 to early return

    // if (listeners.length === 0) return;

    for (const listener of listeners) {
      const docs = listener.query.docs;
      const beforeIsValid = listener.query.isValidDoc(document, "prev");

      const index = docs.findIndex((curr) => curr.path === document.path);
      if (index >= 0) {
        listener.func(listener.query);
      } else if (index === -1 && beforeIsValid) {
        listener.func(listener.query);
      }
    }

    this.docListeners.forEach((listener) => {
      // @ts-ignore
      if (listener.query.path === document.path) {
        listener.func(listener.query);
      }
    });
  }

  /**
   *
   * @param {Document<any>} document Deleted Document
   */
  onDelete(document: Document<any>) {
    let toCall: Record<string, CollListener<any>> = {};
    const listenersLength = this.listeners.length;
    for (let i = 0; i < listenersLength; i++) {
      const listener = this.listeners[i];

      if (typeof listener === "undefined") return;

      if (toCall[listener.id]) {
        continue;
      }

      const docs = listener.query.docs;
      const isValidDoc = listener.query.isValidDoc(document);
      const index = docs.findIndex((curr) => curr.path === document.path);

      if (index === -1 && isValidDoc) {
        toCall = {
          ...toCall,
          [listener.id]: listener,
        };
      }
    }

    Object.values(toCall).forEach((listener) => {
      listener.func(listener.query);
    });

    this.docListeners.forEach((listener) => {
      // @ts-ignore
      if (listener.query.path === document.path) {
        listener.func(listener.query);
      }
    });
  }

  /**
   * @param {string} path Document Path
   * @returns {boolean} True if document exists
   */
  docExists(path: string): boolean {
    const splitted = path.split("/");
    if (splitted.length < 2) {
      return false;
    }
    const documentId = splitted.pop();
    const collectionId = splitted.join("/");

    const collection = this.collections[collectionId];

    if (typeof collection === "undefined") {
      return false;
    }

    if (collection.empty) {
      return false;
    }

    const docs = collection.docs;
    const index = docs.findIndex(
      (docSnapshot) => docSnapshot.id === documentId,
    );

    if (index === -1) {
      return false;
    }

    return true;
  }

  /**
   *
   * Function to call on document write action, which comprends create, update and delete
   * @param {WriteEvent} e Event
   */
  // onWrite<T extends DocumentData>(e: WriteEvent<T>) { }
}
