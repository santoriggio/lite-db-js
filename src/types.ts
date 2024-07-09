import Document from "./Document";

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
