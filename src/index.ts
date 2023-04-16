import { parse, stringify } from "querystring";

abstract class Punycode {
  protected static readonly BASE = 36;
  protected static readonly DAMP = 700;
  protected static readonly DELIMITER = "\x2D";
  protected static readonly INITIAL_BIAS = 72;
  protected static readonly INITIAL_N = 0x80;
  protected static readonly MAX_INT = 0x7fffffff;
  protected static readonly SKEW = 38;
  protected static readonly T_MAX = 26;
  protected static readonly T_MIN = 1;

  protected static utf16decode(input: string): number[] {
    const length = input.length;
    const output = [];
    let index = 0;
    let value;
    let extra;
    while (index < length) {
      value = input.charCodeAt(index++);
      if ((value & 0xf800) === 0xd800) {
        extra = input.charCodeAt(index++);
        if ((value & 0xfc00) !== 0xd800 || (extra & 0xfc00) !== 0xdc00) {
          throw new RangeError("Punycode UTF-16 decode, illegal UTF-16 sequence");
        }
        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
      }
      output.push(value);
    }
    return output;
  }
  protected static utf16encode(input: string[]): string {
    const length = input.length;
    const output = [];
    let index = 0;
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return digit + 22 + 75 * (digit < 26) - ((flag !== 0) << 5);
  }

  protected static adapt(delta: number, numPoints: number, firstTime = false): number {
    let index;
    delta = firstTime ? Math.floor(delta / Punycode.DAMP) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    for (index = 0; delta > ((Punycode.BASE - Punycode.T_MIN) * Punycode.T_MAX) >> 1; index += Punycode.BASE) {
      delta = Math.floor(delta / (Punycode.BASE - Punycode.T_MIN));
    }
    return Math.floor(index + ((Punycode.BASE - Punycode.T_MIN + 1) * delta) / (delta + Punycode.SKEW));
  }

  protected static encodeBasic(bcp: number, flag = false): number {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    bcp -= (bcp - 97 < 26) << 5;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return bcp + ((!flag && bcp - 65 < 26) << 5);
  }

