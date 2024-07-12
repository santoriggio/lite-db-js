export type DocumentData = {
  [key: string]: any;
};

export type Listener<T> = {
  id: string;
  query: Query<T>;
  func: (snapshot: T) => void;
  remove: () => void;
};

export type DocListener<T extends DocumentData> = {
  id: string;
  query: Document<T>;
  func: (snapshot: T) => void;
  remove: () => void;
};

export interface Collection<T extends DocumentData> {}
export interface Document<T extends DocumentData> {
  set(data: T): void;
  update(data: Partial<T>): void;
  delete(): void;
  on(snapshot: () => void): void;
}

export interface DBInstance {}

export type WriteEvent<T extends DocumentData> = {
  type: "create" | "update" | "delete";
  document: Document<T>;
};
