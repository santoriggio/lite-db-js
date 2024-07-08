/**
 * Function that generate an uniqueId with custom length from 1 to 100
 * @param {number} length Length of the uniqueId from 1 to 100
 * @returns {string} Unique Id
 */
export default function generateUID(length: number = 20): string {
  try {
    let result = "";

    if (
      typeof length !== "number"
      || length == null
      || length < 1
      || length > 100
    ) {
      length = 20;
    }

    const characters
      = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      result += characters[randomIndex];
    }

    return result;
  } catch (error) {
    console.log(error);

    return "";
  }
}
