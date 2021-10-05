import { parse, stringify } from "querystring";

abstract class Punycode {
  protected static readonly INITIAL_N = 0x80;
  protected static readonly INITIAL_BIAS = 72;
  protected static readonly DELIMITER = "\x2D";
  protected static readonly BASE = 36;
  protected static readonly DAMP = 700;
  protected static readonly T_MIN = 1;
  protected static readonly T_MAX = 26;
  protected static readonly SKEW = 38;
  protected static readonly MAX_INT = 0x7fffffff;

  protected static utf16decode(input: string): number[] {
    let output = [];
    let index = 0;
    let length = input.length;
    let value;
    let extra;
    while (index < length) {
      value = input.charCodeAt(index++);
      if ((value & 0xf800) === 0xd800) {
        extra = input.charCodeAt(index++);
        if ((value & 0xfc00) !== 0xd800 || (extra & 0xfc00) !== 0xdc00) {
          throw new RangeError(
            "Punycode UTF-16 decode, illegal UTF-16 sequence"
          );
        }
        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
      }
      output.push(value);
    }
    return output;
  }
  protected static utf16encode(input: string[]): string {
    let output = [];
    let index = 0;
    let length = input.length;
    let value;
    while (index < length) {
      value = input[index++];
      if ((value & 0xf800) === 0xd800) {
        throw new RangeError("Punycode UTF-16 encode, illegal UTF-16 value");
      }
      if (value > 0xffff) {
        value -= 0x10000;
        output.push(String.fromCharCode(((value >>> 10) & 0x3ff) | 0xd800));
        value = 0xdc00 | (value & 0x3ff);
      }
      output.push(String.fromCharCode(value));
    }
    return output.join("");
  }

  protected static decodeDigit(charPoint: number): number {
    return charPoint - 48 < 10
      ? charPoint - 22
      : charPoint - 65 < 26
        ? charPoint - 65
        : charPoint - 97 < 26
          ? charPoint - 97
          : Punycode.BASE;
  }

  protected static encodeDigit(digit: number, flag: 0 | 1): number {
    // @ts-ignore
    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
  }

  protected static adapt(
    delta: number,
    numPoints: number,
    firstTime: boolean = false
  ): number {
    let index;
    delta = firstTime ? Math.floor(delta / Punycode.DAMP) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    for (
      index = 0;
      delta > ((Punycode.BASE - Punycode.T_MIN) * Punycode.T_MAX) >> 1;
      index += Punycode.BASE
    ) {
      delta = Math.floor(delta / (Punycode.BASE - Punycode.T_MIN));
    }
    return Math.floor(
      index +
      ((Punycode.BASE - Punycode.T_MIN + 1) * delta) / (delta + Punycode.SKEW)
    );
  }

  protected static encodeBasic(bcp: number, flag: boolean = false): number {
    // @ts-ignore
    bcp -= (bcp - 97 < 26) << 5;
    // @ts-ignore
    return bcp + ((!flag && bcp - 65 < 26) << 5);
  }

  protected static decode(
    input: string,
    shouldRestoreCase: boolean = true
  ): string {
    const output = [];
    const caseFlags = [];
    const inputLength = input.length;
    let out, bias, basic, j, ic, oldIndex, w, k, digit, t, len;
    let initialN = Punycode.INITIAL_N;
    let index = 0;
    bias = Punycode.INITIAL_BIAS;
    basic = input.lastIndexOf(Punycode.DELIMITER);
    if (basic < 0) {
      basic = 0;
    }
    for (j = 0; j < basic; ++j) {
      if (shouldRestoreCase)
        caseFlags[output.length] = input.charCodeAt(j) - 65 < 26;
      if (input.charCodeAt(j) >= 0x80) {
        throw new RangeError("Punycode illegal input >= 0x80");
      }
      output.push(input.charCodeAt(j));
    }
    for (ic = basic > 0 ? basic + 1 : 0; ic < inputLength; ) {
      for (oldIndex = index, w = 1, k = Punycode.BASE; ; k += Punycode.BASE) {
        if (ic >= inputLength) {
          throw RangeError("Punycode bad input 1");
        }
        digit = Punycode.decodeDigit(input.charCodeAt(ic++));
        if (digit >= Punycode.BASE) {
          throw RangeError("Punycode bad input 2");
        }
        if (digit > Math.floor((Punycode.MAX_INT - index) / w)) {
          throw RangeError("Punycode overflow 1");
        }
        index += digit * w;
        t =
          k <= bias
            ? Punycode.T_MIN
            : k >= bias + Punycode.T_MAX
              ? Punycode.T_MAX
              : k - bias;
        if (digit < t) {
          break;
        }
        if (w > Math.floor(Punycode.MAX_INT / (Punycode.BASE - t))) {
          throw RangeError("Punycode overflow 2");
        }
        w *= Punycode.BASE - t;
      }
      out = output.length + 1;
      bias = Punycode.adapt(index - oldIndex, out, oldIndex === 0);
      if (Math.floor(index / out) > Punycode.MAX_INT - initialN) {
        throw RangeError("Punycode overflow 3");
      }
      initialN += Math.floor(index / out);
      index %= out;
      if (shouldRestoreCase) {
        caseFlags.splice(index, 0, input.charCodeAt(ic - 1) - 65 < 26);
      }
      output.splice(index, 0, initialN);
      index++;
    }
    if (shouldRestoreCase) {
      for (index = 0, len = output.length; index < len; index++) {
        if (caseFlags[index]) {
          output[index] = String.fromCharCode(output[index])
            .toUpperCase()
            .charCodeAt(0);
        }
      }
    }
    return Punycode.utf16encode(output);
  }

