/**
 * @name unicodeToAscii
 * @description Converts unicode domain names to ASCII.
 * @param {string} [text]
 * @param {string=} [onError=text]
 * @param {boolean=} [urlEncode=true]
 * @param {boolean=} [skipOnValid=true]
 * @returns {string}
 */
declare function unicodeToAscii(text: string, onError?: string, urlEncode?: boolean, skipOnValid?: boolean): string;
/**
 * @name asciiToUnicode
 * @description Converts an ASCII domain name to Unicode.
 * @param {string} [text]
 * @param {string=} [onError=text]
 * @param {boolean} [urlDecode=true]
 * @returns {string}
 */
declare function asciiToUnicode(text: string, onError?: string, urlDecode?: boolean): string;
export { asciiToUnicode, unicodeToAscii };
