var S=Object.create;var x=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var B=Object.getPrototypeOf,C=Object.prototype.hasOwnProperty;var m=i=>x(i,"__esModule",{value:!0});var y=(i,e)=>{m(i);for(var n in e)x(i,n,{get:e[n],enumerable:!0})},X=(i,e,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of w(e))!C.call(i,o)&&o!=="default"&&x(i,o,{get:()=>e[o],enumerable:!(n=N(e,o))||n.enumerable});return i},L=i=>X(m(x(i!=null?S(B(i)):{},"default",i&&i.__esModule&&"default"in i?{get:()=>i.default,enumerable:!0}:{value:i,enumerable:!0})),i);y(exports,{asciiToUnicode:()=>R,unicodeToAscii:()=>D});var b=L(require("querystring")),r=class{static utf16decode(e){let n=[],o=0,c=e.length,t,a;for(;o<c;){if(t=e.charCodeAt(o++),(t&63488)==55296){if(a=e.charCodeAt(o++),(t&64512)!=55296||(a&64512)!=56320)throw new RangeError("Punycode UTF-16 decode, illegal UTF-16 sequence");t=((t&1023)<<10)+(a&1023)+65536}n.push(t)}return n}static utf16encode(e){let n=[],o=0,c=e.length,t;for(;o<c;){if(t=e[o++],(t&63488)==55296)throw new RangeError("Punycode UTF-16 encode, illegal UTF-16 value");t>65535&&(t-=65536,n.push(String.fromCharCode(t>>>10&1023|55296)),t=56320|t&1023),n.push(String.fromCharCode(t))}return n.join("")}static decodeDigit(e){return e-48<10?e-22:e-65<26?e-65:e-97<26?e-97:r.BASE}static encodeDigit(e,n){return e+22+75*(e<26)-((n!=0)<<5)}static adapt(e,n,o=!1){let c;for(e=o?Math.floor(e/r.DAMP):e>>1,e+=Math.floor(e/n),c=0;e>(r.BASE-r.T_MIN)*r.T_MAX>>1;c+=r.BASE)e=Math.floor(e/(r.BASE-r.T_MIN));return Math.floor(c+(r.BASE-r.T_MIN+1)*e/(e+r.SKEW))}static encodeBasic(e,n=!1){return e-=(e-97<26)<<5,e+((!n&&e-65<26)<<5)}static decode(e,n=!0){let o=[],c=[],t=e.length,a,g,h,l,d,M,u,I,A,p,T,E=r.INITIAL_N,f=0;for(g=r.INITIAL_BIAS,h=e.lastIndexOf(r.DELIMITER),h<0&&(h=0),l=0;l<h;++l){if(n&&(c[o.length]=e.charCodeAt(l)-65<26),e.charCodeAt(l)>=128)throw new RangeError("Punycode illegal input >= 0x80");o.push(e.charCodeAt(l))}for(d=h>0?h+1:0;d<t;){for(M=f,u=1,I=r.BASE;;I+=r.BASE){if(d>=t)throw RangeError("Punycode bad input 1");if(A=r.decodeDigit(e.charCodeAt(d++)),A>=r.BASE)throw RangeError("Punycode bad input 2");if(A>Math.floor((r.MAX_INT-f)/u))throw RangeError("Punycode overflow 1");if(f+=A*u,p=I<=g?r.T_MIN:I>=g+r.T_MAX?r.T_MAX:I-g,A<p)break;if(u>Math.floor(r.MAX_INT/(r.BASE-p)))throw RangeError("Punycode overflow 2");u*=r.BASE-p}if(a=o.length+1,g=r.adapt(f-M,a,M===0),Math.floor(f/a)>r.MAX_INT-E)throw RangeError("Punycode overflow 3");E+=Math.floor(f/a),f%=a,n&&c.splice(f,0,e.charCodeAt(d-1)-65<26),o.splice(f,0,E),f++}if(n)for(f=0,T=o.length;f<T;f++)c[f]&&(o[f]=String.fromCharCode(o[f]).toUpperCase().charCodeAt(0));return r.utf16encode(o)}static encode(e,n=!1){let o,c,t,a,g,h,l,d,M;n&&(M=r.utf16decode(e));let u=r.utf16decode(e.toLowerCase()),I=u.length;if(n)for(t=0;t<I;t++)M[t]=u[t]!=M[t];let A=[],p=r.INITIAL_N,T=0,E=r.INITIAL_BIAS;for(t=0;t<I;++t)u[t]<128&&A.push(String.fromCharCode(M?r.encodeBasic(u[t],M[t]):u[t]));for(o=c=A.length,c>0&&A.push(r.DELIMITER);o<I;){for(a=r.MAX_INT,t=0;t<I;++t)d=u[t],d>=p&&d<a&&(a=d);if(a-p>Math.floor((r.MAX_INT-T)/(o+1)))throw RangeError("Punycode overflow 1");for(T+=(a-p)*(o+1),p=a,t=0;t<I;++t){if(d=u[t],d<p&&++T>r.MAX_INT)throw RangeError("Punycode overflow 2");if(d==p){for(g=T,h=r.BASE;l=h<=E?r.T_MIN:h>=E+r.T_MAX?r.T_MAX:h-E,!(g<l);h+=r.BASE)A.push(String.fromCharCode(r.encodeDigit(l+(g-l)%(r.BASE-l),0))),g=Math.floor((g-l)/(r.BASE-l));A.push(String.fromCharCode(r.encodeDigit(g,n&&M[t]?1:0))),E=r.adapt(T,o+1,o==c),T=0,++o}}++T,++p}return A.join("")}static toAscii(e,n=!0){let o=e.split("."),c=[];for(let t=0;t<o.length;++t){let a=o[t];c.push(a.match(/[^A-Za-z0-9-]/)?"xn--"+r.encode(a,n):a)}return c.join(".")}static toUnicode(e,n=!0){let o=e.split("."),c=[];for(let t=0;t<o.length;++t){let a=o[t];c.push(a.match(/^xn--/)?r.decode(a.slice(4),n):a)}return c.join(".")}},s=r;s.INITIAL_N=128,s.INITIAL_BIAS=72,s.DELIMITER="-",s.BASE=36,s.DAMP=700,s.T_MIN=1,s.T_MAX=26,s.SKEW=38,s.MAX_INT=2147483647;function D(i,e=i,n=!0,o=!0){try{let c;if(n?c=(0,b.stringify)({"":s.toAscii(i)},void 0," ").trim():c=s.toAscii(i),c===`xn--${i}`||c===`xn--${i}-`)return i;if(n&&o&&(i.includes("@")||i.includes("#"))){let t=i.replace(/@/g,"").replace(/#/g,""),a=c.replace(/%40/g,"").replace(/%23/g,"").replace(/[-.]+/g,".");if(console.dir({clean:t,skip:a}),a===`xn.${t}`||a===`xn.${t}-`)return i}return c}catch{return e}}function R(i,e=i,n=!0){try{return n?s.toUnicode(Object.keys((0,b.parse)(i))[0]):s.toUnicode(i)}catch{return e}}0&&(module.exports={asciiToUnicode,unicodeToAscii});
