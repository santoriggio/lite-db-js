import generateUID from "../src/generateUID";

describe("basic cases", () => {
  it("create random uid", () => {
    const uniqueId = generateUID();

    expect(typeof uniqueId).toEqual("string");
    expect(uniqueId.length).toEqual(20);
  });
  it("create custom length uid", () => {
    const uniqueId = generateUID(10);
    expect(uniqueId.length).toEqual(10);
  });
});

describe("edge cases", () => {
  it("passing non valid number ad param", () => {
    const non_valid_params = [-122, -10, 0, "aa", 120, 3000, "string", null, undefined, {}, []];

    for (const non_valid_param of non_valid_params) {
      // @ts-ignore Ignore passing wrong params type
      const uniqueId = generateUID(non_valid_param);

      expect(uniqueId.length).toEqual(20);
    }
  });
});
