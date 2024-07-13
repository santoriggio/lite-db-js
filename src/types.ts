import Query from "./Query";
import Document from "./Document";

export type DocumentData = {
  [key: string]: any;
};

export type CollListener<T extends DocumentData> = {
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

export type WriteEvent<T extends DocumentData> = {
  type: "create" | "update" | "delete";
  document: Document<T>;
};
