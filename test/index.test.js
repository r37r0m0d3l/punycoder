const assert = require("assert");

const { asciiToUnicode, unicodeToAscii } = require("../dist/index.cjs");

describe(`parseRange(size, header)`, function () {
  it(`Cyrillic`, function () {
    expect(unicodeToAscii("Привет, мир!")).toEqual("xn--%2C%20!-eddpqe5aVkht");
  });

  it(`Revert cyrillic`, function () {
    expect(asciiToUnicode(unicodeToAscii("Привет, мир!"))).toEqual("Привет, мир!");
  });
});
