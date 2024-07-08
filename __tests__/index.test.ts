import DB from "../src";

const db = new DB();
type ListItem = {
  title: string;
};
const collection = db.collection<ListItem>("list");
describe("basic cases", () => {
  it("create empty collection", () => {
    expect(collection.empty).toBeTruthy();
  });

  it("add Item to empty collection", () => {
    collection.add({ title: "List Item 1" });

    expect(collection.empty).toBeFalsy();
    expect(collection.docs.length).toEqual(1);
    expect(collection.count).toEqual(1);
  });

  it("add 10 more items", () => {
    let items: ListItem[] = [];
    for (let i = 0; i < 10; i++) {
      items.push({
        title: `List Item ${i}`,
      });
    }

    collection.add(items);

    expect(collection.count).toEqual(11);
    expect(collection.docs.length).toEqual(11);
  });
  it("retrieve docs", () => {
    const docs = collection.docs;

    expect(docs).toBeInstanceOf(Array);
    expect(docs.length).toEqual(11);
  });
  it("get 'List Item 7'", () => {
    const list = collection.where("title", "==", "List Item 7");

    expect(list.count).toEqual(1);
    expect(list.docs.length).toEqual(1);
  });
  it("Remove 'List Item 7'", () => {
    const list = collection.where("title", "==", "List Item 7");
    if (list.empty === false) {
      const doc = list.docs[0];

      expect(doc.exists).toBeTruthy();
      doc.delete();
      expect(doc.exists).toBeFalsy();

      //Check if count is decreased
      expect(collection.count).toEqual(10);
    }
  });
});