  protected static decode(input: string, shouldRestoreCase = true): string {
    const output = [];
    const caseFlags = [];
    const inputLength = input.length;
    let out, bias, basic, indexCharCode, ic, oldIndex, width, key, digit, track, len;
    let initialN = Punycode.INITIAL_N;
    let index = 0;
    bias = Punycode.INITIAL_BIAS;
    basic = input.lastIndexOf(Punycode.DELIMITER);
    if (basic < 0) {
      basic = 0;
    }
    for (indexCharCode = 0; indexCharCode < basic; ++indexCharCode) {
      if (shouldRestoreCase) {
        caseFlags[output.length] = input.charCodeAt(indexCharCode) - 65 < 26;
      }
      if (input.charCodeAt(indexCharCode) >= 0x80) {
        throw new RangeError("Punycode illegal input >= 0x80");
      }
      output.push(input.charCodeAt(indexCharCode));
    }
    for (ic = basic > 0 ? basic + 1 : 0; ic < inputLength; ) {
      for (oldIndex = index, width = 1, key = Punycode.BASE; ; key += Punycode.BASE) {
        if (ic >= inputLength) {
          throw RangeError("Punycode bad input 1");
        }
        digit = Punycode.decodeDigit(input.charCodeAt(ic++));
        if (digit >= Punycode.BASE) {
          throw RangeError("Punycode bad input 2");
        }
        if (digit > Math.floor((Punycode.MAX_INT - index) / width)) {
          throw RangeError("Punycode overflow 1");
        }
        index += digit * width;
        track = key <= bias ? Punycode.T_MIN : key >= bias + Punycode.T_MAX ? Punycode.T_MAX : key - bias;
        if (digit < track) {
          break;
        }
        if (width > Math.floor(Punycode.MAX_INT / (Punycode.BASE - track))) {
          throw RangeError("Punycode overflow 2");
        }
        width *= Punycode.BASE - track;
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
          output[index] = String.fromCharCode(output[index]).toUpperCase().charCodeAt(0);
        }
      }
    }
    return Punycode.utf16encode(output);
  }

  protected static encode(input: string, shouldPreserveCase = false): string {
    let head, index, max, digit, key, track, ijv, caseFlags;
    if (shouldPreserveCase) {
      caseFlags = Punycode.utf16decode(input);
    }
    const inputNumbers = Punycode.utf16decode(input.toLowerCase());
    const inputLength = inputNumbers.length;
    if (shouldPreserveCase) {
      for (index = 0; index < inputLength; index++) {
        caseFlags[index] = inputNumbers[index] !== caseFlags[index];
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
            caseFlags ? Punycode.encodeBasic(inputNumbers[index], caseFlags[index]) : inputNumbers[index],
          ),
        );
      }
    }
    const base = output.length;
    head = output.length;
    if (base > 0) {
      output.push(Punycode.DELIMITER);
    }
    while (head < inputLength) {
      for (max = Punycode.MAX_INT, index = 0; index < inputLength; ++index) {
        ijv = inputNumbers[index];
        if (ijv >= initialN && ijv < max) max = ijv;
      }
      if (max - initialN > Math.floor((Punycode.MAX_INT - delta) / (head + 1))) {
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
        if (ijv === initialN) {
          for (digit = delta, key = Punycode.BASE; ; key += Punycode.BASE) {
            track = key <= bias ? Punycode.T_MIN : key >= bias + Punycode.T_MAX ? Punycode.T_MAX : key - bias;
            if (digit < track) break;
            output.push(
              String.fromCharCode(Punycode.encodeDigit(track + ((digit - track) % (Punycode.BASE - track)), 0)),
            );
            digit = Math.floor((digit - track) / (Punycode.BASE - track));
          }
          output.push(String.fromCharCode(Punycode.encodeDigit(digit, shouldPreserveCase && caseFlags[index] ? 1 : 0)));
          bias = Punycode.adapt(delta, head + 1, head === base);
          delta = 0;
          ++head;
        }
      }
      ++delta;
      ++initialN;
    }
    return output.join("");
  }

  public static toAscii(domain: string, shouldPreserveCase = true): string {
    const domainArray = domain.split(".");
    const out = [];
    for (let index = 0; index < domainArray.length; ++index) {
      const element = domainArray[index];
      out.push(element.match(/[^A-Za-z0-9-]/) ? "xn--" + Punycode.encode(element, shouldPreserveCase) : element);
    }
    return out.join(".");
  }

  public static toUnicode(domain: string, shouldRestoreCase = true): string {
    const domainArray = domain.split(".");
    const out = [];
    for (let index = 0; index < domainArray.length; ++index) {
      const element = domainArray[index];
      out.push(element.match(/^xn--/) ? Punycode.decode(element.slice(4), shouldRestoreCase) : element);
    }
    return out.join(".");
  }
}

/**
 * @name unicodeToAscii
 * @description Converts unicode domain names to ASCII.
 * @param {string} [text]
 * @param {string=} [onError=text]
 * @param {boolean=} [urlEncode=true]
 * @param {boolean=} [skipOnValid=true]
 * @returns {string}
 */
function unicodeToAscii(text: string, onError: string = text, urlEncode = true, skipOnValid = true): string {
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
        const skip = result.replace(/%40/g, "").replace(/%23/g, "").replace(/[-.]+/g, ".");
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

/**
 * @name asciiToUnicode
 * @description Converts an ASCII domain name to Unicode.
 * @param {string} [text]
 * @param {string=} [onError=text]
 * @param {boolean} [urlDecode=true]
 * @returns {string}
 */
function asciiToUnicode(text: string, onError: string = text, urlDecode = true): string {
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
