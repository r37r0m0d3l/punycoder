const { asciiToUnicode, unicodeToAscii } = require("../dist/index.cjs");

describe("Puny-coder", function () {
  it(`unicodeToAscii`, function () {
    expect(unicodeToAscii("Привет, мир!")).toEqual("xn--%2C%20!-eddpqe5aVkht");
    expect(unicodeToAscii("αβγ")).toEqual("xn--mxacd");
    expect(unicodeToAscii("ยจฆฟคฏข")).toEqual("xn--22cdfh1b8fsa");
    expect(unicodeToAscii("도메인")).toEqual("xn--hq1bm8jm9l");
    expect(unicodeToAscii("ドメイン名例")).toEqual("xn--eckwd4c7cu47r2wf");
  });
  it(`asciiToUnicode`, function () {
    expect(asciiToUnicode("xn--%2C%20!-eddpqe5aVkht")).toEqual("Привет, мир!");
    expect(asciiToUnicode("xn--mxacd")).toEqual("αβγ");
    expect(asciiToUnicode("xn--22cdfh1b8fsa")).toEqual("ยจฆฟคฏข");
    expect(asciiToUnicode("xn--hq1bm8jm9l")).toEqual("도메인");
    expect(asciiToUnicode("xn--eckwd4c7cu47r2wf")).toEqual("ドメイン名例");
  });
});
