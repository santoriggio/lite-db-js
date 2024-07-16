import { DocumentData, NestedKeyOf } from "./types";

/**
 *
 */
export default function extractKey<E extends DocumentData, T extends NestedKeyOf<E>>(obj: E, key: T) {
  const splittedKeys: string[] = key.split(".");
  let ans = obj;

  for (const splittedKey of splittedKeys) {
    if (typeof ans[splittedKey] === "undefined") {
      return undefined;
    }
    if (typeof ans[splittedKey] === "object" && !Array.isArray(ans[splittedKey])) {
      ans = ans[splittedKey];
    } else {
      return ans[splittedKey];
    }
  }

  return ans;
}
