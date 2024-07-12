import generateUID from "./generateUID";
import { DocumentData } from "./types";
import Document from "./Document";
import Query from "./Query";

/**
 *
 * @template T
 */
export default class Subscribers {
  private subscribers: Listener<any>[] = [];

  /**
   *
   */
  add<T extends Document<any>>(document: T, callback: (snapshot: T) => void): { id: string; remove: () => void };

  /**
   *
   */
  add<T extends Query<any>>(query: T, callback: (snapshot: T) => void): { id: string; remove: () => void };

  /**
   * @param {Document<T> | Query<T>} from From
   * @param {()=>void} callback Callback function
   * @returns {()=>void} Cleanup function
   */
  add<T extends DocumentData>(
    from: Document<T> | Query<T>,
    callback: (snapshot: Document<T> | Query<T>) => void,
  ): { id: string; remove: () => void } {
    const listener = new Listener<T>(from, callback);
    const remove = () => {
      const id = listener.id;
      this.subscribers = this.list.filter((curr) => curr.id !== id);
    };
    this.list.push(listener);

    return {
      id: listener.id,
      remove,
    };
  }

  /**
   * @param {string} id Listener id
   */
  emitById(id: string): void {
    const listener = this.getListenerById(id);

    if (listener) {
      listener.callback();
    }
  }

  /**
   * @param {string} id Listener id
   * @returns {Listener<any,any> |null} Listener
   */
  getListenerById(id: string): Listener<any> | null {
    const index = this.list.findIndex((curr) => curr.id === id);

    if (index >= 0 && this.list[index]) {
      return this.list[index];
    }

    return null;
  }

  /**
   *
   * Clear all listeners
   */
  clear(): void {
    this.subscribers = [];
  }

  /**
   * @returns {Listener<any>} Subscribers list
   */
  get list(): Listener<any>[] {
    return this.subscribers;
  }
}

/**
 * @template T
 */
class Listener<T extends DocumentData> {
  private uniqueId: string;
  private listenerCallback: (snapshot: Document<T> | Query<T>) => void;
  private listenerFrom: Document<T> | Query<T>;

  /**
   * @param {typeof this.listenerFrom} from From
   * @param {typeof this.listenerCallback} callback Callback
   */
  constructor(from: Document<T> | Query<T>, callback: (snapshot: Document<T> | Query<T>) => void) {
    this.uniqueId = generateUID();
    this.listenerFrom = from;
    this.listenerCallback = callback;
  }

  /**
   * @returns {void} Call the callback
   */
  callback(): void {
    this.listenerCallback(this.listenerFrom);
  }

  /**
   * @returns {string} Listener id
   */
  get id(): string {
    return this.uniqueId;
  }
}
