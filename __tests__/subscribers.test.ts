import DB from "../src/DB";
import Subscribers from "../src/Subscribers";

type DocTestType = {
  title: string;
  id?: string;
};
const subscribers = new Subscribers();
const db = new DB();

beforeAll(() => {
  db.collection("test").add([{ title: "AA", id: "AA" }, { title: "BB" }]);
});

beforeEach(() => {
  subscribers.clear();
});

describe("basic cases", () => {
  it("create listener", () => {
    const document = db.doc<DocTestType>("test/AA");
    const listener = subscribers.add(document, () => { });

    expect(subscribers.getListenerById(listener.id)).toBeDefined();
  });

  it(".add() should return id and remove fn", () => {
    const document = db.doc<DocTestType>("test/AA");
    const listener = subscribers.add(document, () => { });

    expect(typeof listener).toEqual("object");
    expect(Object.keys(listener).length).toEqual(2);

    expect(typeof listener.id).toEqual("string");
    expect(typeof listener.remove).toEqual("function");
  });

  it(".emitById() should call callback on emit", () => {
    const document = db.doc<DocTestType>("test/AA");
    const callback = jest.fn();
    const listener = subscribers.add(document, callback);

    subscribers.emitById(listener.id);

    expect(callback).toHaveBeenCalled();
  });
  it("create and delete listener", () => {
    const document = db.doc<DocTestType>("test/AA");
    const listener = subscribers.add(document, () => { });

    expect(subscribers.getListenerById(listener.id)).toBeDefined();

    listener.remove();

    expect(subscribers.getListenerById(listener.id)).toBeNull();
  });
});
