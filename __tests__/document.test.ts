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
  it("create document", () => {
    const uniqueId = generateUID();
    const doc = collection.doc(uniqueId);

    doc.update({
      title: "AA",
      vote: 10,
    });

    const data = doc.data;

    expect(doc.exists).toBeTruthy();
    expect(typeof data).toEqual("object");
  });
  it("empty doc should not exists", () => {
    const uniqueId = generateUID();
    const doc = collection.doc(uniqueId);

    expect(doc.exists).toBeFalsy();
  });
  it(".update() method should set if doc does not exists", () => {
    const uniqueId = generateUID();
    const doc = collection.doc(uniqueId);

    expect(doc.exists).toBeFalsy();

    doc.update({ title: "AA" });

    expect(doc.exists).toBeTruthy();
  });
  it(".set()", () => {
    const uniqueId = generateUID();
    const doc = collection.doc(uniqueId);

    expect(doc.exists).toBeFalsy();

    doc.set({ title: "AA", id: uniqueId });

    expect(doc.exists).toBeTruthy();
  });
  it(".delete() should set exists to be false but 'data' defined", () => {
    const uniqueId = generateUID();
    const doc = collection.doc(uniqueId);

    doc.set({ title: "AA", id: uniqueId });

    expect(doc.exists).toBeTruthy();

    let t: DocType;
    if(doc.exists){
      t = doc.data
    }
    doc.delete();
    expect(doc.exists).toBeFalsy();
    expect(doc.data).toBeDefined();
  });
  it("id should be equal to assigned id", () => {
    const uniqueId = generateUID();

    const doc = collection.doc(uniqueId);

    expect(doc.id).toEqual(uniqueId);
  });
  it("path should be collection path + document id", () => {
    const uniqueId = generateUID();
    const expected = collection.path + "/" + uniqueId;
    const doc = collection.doc(uniqueId);

    expect(typeof doc.path).toEqual("string");
    expect(doc.path).toEqual(expected);
  });
  it(".on() should be called on first build", () => {
    const uniqueId = generateUID();
    const document = collection.doc(uniqueId);
    const callback = jest.fn();

    document.on(callback);

    expect(callback).toHaveBeenCalled();
  });
});
