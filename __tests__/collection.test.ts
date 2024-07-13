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

    const query = collection.where("vote", "==", 0).where("title", "==", "Item 0");

    expect(query.count).toEqual(1);
    expect(query.docs.length).toEqual(1);
  });
});
