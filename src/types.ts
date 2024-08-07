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

export type Operator = "==" | "<" | "<=" | ">" | ">=" | "has" | "!has";

type Primitive = string | number | boolean | null | undefined | Array<any>;

type ObjectKeys<T extends object> = keyof T & (string | number);

export type NestedKeyOf<ObjectType extends object> = {
  [Key in ObjectKeys<ObjectType>]: ObjectType[Key] extends Primitive
  ? `${Key}`
  : `${Key}` | `${Key}.${NestedKeyOf<NonNullable<ObjectType[Key]>>}`;
}[ObjectKeys<ObjectType>];
