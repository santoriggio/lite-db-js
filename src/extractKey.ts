import { DocumentData, NestedKeyOf } from "./types";

/**
 *
 * @param obj
 * @param key
 */
export default function extractKey<E extends DocumentData, T extends NestedKeyOf<E>>(obj: E, key: T) {
  const splittedKeys: string[] = key.split(".");
  let ans = obj;

  if (typeof ans === "undefined") return undefined;

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
