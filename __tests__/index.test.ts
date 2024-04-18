import generateUID from "../src/generateUID";
import DB from "../src/index";

type Test = {
  id: string;
  title: string;
  vote?: number;
};

const fixedId = generateUID();

describe("test", () => {
  it("test", () => {
    const db = new DB();

    const spaces = db.collection<Test>("spaces");

    // spaces.on((snapshot) => {
    //   console.log(snapshot.docs);
    // });

    // console.log(spaces.docs)

    spaces.add([
      { id: generateUID(), title: "oo" },
      { id: fixedId, title: "oo" },
      { id: generateUID(), title: "aa" },
    ]);

    const queryOO = spaces.where("title", "==", "oo");
    const queryAA = spaces.where("title", "==", "aa");

    queryAA.on((snapshot) => {
      console.log("AA", snapshot.docs);
    });

    queryOO.on((snapshot) => {
      console.log("OO", snapshot.docs);
    });

    spaces.doc(fixedId).update({
      title: "aa",
    });
  });

  it("test delete doc", () => {
    const db = new DB();
    const spaces = db.collection<Test>("spaces");

    spaces.add({
      id: fixedId,
      title: "AAA",
    });

    const doc = spaces.doc(fixedId);

    doc.on((snapshot) => {
      console.log(snapshot);
    });

    doc.delete();
  });
});

describe.only("edge case", () => {
  it("large collection", () => {
    const length = 100000;

    const db = new DB();

    const collection = db.collection<Test>("large");

    collection.doc(fixedId).on((snapshot) => {
      console.log(snapshot);
    });

    for (let i = 0; i < length; i++) {
      collection.add({ id: i === 58472 ? fixedId : generateUID(), title: generateUID() });
    }
  });
});
