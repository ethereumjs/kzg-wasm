
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var kzg = (() => {
  var _scriptDir = import.meta.url;
  
  return (
function(moduleArg = {}) {

var b=moduleArg,n,t;b.ready=new Promise((a,d)=>{n=a;t=d});var u=Object.assign({},b),w="",x,y,fs=require("fs"),aa=require("path");w=require("url").fileURLToPath(new URL("./",import.meta.url));x=a=>{a=ba(a)?new URL(a):aa.normalize(a);return fs.readFileSync(a,void 0)};y=a=>{a=x(a);a.buffer||(a=new Uint8Array(a));return a};process.argv.slice(2);b.print||console.log.bind(console);var z=b.printErr||console.error.bind(console);Object.assign(b,u);u=null;var A;b.wasmBinary&&(A=b.wasmBinary);
"object"!=typeof WebAssembly&&C("no native wasm support detected");var D,E=!1,F,G;function H(){var a=D.buffer;b.HEAP8=F=new Int8Array(a);b.HEAP16=new Int16Array(a);b.HEAPU8=G=new Uint8Array(a);b.HEAPU16=new Uint16Array(a);b.HEAP32=new Int32Array(a);b.HEAPU32=new Uint32Array(a);b.HEAPF32=new Float32Array(a);b.HEAPF64=new Float64Array(a)}var I=[],J=[],K=[];function ca(){var a=b.preRun.shift();I.unshift(a)}var L=0,M=null,N=null;
function C(a){b.onAbort?.(a);a="Aborted("+a+")";z(a);E=!0;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");t(a);throw a;}var da=a=>a.startsWith("data:application/octet-stream;base64,"),ba=a=>a.startsWith("file://"),O;if(b.locateFile){if(O="../wasm/kzg.wasm",!da(O)){var P=O;O=b.locateFile?b.locateFile(P,w):w+P}}else O=(new URL("../wasm/kzg.wasm",import.meta.url)).href;
function ea(){var a=O;return Promise.resolve().then(()=>{if(a==O&&A)var d=new Uint8Array(A);else if(y)d=y(a);else throw"both async and sync fetching of the wasm failed";return d})}function fa(a,d){return ea().then(c=>WebAssembly.instantiate(c,a)).then(c=>c).then(d,c=>{z(`failed to asynchronously prepare wasm: ${c}`);C(c)})}function ha(a,d){return fa(a,d)}
var Q=a=>{for(;0<a.length;)a.shift()(b)},R="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0,S=a=>{if(a){for(var d=G,c=a+NaN,e=a;d[e]&&!(e>=c);)++e;if(16<e-a&&d.buffer&&R)a=R.decode(d.subarray(a,e));else{for(c="";a<e;){var f=d[a++];if(f&128){var l=d[a++]&63;if(192==(f&224))c+=String.fromCharCode((f&31)<<6|l);else{var q=d[a++]&63;f=224==(f&240)?(f&15)<<12|l<<6|q:(f&7)<<18|l<<12|q<<6|d[a++]&63;65536>f?c+=String.fromCharCode(f):(f-=65536,c+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else c+=
String.fromCharCode(f)}a=c}}else a="";return a},ja=(a,d,c,e)=>{var f={string:h=>{var p=0;if(null!==h&&void 0!==h&&0!==h){for(var g=p=0;g<h.length;++g){var m=h.charCodeAt(g);127>=m?p++:2047>=m?p+=2:55296<=m&&57343>=m?(p+=4,++g):p+=3}var r=p+1;g=p=T(r);m=G;if(0<r){r=g+r-1;for(var B=0;B<h.length;++B){var k=h.charCodeAt(B);if(55296<=k&&57343>=k){var ia=h.charCodeAt(++B);k=65536+((k&1023)<<10)|ia&1023}if(127>=k){if(g>=r)break;m[g++]=k}else{if(2047>=k){if(g+1>=r)break;m[g++]=192|k>>6}else{if(65535>=k){if(g+
2>=r)break;m[g++]=224|k>>12}else{if(g+3>=r)break;m[g++]=240|k>>18;m[g++]=128|k>>12&63}m[g++]=128|k>>6&63}m[g++]=128|k&63}}m[g]=0}}return p},array:h=>{var p=T(h.length);F.set(h,p);return p}};a=b["_"+a];var l=[],q=0;if(e)for(var v=0;v<e.length;v++){var W=f[c[v]];W?(0===q&&(q=U()),l[v]=W(e[v])):l[v]=e[v]}c=a.apply(null,l);return c=function(h){0!==q&&V(q);return"string"===d?S(h):"boolean"===d?!!h:h}(c)},ka={c:(a,d,c,e)=>{C(`Assertion failed: ${S(a)}, at: `+[d?S(d):"unknown filename",c,e?S(e):"unknown function"])},
b:(a,d,c)=>G.copyWithin(a,d,d+c),a:a=>{var d=G.length;a>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var e=d*(1+.2/c);e=Math.min(e,a+100663296);var f=Math;e=Math.max(a,e);a:{f=(f.min.call(f,2147483648,e+(65536-e%65536)%65536)-D.buffer.byteLength+65535)/65536;try{D.grow(f);H();var l=1;break a}catch(q){}l=void 0}if(l)return!0}return!1}},X=function(){function a(c){X=c.exports;D=X.d;H();J.unshift(X.e);L--;b.monitorRunDependencies?.(L);0==L&&(null!==M&&(clearInterval(M),M=null),N&&(c=N,N=null,
c()));return X}var d={a:ka};L++;b.monitorRunDependencies?.(L);if(b.instantiateWasm)try{return b.instantiateWasm(d,a)}catch(c){z(`Module.instantiateWasm callback failed with error: ${c}`),t(c)}ha(d,function(c){a(c.instance)}).catch(t);return{}}();b._load_trusted_setup_from_wasm=(a,d,c,e)=>(b._load_trusted_setup_from_wasm=X.f)(a,d,c,e);b._free_trusted_setup_wasm=()=>(b._free_trusted_setup_wasm=X.g)();b._blob_to_kzg_commitment_wasm=a=>(b._blob_to_kzg_commitment_wasm=X.h)(a);
b._compute_blob_kzg_proof_wasm=(a,d)=>(b._compute_blob_kzg_proof_wasm=X.i)(a,d);b._verify_blob_kzg_proof_wasm=(a,d,c)=>(b._verify_blob_kzg_proof_wasm=X.j)(a,d,c);b._verify_kzg_proof_wasm=(a,d,c,e)=>(b._verify_kzg_proof_wasm=X.k)(a,d,c,e);var U=()=>(U=X.m)(),V=a=>(V=X.n)(a),T=a=>(T=X.o)(a);b.cwrap=(a,d,c,e)=>{var f=!c||c.every(l=>"number"===l||"boolean"===l);return"string"!==d&&f&&!e?b["_"+a]:function(){return ja(a,d,c,arguments)}};var Y;N=function la(){Y||Z();Y||(N=la)};
function Z(){function a(){if(!Y&&(Y=!0,b.calledRun=!0,!E)){Q(J);n(b);if(b.onRuntimeInitialized)b.onRuntimeInitialized();if(b.postRun)for("function"==typeof b.postRun&&(b.postRun=[b.postRun]);b.postRun.length;){var d=b.postRun.shift();K.unshift(d)}Q(K)}}if(!(0<L)){if(b.preRun)for("function"==typeof b.preRun&&(b.preRun=[b.preRun]);b.preRun.length;)ca();Q(I);0<L||(b.setStatus?(b.setStatus("Running..."),setTimeout(function(){setTimeout(function(){b.setStatus("")},1);a()},1)):a())}}
if(b.preInit)for("function"==typeof b.preInit&&(b.preInit=[b.preInit]);0<b.preInit.length;)b.preInit.pop()();Z();


  return moduleArg.ready
}
);
})();
export default kzg;