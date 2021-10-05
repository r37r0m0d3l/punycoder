declare function unicodeToAscii(text: string, onError?: string, urlEncode?: boolean, skipOnValid?: boolean): string;
declare function asciiToUnicode(text: string, onError?: string, urlDecode?: boolean): string;
export { asciiToUnicode, unicodeToAscii };
