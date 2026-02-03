import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { asciiToUnicode, unicodeToAscii } from "../dist/index.js";

describe("Puny-coder", function () {
  it(`unicodeToAscii`, function () {
    assert.strictEqual(unicodeToAscii("Здравей, свят!"), "xn--%2C%20!-5cdkcjkOy7esao5p");
    assert.strictEqual(unicodeToAscii("Ahoj, světe!"), "xn--Ahoj%2C%20svte!-nsb");
    assert.strictEqual(unicodeToAscii("αβγ"), "xn--mxacd");
    assert.strictEqual(unicodeToAscii("ยจฆฟคฏข"), "xn--22cdfh1b8fsa");
    assert.strictEqual(unicodeToAscii("도메인"), "xn--hq1bm8jm9l");
    assert.strictEqual(unicodeToAscii("ドメイン名例"), "xn--eckwd4c7cu47r2wf");
  });
  it(`asciiToUnicode`, function () {
    assert.strictEqual(asciiToUnicode("xn--%2C%20!-5cdkcjkOy7esao5p"), "Здравей, свят!");
    assert.strictEqual(asciiToUnicode("xn--Ahoj%2C%20svte!-nsb"), "Ahoj, světe!");
    assert.strictEqual(asciiToUnicode("xn--mxacd"), "αβγ");
    assert.strictEqual(asciiToUnicode("xn--22cdfh1b8fsa"), "ยจฆฟคฏข");
    assert.strictEqual(asciiToUnicode("xn--hq1bm8jm9l"), "도메인");
    assert.strictEqual(asciiToUnicode("xn--eckwd4c7cu47r2wf"), "ドメイン名例");
  });
});
