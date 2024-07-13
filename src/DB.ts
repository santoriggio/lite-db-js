import Document from "./Document";
import Collection from "./Collection";
import generateUID from "./generateUID";
import { DocumentData, CollListener } from "./types";

/**
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
    const splitted = id.split("/").filter((str) => str.trim() !== "" && typeof str !== "undefined" && str !== null);

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
   */
  addListener(query: CollListener<any>["query"], callback: (snapshot: any) => void) {
    const uniqueId = generateUID();

    const remove = () => {
      this.listeners.filter((listener) => listener.id !== uniqueId);
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
   *
   * @param query
   * @param callback
   */
  addDocListener(query: CollListener<any>["query"], callback: (snapshot: any) => void) {
    const uniqueId = generateUID();

    const remove = () => {
      this.docListeners.filter((listener) => listener.id !== uniqueId);
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

      for (let j = 0; j < list.length; j++) {
        if (toCall[listener.id]) {
          continue;
        }

        const doc = list[j];
        if (doc && doc.exists) {
          const filters = listener.query.filters;
          let isValid = true;

          filters.forEach((filter) => {
            if (typeof filter === "undefined") {
              return;
            }

            if (typeof doc.data === "undefined") {
              return (isValid = false);
            }

            if (typeof doc.data[filter.key] === "undefined") {
              return (isValid = false);
            }

            if (filter.operator === "==") {
              if (doc.data[filter.key] !== filter.value) {
                return (isValid = false);
              }
            }

            return;
          });

          if (isValid) {
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
   *
   * @param prev
   * @param current
   */
  onEdit(prev: DocumentData | undefined, current: Document<any>) {
    this.listeners.forEach((listener) => {
      const filters = listener.query.filters;

      const isValid = [true, true];

      filters.forEach((filter) => {
        if (typeof filter === "undefined") return;

        if (typeof prev === "undefined") {
          isValid[0] = false;
        } else {
          if (typeof prev[filter.key] === "undefined") {
            isValid[0] = false;
          } else {
            if (filter.operator === "==") {
              if (prev[filter.key] !== filter.value) isValid[0] = false;
            }
          }
        }

        if (typeof current.data === "undefined") {
          isValid[1] = false;
        } else {
          if (typeof current.data[filter.key] === "undefined") {
            isValid[1] = false;
          } else {
            if (filter.operator === "==") {
              if (current.data[filter.key] !== filter.value) isValid[1] = false;
            }
          }
        }
      });

      if (isValid.includes(true)) {
        listener.func(listener.query);
      }
    });

    this.docListeners.forEach((listener) => {
      // @ts-ignore
      if (listener.query.id === current.id) {
        listener.func(listener.query);
      }
    });
  }

  /**
   *
   * @param a
   */
  onDelete(a: Document<any>) {
    let toCall: Record<string, CollListener<any>> = {};
    const list = Array.isArray(a) ? a : [a];

    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];

      if (typeof listener === "undefined") return;
      for (let j = 0; j < list.length; j++) {
        if (toCall[listener.id]) {
          continue;
        }

        const doc = list[j];
        const filters = listener.query.filters;
        let isValid = true;

        filters.forEach((filter) => {
          if (typeof filter === "undefined") {
            return;
          }

          if (typeof doc.data === "undefined") {
            return (isValid = false);
          }

          if (typeof doc.data[filter.key] === "undefined") {
            return (isValid = false);
          }

          if (filter.operator === "==") {
            if (doc.data[filter.key] !== filter.value) {
              return (isValid = false);
            }
          }

          return;
        });

        if (isValid) {
          toCall = {
            ...toCall,
            [listener.id]: listener,
          };
        }
      }
    }

    Object.values(toCall).forEach((listener) => {
      listener.func(listener.query);
    });

    this.docListeners.forEach((listener) => {
      // @ts-ignore
      if (listener.query.id === a.id) {
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
    const index = docs.findIndex((docSnapshot) => docSnapshot.id === documentId);

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
