# Repository instructions

## Project overview

`puny-coder` is a small, public ESM package that converts Unicode strings and internationalized domain names to and from Punycode/ASCII. The source of truth is `src/index.ts`; the package entry points and declarations are generated into `dist/index.js`, `dist/index.js.map`, and `dist/index.d.ts`.

- `src/index.ts` contains the complete implementation: a protected `Punycode` algorithm class, UTF-16 helpers, RFC 3492 encoding/decoding, domain-label splitting, and the public `unicodeToAscii`/`asciiToUnicode` wrappers.
- `test/index.test.js` is a Node test runner suite. It imports the built package from `dist/index.js`, not directly from `src/index.ts`.
- `package.json` defines package exports, build scripts, and Node requirements.
- `README.md` documents the public API and examples; `llms.txt` contains a condensed package/API summary.

## Build and test commands

The package requires Node.js `>=22.18.0` and npm `>=8.12.0`.

```sh
npm install
npm run build
npm test
```

- `npm run build` uses `tsup` to create the clean, minified ESM bundle and declarations at `dist/`.
- `npm run dev` rebuilds `dist/` in watch mode.
- `npm run prepublishOnly` runs the build automatically; publishing should only publish the generated `dist/` plus declarations.
- Run the complete suite with `npm test`.
- Because tests import `dist/index.js`, run `npm run build` before a test run after source changes.
- Run one test file with `node --test test/index.test.js`.
- Filter by test name with `node --test --test-name-pattern "unicodeToAscii" test/index.test.js` or `node --test --test-name-pattern "asciiToUnicode" test/index.test.js`.

There is no lint script or ESLint configuration. Use the repository Prettier settings when formatting, and do not introduce lint tooling for this package unless the task specifically requires it.

## Architecture and data flow

The implementation has two layers:

1. `Punycode` is an abstract, static-only implementation of the Punycode algorithm. It owns constants, UTF-16 validation/encoding, digit conversion, bias adaptation, overflow checks, and domain-label conversion.
2. The public functions adapt algorithm output for callers:
   - `unicodeToAscii(text, onError, urlEncode, skipOnValid)` encodes each domain label, optionally URL-encodes it with `encodeURIComponent`, and falls back to `onError` (defaulting to the input) on conversion errors.
   - `asciiToUnicode(text, onError, urlDecode)` optionally extracts the first key via `URLSearchParams` for URL-like input, decodes `xn--` labels, and also falls back to `onError`.

Both directions split input on `"."` and process labels independently. Labels containing non-ASCII or non-`A-Za-z0-9-` characters get the `xn--` prefix on Unicode-to-ASCII conversion; ASCII-to-Unicode only decodes labels beginning with `xn--`.

## Conventions

- Keep package API changes synchronized with the `Punycode` implementation, `README.md`, `llms.txt`, generated declarations, and tests.
- Preserve the public signatures and default behavior, especially error fallback to the input string and optional URL encoding/decoding.
- Domain conversion is label-based; do not replace it with a one-string Punycode conversion that changes dots or unrelated characters.
- Use UTF-16 code units and domain labels consistently with the existing class helpers; invalid surrogate sequences should remain range errors rather than being silently normalized.
- Prefer changes in `src/index.ts` and add assertions in `test/index.test.js`. Tests use Node's `node:test` API and `node:assert/strict`.
- Generated `dist/` output is the package artifact. It is excluded from source control as currently configured, so do not edit it as the primary implementation.
- Formatting follows `.prettierrc` and `.editorconfig`: 2-space indentation, LF line endings, semicolons, double quotes, trailing commas, and 120-column Prettier width.
