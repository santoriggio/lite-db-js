import DB from "../src/DB";
import generateUID from "../src/generateUID";

type DocType = {
  title: string;
  vote?: number;
  id: string;
};

const db = new DB();
const collection = db.collection<DocType>("test");

beforeEach(() => {
  collection.clear();
});

describe("basic cases", () => {
  it("add item to collection", () => {
    const uniqueId = generateUID();
    collection.add({
      title: "AA",
      id: uniqueId,
    });

    expect(collection.count).toEqual(1);
    expect(collection.docs.length).toEqual(1);
  });

  it("add items as array to collection", () => {
    let array: DocType[] = [];
    for (let i = 0; i < 10; i++) {
      const uniqueId = generateUID();

      const item: DocType = {
        title: "Item " + i,
        id: uniqueId,
      };

      array.push(item);
    }

    collection.add(array);
    expect(collection.count).toEqual(10);
    expect(collection.docs.length).toEqual(10);
  });
  it("path should be === 'test'", () => {
    expect(collection.path).toEqual("test");
  });

  it(".where() method", () => {
    const addItems = () => {
      let array: DocType[] = [];
      for (let i = 0; i < 10; i++) {
        const item = {
          title: "Item " + i,
          vote: i % 2,
          id: generateUID(),
        };
        array.push(item);
      }

      collection.add(array);
    };

    addItems();

    const query = collection.where("vote", "==", 0);

    expect(query.count).toEqual(5);
    expect(query.docs.length).toEqual(5);
  });
  it("concatenate queries", () => {
    const addItems = () => {
      let array: DocType[] = [];
      for (let i = 0; i < 10; i++) {
        const item = {
          title: "Item " + i,
          vote: i % 2,
          id: generateUID(),
        };
        array.push(item);
      }

      collection.add(array);
    };

    addItems();

    const query = collection
      .where("vote", "==", 0)
      .where("title", "==", "Item 0");

    expect(query.count).toEqual(1);
    expect(query.docs.length).toEqual(1);
  });
  it("remove listener on listener.remove", () => {
    const callback = jest.fn();
    const listener = collection.on(callback);

    listener.remove();
    collection.add({ id: generateUID(), title: "AAAA" });
    expect(callback).toHaveBeenCalledTimes(1);
  });
  it(".on should be called one time if array is added", () => {
    const callback = jest.fn();
    const listener = collection.on(callback);

    collection.add([
      { id: generateUID(), title: "BBB" },
      { id: generateUID(), title: "CCC" },
      { id: generateUID(), title: "DDD" },
    ]);

    expect(callback).toHaveBeenCalledTimes(2);

    listener.remove();
  });
  it("2 listeners should work indipendently", () => {
    const callback_one = jest.fn();
    const callback_two = jest.fn();

    const collection_one = db.collection("collection_one");
    const collection_two = db.collection("collection_two");

    const listener_one = collection_one.on(callback_one);
    const listener_two = collection_two.on(callback_two);

    collection_one.add({
      id: generateUID(),
      title: "One",
    });

    const uid = generateUID();
    collection_two.add({
      id: uid,
      title: "Two",
    });

    const doc = collection_two.doc(uid);

    doc.update({
      title: "Two_updated",
    });

    expect(callback_one).toHaveBeenCalledTimes(2);
    expect(callback_two).toHaveBeenCalledTimes(3);

    listener_one.remove();
    listener_two.remove();
  });
});

type ComplexData = {
  name: string;
  age: number;
  array?: string[];
  complexObj?: {
    email: string;
    phone: string;
    complexAge: number;
    complexArray: string[];
  };
};

const dataArray: ComplexData[] = [
  {
    name: "Alice",
    age: 30,
    array: ["item1", "item2", "item3"],
    complexObj: {
      email: "alice@example.com",
      phone: "123-456-7890",
      complexAge: 30,
      complexArray: ["subItem1", "subItem2"],
    },
  },
  {
    name: "Bob",
    age: 25,
    array: ["item4", "item5", "item6"],
    complexObj: {
      email: "bob@example.com",
      phone: "234-567-8901",
      complexAge: 25,
      complexArray: ["subItem3", "subItem4"],
    },
  },
  {
    name: "Charlie",
    age: 35,
    array: ["item7", "item8", "item9"],
    complexObj: {
      email: "charlie@example.com",
      phone: "345-678-9012",
      complexAge: 35,
      complexArray: ["subItem5", "subItem6"],
    },
  },
  {
    name: "Diana",
    age: 28,
    array: ["item10", "item11", "item12"],
    complexObj: {
      email: "diana@example.com",
      phone: "456-789-0123",
      complexAge: 28,
      complexArray: ["subItem7", "subItem8"],
    },
  },
  {
    name: "Eve",
    age: 32,
    array: ["item13", "item14", "item15"],
    complexObj: {
      email: "eve@example.com",
      phone: "567-890-1234",
      complexAge: 32,
      complexArray: ["subItem9", "subItem10"],
    },
  },
];

