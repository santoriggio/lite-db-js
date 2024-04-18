import generateUID from "./generateUID";

class DB {
  private _db = new DBInstance();

  constructor() {}

  collection<T extends Record<string, any>>(path: string): Collection<T> {
    if (typeof this._db.collections[path] !== "undefined") {
      return this._db.collections[path];
    }

    const newCollection = new Collection<T>(this._db, path);
    this._db.collections[path] = newCollection;
    return newCollection;
  }

  doc<T>(id: string): Document<T> {
    const splitted = id
      .split("/")
      .filter((str) => str.trim() !== "" && typeof str !== "undefined" && str !== null);

    const docId = splitted.pop();

    if (splitted.length === 0) {
      throw Error("Collezione non valida");
    }

    const collectionId = splitted.join("/");

    if (typeof this._db.collections[collectionId] === "undefined") {
      throw Error("Collezione non trovata");
    }

    return this._db.collections[collectionId].doc<T>(docId);
  }
}

class DBInstance {
  collections: Record<string, Collection<any>> = {};
  listeners: Listener<any>[] = [];
  docListeners: DocListener<any>[] = [];

  constructor() {}

  notifyListeners() {
    this.listeners.forEach((listener) => {
      if (typeof listener.func === "function") {
        listener.func(this);
      }
    });
  }

  addListener(query: Listener<any>["query"], callback: (snapshot: any) => void) {
    const uniqueId = generateUID();

    this.listeners.push({
      id: uniqueId,
      func: callback,
      query,
      _remove: () => {
        this.listeners.filter((listener) => listener.id !== uniqueId);
      },
    });
  }

  addDocListener(query: DocListener<any>["query"], callback: (snapshot: any) => void) {
    const uniqueId = generateUID();
    this.docListeners.push({
      id: uniqueId,
      func: callback,
      query,
      _remove: () => {
        this.docListeners.filter((listener) => listener.id !== uniqueId);
      },
    });
  }

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
          if (typeof doc.data[filter.key] === "undefined") isValid = false;

          if (filter.operator === "==") {
            if (doc.data[filter.key] != filter.value) isValid = false;
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

  onEdit(prev: DocumentData, current: Document<any>) {
    this.listeners.forEach((listener) => {
      const filters = listener.query.filters;

      let isValid = [true, true];

      filters.forEach((filter) => {
        if (typeof prev[filter.key] === "undefined") isValid[0] = false;
        if (typeof current.data[filter.key] === "undefined") isValid[1] = false;

        if (filter.operator === "==") {
          if (prev[filter.key] != filter.value) isValid[0] = false;
          if (current.data[filter.key] != filter.value) isValid[1] = false;
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
          if (typeof doc.data[filter.key] === "undefined") isValid = false;

          if (filter.operator === "==") {
            if (doc.data[filter.key] != filter.value) isValid = false;
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

class Query<T> {
  private _db: DBInstance;
  private _filters: any[] = [];
  private _listeners: Listener<Query<T>>[] = [];

  constructor(
    db: DBInstance,
    private path: string,
    filters: any[] = [],
    listeners: Listener<Query<T>>[] = []
  ) {
    this._filters = [...this._filters, ...filters];
    this._listeners = [...this._listeners, ...listeners];
    this._db = db;
  }

  get empty() {
    return this._db.collections[this.path].docs.length === 0;
  }

  get filters() {
    return this._filters;
  }

  get count() {
    return this.docs.length;
  }

  get docs() {
    let array = [];

    const docs = this._db.collections[this.path].docs;

    if (this.filters.length === 0) return docs;

    if (this._filters.length > 0) {
      docs.forEach((doc) => {
        let valid = true;

        this._filters.forEach((filter) => {
          const key = doc.data[filter.key];

          if (typeof key === "undefined") valid = false;

          if (filter.operator === "==") {
            if (key != filter.value) valid = false;
          }
        });

        if (valid) {
          array.push(doc);
        }
      });
    }

    return array;
  }

  where(key: string, operator: "==", value: any) {
    return new Query<T>(
      this._db,
      this.path,
      [...this._filters, { key, operator, value }],
      this._listeners
    );
  }

  on(callback: (snapshot: Query<T>) => void) {
    callback(this);

    this._db.addListener(this, callback);
  }
}

class Collection<T extends DocumentData = DocumentData> extends Query<T> {
  private _id: string;
  private _hashmap: Record<string, Document<T>> = {};
  private _docs: Document<T>[] = [];

  constructor(private db: DBInstance, id: string) {
    super(db, id);

    this._id = id;
  }

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

  deleteDoc(doc: Document<T>) {
    if (typeof this._hashmap[doc.id] !== "undefined") {
      delete this._hashmap[doc.id];

      this._docs = this._docs.filter((item) => item.id !== doc.id);

      this.db.onDelete(doc);
    }
  }

  get id() {
    return this._id;
  }

  get docs() {
    return this._docs;
  }

  // constructor(id: string) {
  //   super();
  //   this._id = id;

  // }

  add(data: T | T[]) {
    const coll = this.db.collections[this._id];

    // Aggiungi logica per aggiungere documenti come desiderato
    // Questo è solo un esempio
    if (Array.isArray(data)) {
      let added: Document<T>[] = [];

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

  // doc(id: string) {
  //   if (typeof this._hashmap[id] !== "undefined") {
  //     return this._hashmap[id];
  //   } else {
  //     const newDoc = new Document<T>(id);
  //     this._hashmap[id] = newDoc;
  //     this._docs.push(newDoc);
  //     return newDoc;
  //   }
  // }

  // get id() {
  //   return this._id;
  // }

  // get docs() {
  //   return this._docs;
  // }

  // get empty() {
  //   return this._empty;
  // }
}

class Document<T extends DocumentData> {
  private _id: string;
  private _path: string;
  private _data: T;
  private _db: DBInstance;
  private _exists: boolean = true;

  constructor(db: DBInstance, id: string, collection: string, data?: T) {
    this._id = id;
    this._data = data;
    this._path = collection;
    this._db = db;
  }

  set(data: T) {
    if (this._exists === false) {
      throw Error("This document don't exists");
    }

    const prev = this._data;

    this._data = data;
    this._db.onEdit(prev, this);
  }

  update(data: Partial<T>) {
    if (this._exists === false) {
      throw Error("This document don't exists");
    }

    const prev = this._data;

    this._data = {
      ...this._data,
      ...data,
    };

    this._db.onEdit(prev, this);
  }

  delete() {
    this._exists = false;

    this._db.collections[this._path].deleteDoc(this);
  }

  on(callback: (snapshot: Document<T>) => void) {
    callback(this);

    this._db.addDocListener(this, callback);
  }

  get exists() {
    return this._exists;
  }
  get data() {
    return this._data;
  }
  get id() {
    return this._id;
  }
  get path() {
    return this._path;
  }
}

export default DB;

type DocumentData = {
  [key: string]: any;
};

type Listener<T> = {
  id: string;
  query: Query<T>;
  func: (snapshot: T) => void;
  _remove: () => void;
};

type DocListener<T> = {
  id: string;
  query: Document<T>;
  func: (snapshot: T) => void;
  _remove: () => void;
};
