import Document from "./Document";
import Collection from "./Collection";
import generateUID from "./generateUID";

import isCollListener from "./isCollListener";
import isDocListener from "./isDocListener";
import { DocumentData, Listener } from "./types";

export default class DB {
  private _db = new DBInstance();
  collection<T extends DocumentData>(path: string): Collection<T> {
    if (typeof this._db.collections[path] !== "undefined") {
      return this._db.collections[path];
    }

    const newCollection = new Collection<T>(this._db, path);
    this._db.collections[path] = newCollection;

    return newCollection;
  }

  /**
   *
   * @param id
   */
  doc<T extends DocumentData>(id: string): Document<T> {
    const splitted = id
      .split("/")
      .filter(
        (str) =>
          str.trim() !== "" && typeof str !== "undefined" && str !== null,
      );

    const docId = splitted.pop();

    if (splitted.length === 0) {
      throw Error("Collezione non valida: " + id);
    }

    const collectionId = splitted.join("/");

    if (typeof this._db.collections[collectionId] === "undefined") {
      this.collection<T>(collectionId);
    }

    return this._db.collections[collectionId].doc<T>(docId);
  }

  /**
   *
   */
  clear() {
    this._db = new DBInstance();
  }
}

/**
 *
 */
export class DBInstance {
  collections: Record<string, Collection<any>> = {};
  listeners: Listener<any>[] = [];
  docListeners: DocListener<any>[] = [];

  addListener(
    query: Listener<any>["query"],
    callback: (snapshot: any) => void,
  ) {
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

    return remove;
  }

  /**
   *
   * @param query
   * @param callback
   */
  addDocListener(
    query: DocListener<any>["query"],
    callback: (snapshot: any) => void,
  ) {
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

    return remove;
  }

  /**
   *
   * @param a
   */
  onAdd(a: Document<any> | Document<any>[]) {
    let toCall: Record<string, Listener<any>> = {};
    const list = Array.isArray(a) ? a : [a];

    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];

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
  }

  /**
   *
   * @param prev
   * @param current
   */
  onEdit(prev: DocumentData, current: Document<any>) {
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
    let toCall: Record<string, Listener<any>> = {};
    const list = Array.isArray(a) ? a : [a];

    for (let i = 0; i < this.listeners.length; i++) {
      const listener = this.listeners[i];

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
      if (listener.query.id === a.id) {
        listener.func(listener.query);
      }
    });
  }
}
