import extractKey from "../src/extractKey";

const obj = {
  A: "A",
  B: "B",
  C: {
    A: "A",
    B: "B",
    C: "C",
    D: ["D", "D", "D"],
  },
  D: ["D", "D", "D"],
};
describe("basic cases", () => {
  it("first layer", () => {
    const result = extractKey(obj, "A");

    expect(result).toBeDefined();
    expect(result).toBe("A");
  });
  it("first layer undefined", () => {
    // @ts-ignore for test case
    const result = extractKey(obj, "disndsicn");

    expect(result).toBeUndefined();
  });
  it("second layer", () => {
    const result = extractKey(obj, "C.A");

    expect(result).toBeDefined();
    expect(result).toBe("A");
  });
  it("second layer undefined", () => {
    // @ts-ignore for test case
    const result = extractKey(obj, "C.icnsdpcdns");

    expect(result).toBeUndefined();
  });
  it("first layer array", () => {
    const result = extractKey(obj, "D");

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
  });

  it("second layer array", () => {
    const result = extractKey(obj, "C.D");

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
  });
});
