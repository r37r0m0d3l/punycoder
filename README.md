# Puny-coder

Punycode converter.

Representation of Unicode with the limited ASCII character subset.

Only Unicode and ASCII and vice versa converting.

## Installation

```sh
npm install puny-coder
```

## API

<!-- eslint-disable no-unused-vars -->

```js
const {
  asciiToUnicode, unicodeToAscii,
} = require("puny-coder");
```

```typescript
import {
  asciiToUnicode, unicodeToAscii,
} from "puny-coder";
```

### asciiToUnicode(text, onError, urlDecode)

```typescript
import {
  asciiToUnicode,
} from "puny-coder";

declare function asciiToUnicode(
  text: string,
  onError?: string,
  urlDecode?: boolean,
): string;
```

| Parameter   | Type       | Description                             |
| :---------- | :--------- | :---------------------------------------|
| `text`      | `string`   | **Required**. Size in bytes.            |
| `onError`   | `string`   | String that would be returned on error. |
| `urlDecode` | `boolean`  | Additional decode URL.                  |

### asciiToUnicode(text, onError, urlDecode)

```typescript
import {
  unicodeToAscii,
} from "puny-coder";

declare function unicodeToAscii(
  text: string,
  onError?: string,
  urlEncode?: boolean,
  skipOnValid?: boolean,
): string;
```

| Parameter     | Type       | Description                             |
| :------------ | :--------- | :-------------------------------------- |
| `text`        | `string`   | **Required**. Size in bytes.            |
| `onError`     | `string`   | String that would be returned on error. |
| `urlEncode`   | `boolean`  | Additional encode URL.                  |
| `skipOnValid` | `boolean`  | Skip conversion on valid input.         |

## See also

[💾 My other projects](https://r37r0m0d3l.icu/open_source_map)

<img alt="Open Source" src="https://raw.githubusercontent.com/r37r0m0d3l/r37r0m0d3l/master/osmap.svg?sanitize=true" width="960" height="520" style="display:block;height:auto;margin-left:auto;margin-right:auto;min-height:520px;min-width:960px;width:100%;">

<!-- Badges -->

[npm-version-img]: https://badgen.net/npm/v/punycoder?&icon=npm&label=npm&color=DD3636&v=1.0.0
[npm-version-url]: https://npmjs.com/package/punycoder

[npm-downloads-img]: https://badgen.net/npm/dt/punycoder?&icon=terminal&label=downloads&color=009688&v=1.0.0
[npm-downloads-url]: https://npmjs.com/package/punycoder

[gh-stars-img]: https://badgen.net/github/stars/r37r0m0d3l/punycoder?&icon=github&label=stars&color=FFCC33&v=1.0.0
[gh-stars-url]: https://github.com/r37r0m0d3l/punycoder

[node-image]: https://badgen.net/npm/node/punycoder
[node-url]: https://nodejs.org/en/download

[gh-checks-img]: https://badgen.net/github/checks/r37r0m0d3l/punycoder?&icon=github&v=1.0.0
[gh-checks-url]: https://github.com/r37r0m0d3l/punycoder

[travis-img]: https://badgen.net/travis/r37r0m0d3l/punycoder?&icon=travis&label=build&v=1.0.0
[travis-url]: https://travis-ci.com/github/r37r0m0d3l/punycoder

[ts-img]: https://badgen.net/npm/types/punycoder?&icon=typescript&label=types&color=1E90FF&v=1.0.0
[ts-url]: https://github.com/r37r0m0d3l/punycoder/blob/main/dist/index.d.ts

[sonarcloud-img]: https://sonarcloud.io/api/project_badges/measure?project=r37r0m0d3l_punycoder&metric=sqale_rating&v=1.0.0
[sonarcloud-url]: https://sonarcloud.io/dashboard?id=r37r0m0d3l_punycoder

[lgtm-img]: https://badgen.net/lgtm/grade/g/r37r0m0d3l/punycoder?&icon=lgtm&label=lgtm:js/ts&color=00C853&v=1.0.0
[lgtm-url]: https://lgtm.com/projects/g/r37r0m0d3l/punycoder/context:javascript

[codacy-img]: https://app.codacy.com/project/badge/Grade/b3458c991041406bbe85fdfd87498006
[codacy-url]: https://www.codacy.com/gh/r37r0m0d3l/punycoder/dashboard?&utm_source=github.com&amp;utm_medium=referral&amp;utm_content=r37r0m0d3l/punycoder&amp;utm_campaign=Badge_Grade

[snyk-img]: https://badgen.net/snyk/r37r0m0d3l/punycoder?&v=1.0.0
[snyk-url]: https://github.com/r37r0m0d3l/punycoder

[dependabot-img]: https://badgen.net/dependabot/r37r0m0d3l/punycoder?&icon=dependabot&v=1.0.0
[dependabot-url]: https://github.com/r37r0m0d3l/punycoder

[codefactor-img]: https://www.codefactor.io/repository/github/r37r0m0d3l/punycoder/badge?&style=flat-square&v=1.0.0
[codefactor-url]: https://www.codefactor.io/repository/github/r37r0m0d3l/punycoder