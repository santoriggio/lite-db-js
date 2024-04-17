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
}

class DBInstance {
  collections: Record<string, Collection<any>> = {};
  listeners: Listener<any>[] = [];
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

  onAdd(doc: Document<any>) {
    this.listeners.forEach((listener) => {
      let isValid = true;

      const filters = listener.query.filters;

      filters.forEach((filter) => {
        if (typeof doc.data[filter.key] === "undefined") isValid = false;

        if (filter.operator === "==") {
          if (doc.data[filter.key] != filter.value) isValid = false;
        }
      });

      if (isValid) {
        listener.func(listener.query);
      }
    });
  }

  onEdit(prev: Document<any>, current: Document<any>) {}
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
    this._filters.push({ key, operator, value });

    return new Query<T>(this._db, this.path, this._filters, this._listeners);
  }

  on(callback: (snapshot: Query<T>) => void) {
    this._db.addListener(this, callback);
  }
}

class Collection<T extends DocumentData> extends Query<T> {
  private _id: string;
  private _hashmap: Record<string, Document<T>> = {};
  private _docs: Document<T>[] = [];

  constructor(private db: DBInstance, id: string) {
    super(db, id);

    this._id = id;
  }

  doc(id: string) {}

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
      data.forEach((item) => {
        const uniqueId = item.id || generateUID();
        const document = new Document<T>(uniqueId, this._id, item);

        coll.docs.push(document);
        this._hashmap[uniqueId] = document;
        this.db.onAdd(document);
      });
    } else {
      const uniqueId = data.id || generateUID();
      const document = new Document<T>(uniqueId, this._id, data);

      coll.docs.push(document);
      this._hashmap[uniqueId] = document;
      this.db.onAdd(document);
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

  constructor(id: string, collection: string, data?: T) {
    this._id = id;
    this._data = data;
  }

  set(data: T) {
    this._data = data;
  }

  update(data: Partial<T>) {
    this._data = {
      ...this._data,
      ...data,
    };
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
