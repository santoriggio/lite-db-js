export type CollectionRef<T> = {
  id: string;
  docs: DocumentRef<T>[];
  empty: boolean;
  add: (data: DocumentRef<T>["data"] | CollectionRef<T>["docs"]) => void;
};

export type DocumentRef<T> = {
  id: string;
  data: T;
  collections: Record<string, CollectionRef<any>>;
};
