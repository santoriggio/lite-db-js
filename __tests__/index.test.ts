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
      { id: generateUID(), title: "aa", vote: 10 },
    ]);

    const query = spaces.where("title", "==", "oo");

    query.on((snapshot) => {
      console.log(snapshot.docs);
    });

    spaces.add([
      { id: generateUID(), title: "aa", vote: 8 },
      { id: generateUID(), title: "oo", vote: 3 },
      { id: generateUID(), title: "oo", vote: 5 },
    ]);

    // spaces.add({ id: generateUID(), title: "aa", vote: 7 });

    // const doc = spaces.doc(fixedId);

    // doc.update({ title: "aaaa" });

    // console.log(spaces.docs)

    // console.log(spaces.docs)

    // spaces.docs.forEach((doc) => {
    //   console.log(doc);
    // });
  });
});