const complexCollection = db.collection<ComplexData>("complexCollection");

describe(".where() method filtering", () => {
  beforeAll(() => {
    complexCollection.clear();
    complexCollection.add(dataArray);
  });
  it("== operator on first layer", () => {
    const list = complexCollection.where("name", "==", "Eve");

    expect(list.count).toBe(1);
    expect(list.docs.length).toBe(1);
  });
  it("< operator on first layer", () => {
    const list = complexCollection.where("age", "<", 30);

    expect(list.count).toBe(2);
    expect(list.docs.length).toBe(2);
  });
  it("> operator on first layer", () => {
    const list = complexCollection.where("age", ">", 30);

    expect(list.count).toBe(2);
    expect(list.docs.length).toBe(2);
  });
  it("<= operator on first layer", () => {
    const list = complexCollection.where("age", "<=", 30);

    expect(list.count).toBe(3);
    expect(list.docs.length).toBe(3);
  });

  it(">= operator on first layer", () => {
    const list = complexCollection.where("age", ">=", 30);

    expect(list.count).toBe(3);
    expect(list.docs.length).toBe(3);
  });
  it("'has' operator on first layer", () => {
    const list = complexCollection.where("array", "has", "item10");

    expect(list.count).toBe(1);
    expect(list.docs.length).toBe(1);
  });
  it("'!has' operator on first layer", () => {
    const list = complexCollection.where("array", "!has", "item10");

    expect(list.count).toBe(4);
    expect(list.docs.length).toBe(4);
  });
  it("== operator on second layer", () => {
    const list = complexCollection.where(
      "complexObj.email",
      "==",
      "eve@example.com",
    );

    expect(list.count).toBe(1);
    expect(list.docs.length).toBe(1);
  });

  it("> operator on second layer", () => {
    const list = complexCollection.where("complexObj.complexAge", ">", 30);

    expect(list.count).toBe(2);
    expect(list.docs.length).toBe(2);
  });
});

describe(".on method", () => {
  it("callback should be called", () => {
    const callback = jest.fn();
    const listener = complexCollection.where("age", ">", 30).on(callback);

    complexCollection.add({ name: "AAAAAAA", age: 28 });
    expect(callback).toHaveBeenCalledTimes(1);

    complexCollection.add({ name: "AAAAAAA", age: 31 });
    expect(callback).toHaveBeenCalledTimes(2);
    listener.remove();
  });
  it("on edit document", () => {
    const callback = jest.fn();
    const query = complexCollection.where("age", ">", 30);
    const listener = query.on(callback);

    const docs = query.docs;
    const doc = docs[0];

    doc.update({ age: 28 });
    expect(callback).toHaveBeenCalledTimes(2);

    listener.remove();
  });
  it("on delete document", () => {
    const callback = jest.fn();
    const query = complexCollection.where("age", ">", 30);
    const listener = query.on(callback);

    const docs = query.docs;
    const doc = docs[0];

    doc.delete();
    expect(callback).toHaveBeenCalledTimes(2);

    listener.remove();
  });
});

describe("orderBy method", () => {
  it("asc by age", () => {
    const query = complexCollection.orderBy("age", "asc");
    const docs = query.docs.map((docSnapshot) => docSnapshot.data);

    const ages = docs.map((doc) => doc.age);

    // Controlla che l'array delle età sia ordinato in modo crescente
    for (let i = 0; i < ages.length - 1; i++) {
      expect(ages[i]).toBeLessThanOrEqual(ages[i + 1]);
    }
  });
  it("desc by age", () => {
    const query = complexCollection.orderBy("age", "desc");
    const docs = query.docs.map((docSnapshot) => docSnapshot.data);

    const ages = docs.map((doc) => doc.age);

    // Controlla che l'array delle età sia ordinato in modo crescente
    for (let i = 0; i < ages.length - 1; i++) {
      expect(ages[i]).toBeGreaterThanOrEqual(ages[i + 1]);
    }
  });
});

describe("edge cases", () => {
  it("add and retrieve number as id document", () => {
    const id = 3150;

    const createDoc = () => {
      // @ts-ignore
      collection.doc(id).set({ id, title: "aa" });
    };

    expect(createDoc).toThrow();
  });
  it("query should be searched by lowercase", () => {
    const doc = collection.doc(generateUID());
    doc.update({
      title: "mario",
    });

    const query = collection.where("title", "has", "Mario");

    expect(query.count).toBe(1);
    expect(query.docs.length).toBe(1);
  });
});