  protected static encode(
    input: string,
    shouldPreserveCase: boolean = false
  ): string {
    let head, base, index, max, q, k, t, ijv, caseFlags;
    if (shouldPreserveCase) {
      caseFlags = Punycode.utf16decode(input);
    }
    const inputNumbers = Punycode.utf16decode(input.toLowerCase());
    const inputLength = inputNumbers.length;
    if (shouldPreserveCase) {
      for (index = 0; index < inputLength; index++) {
        caseFlags[index] = inputNumbers[index] != caseFlags[index];
      }
    }
    const output = [];
    let initialN = Punycode.INITIAL_N;
    let delta = 0;
    let bias = Punycode.INITIAL_BIAS;
    for (index = 0; index < inputLength; ++index) {
      if (inputNumbers[index] < 0x80) {
        output.push(
          String.fromCharCode(
            caseFlags
              ? Punycode.encodeBasic(inputNumbers[index], caseFlags[index])
              : inputNumbers[index]
          )
        );
      }
    }
    head = base = output.length;
    if (base > 0) {
      output.push(Punycode.DELIMITER);
    }
    while (head < inputLength) {
      for (max = Punycode.MAX_INT, index = 0; index < inputLength; ++index) {
        ijv = inputNumbers[index];
        if (ijv >= initialN && ijv < max) max = ijv;
      }
      if (
        max - initialN >
        Math.floor((Punycode.MAX_INT - delta) / (head + 1))
      ) {
        throw RangeError("Punycode overflow 1");
      }
      delta += (max - initialN) * (head + 1);
      initialN = max;
      for (index = 0; index < inputLength; ++index) {
        ijv = inputNumbers[index];
        if (ijv < initialN) {
          if (++delta > Punycode.MAX_INT) {
            throw RangeError("Punycode overflow 2");
          }
        }
        if (ijv == initialN) {
          for (q = delta, k = Punycode.BASE; ; k += Punycode.BASE) {
            t =
              k <= bias
                ? Punycode.T_MIN
                : k >= bias + Punycode.T_MAX
                  ? Punycode.T_MAX
                  : k - bias;
            if (q < t) break;
            output.push(
              String.fromCharCode(
                Punycode.encodeDigit(t + ((q - t) % (Punycode.BASE - t)), 0)
              )
            );
            q = Math.floor((q - t) / (Punycode.BASE - t));
          }
          output.push(
            String.fromCharCode(
              Punycode.encodeDigit(
                q,
                shouldPreserveCase && caseFlags[index] ? 1 : 0
              )
            )
          );
          bias = Punycode.adapt(delta, head + 1, head == base);
          delta = 0;
          ++head;
        }
      }
      ++delta;
      ++initialN;
    }
    return output.join("");
  }

  public static toAscii(
    domain: string,
    shouldPreserveCase: boolean = true
  ): string {
    const domainArray = domain.split(".");
    const out = [];
    for (let index = 0; index < domainArray.length; ++index) {
      const element = domainArray[index];
      out.push(
        element.match(/[^A-Za-z0-9-]/)
          ? "xn--" + Punycode.encode(element, shouldPreserveCase)
          : element
      );
    }
    return out.join(".");
  }

  public static toUnicode(
    domain: string,
    shouldRestoreCase: boolean = true
  ): string {
    const domainArray = domain.split(".");
    const out = [];
    for (let index = 0; index < domainArray.length; ++index) {
      const element = domainArray[index];
      out.push(
        element.match(/^xn--/)
          ? Punycode.decode(element.slice(4), shouldRestoreCase)
          : element
      );
    }
    return out.join(".");
  }
}

function unicodeToAscii(
  text: string,
  onError: string = text,
  urlEncode: boolean = true,
  skipOnValid: boolean = true
): string {
  try {
    let result;
    if (urlEncode) {
      result = stringify({ "": Punycode.toAscii(text) }, undefined, " ").trim();
    } else {
      result = Punycode.toAscii(text);
    }
    if (result === `xn--${text}` || result === `xn--${text}-`) {
      return text;
    }
    if (urlEncode && skipOnValid) {
      if (text.includes("@") || text.includes("#")) {
        const clean = text.replace(/@/g, "").replace(/#/g, "");
        const skip = result
          .replace(/%40/g, "")
          .replace(/%23/g, "")
          .replace(/[-.]+/g, ".");
        console.dir({ clean, skip });
        if (skip === `xn.${clean}` || skip === `xn.${clean}-`) {
          return text;
        }
      }
    }
    return result;
  } catch {
    return onError;
  }
}

function asciiToUnicode(
  text: string,
  onError: string = text,
  urlDecode: boolean = true
): string {
  try {
    if (urlDecode) {
      return Punycode.toUnicode(Object.keys(parse(text))[0]);
    } else {
      return Punycode.toUnicode(text);
    }
  } catch {
    return onError;
  }
}

export { asciiToUnicode, unicodeToAscii };
