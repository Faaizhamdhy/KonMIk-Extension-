// ID: ext_softkomik
// NAME: Softkomik (ID)
// TYPE: comic
// VERSION: 1.0.1
// COLOR: #2563EB
// ICON: https://softkomik.app/favicon.ico
// REFERER: https://softkomik.app/

/**
 * Ekstensi KonMik untuk Softkomik (https://softkomik.app/)
 * Menggunakan bundle minimal CryptoJS AES-256-CBC murni tanpa polusi lingkungan.
 */

// Bundled Minimal AES & MD5 Decryptor (17 KB)
(()=>{var X=(k=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(k,{get:(h,A)=>(typeof require<"u"?require:h)[A]}):k)(function(k){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+k+'" is not supported')});var I=(k,h)=>()=>{try{return h||k((h={exports:{}}).exports,h),h.exports}catch(A){throw h=0,A}};var rr=I(()=>{});var T=I((N,er)=>{(function(k,h){typeof N=="object"?er.exports=N=h():typeof define=="function"&&define.amd?define([],h):k.CryptoJS=h()})(N,function(){var k=k||(function(h,A){var w;if(typeof window<"u"&&window.crypto&&(w=window.crypto),typeof self<"u"&&self.crypto&&(w=self.crypto),typeof globalThis<"u"&&globalThis.crypto&&(w=globalThis.crypto),!w&&typeof window<"u"&&window.msCrypto&&(w=window.msCrypto),!w&&typeof global<"u"&&global.crypto&&(w=global.crypto),!w&&typeof X=="function")try{w=rr()}catch{}var K=function(){if(w){if(typeof w.getRandomValues=="function")try{return w.getRandomValues(new Uint32Array(1))[0]}catch{}if(typeof w.randomBytes=="function")try{return w.randomBytes(4).readInt32LE()}catch{}}throw new Error("Native crypto module could not be used to get secure random number.")},H=Object.create||(function(){function r(){}return function(e){var v;return r.prototype=e,v=new r,r.prototype=null,v}})(),P={},n=P.lib={},C=n.Base=(function(){return{extend:function(r){var e=H(this);return r&&e.mixIn(r),(!e.hasOwnProperty("init")||this.init===e.init)&&(e.init=function(){e.$super.init.apply(this,arguments)}),e.init.prototype=e,e.$super=this,e},create:function(){var r=this.extend();return r.init.apply(r,arguments),r},init:function(){},mixIn:function(r){for(var e in r)r.hasOwnProperty(e)&&(this[e]=r[e]);r.hasOwnProperty("toString")&&(this.toString=r.toString)},clone:function(){return this.init.prototype.extend(this)}}})(),_=n.WordArray=C.extend({init:function(r,e){r=this.words=r||[],e!=A?this.sigBytes=e:this.sigBytes=r.length*4},toString:function(r){return(r||x).stringify(this)},concat:function(r){var e=this.words,v=r.words,d=this.sigBytes,m=r.sigBytes;if(this.clamp(),d%4)for(var z=0;z<m;z++){var F=v[z>>>2]>>>24-z%4*8&255;e[d+z>>>2]|=F<<24-(d+z)%4*8}else for(var B=0;B<m;B+=4)e[d+B>>>2]=v[B>>>2];return this.sigBytes+=m,this},clamp:function(){var r=this.words,e=this.sigBytes;r[e>>>2]&=4294967295<<32-e%4*8,r.length=h.ceil(e/4)},clone:function(){var r=C.clone.call(this);return r.words=this.words.slice(0),r},random:function(r){for(var e=[],v=0;v<r;v+=4)e.push(K());return new _.init(e,r)}}),u=P.enc={},x=u.Hex={stringify:function(r){for(var e=r.words,v=r.sigBytes,d=[],m=0;m<v;m++){var z=e[m>>>2]>>>24-m%4*8&255;d.push((z>>>4).toString(16)),d.push((z&15).toString(16))}return d.join("")},parse:function(r){for(var e=r.length,v=[],d=0;d<e;d+=2)v[d>>>3]|=parseInt(r.substr(d,2),16)<<24-d%8*4;return new _.init(v,e/2)}},l=u.Latin1={stringify:function(r){for(var e=r.words,v=r.sigBytes,d=[],m=0;m<v;m++){var z=e[m>>>2]>>>24-m%4*8&255;d.push(String.fromCharCode(z))}return d.join("")},parse:function(r){for(var e=r.length,v=[],d=0;d<e;d++)v[d>>>2]|=(r.charCodeAt(d)&255)<<24-d%4*8;return new _.init(v,e)}},p=u.Utf8={stringify:function(r){try{return decodeURIComponent(escape(l.stringify(r)))}catch{throw new Error("Malformed UTF-8 data")}},parse:function(r){return l.parse(unescape(encodeURIComponent(r)))}},y=n.BufferedBlockAlgorithm=C.extend({reset:function(){this._data=new _.init,this._nDataBytes=0},_append:function(r){typeof r=="string"&&(r=p.parse(r)),this._data.concat(r),this._nDataBytes+=r.sigBytes},_process:function(r){var e,v=this._data,d=v.words,m=v.sigBytes,z=this.blockSize,F=z*4,B=m/F;r?B=h.ceil(B):B=h.max((B|0)-this._minBufferSize,0);var W=B*z,q=h.min(W*4,m);if(W){for(var t=0;t<W;t+=z)this._doProcessBlock(d,t);e=d.splice(0,W),v.sigBytes-=q}return new _.init(e,q)},clone:function(){var r=C.clone.call(this);return r._data=this._data.clone(),r},_minBufferSize:0}),E=n.Hasher=y.extend({cfg:C.extend(),init:function(r){this.cfg=this.cfg.extend(r),this.reset()},reset:function(){y.reset.call(this),this._doReset()},update:function(r){return this._append(r),this._process(),this},finalize:function(r){r&&this._append(r);var e=this._doFinalize();return e},blockSize:512/32,_createHelper:function(r){return function(e,v){return new r.init(v).finalize(e)}},_createHmacHelper:function(r){return function(e,v){return new b.HMAC.init(r,v).finalize(e)}}}),b=P.algo={};return P})(Math);return k})});var Q=I((O,tr)=>{(function(k,h){typeof O=="object"?tr.exports=O=h(T()):typeof define=="function"&&define.amd?define(["./core"],h):h(k.CryptoJS)})(O,function(k){return(function(){var h=k,A=h.lib,w=A.WordArray,K=h.enc,H=K.Base64={stringify:function(n){var C=n.words,_=n.sigBytes,u=this._map;n.clamp();for(var x=[],l=0;l<_;l+=3)for(var p=C[l>>>2]>>>24-l%4*8&255,y=C[l+1>>>2]>>>24-(l+1)%4*8&255,E=C[l+2>>>2]>>>24-(l+2)%4*8&255,b=p<<16|y<<8|E,r=0;r<4&&l+r*.75<_;r++)x.push(u.charAt(b>>>6*(3-r)&63));var e=u.charAt(64);if(e)for(;x.length%4;)x.push(e);return x.join("")},parse:function(n){var C=n.length,_=this._map,u=this._reverseMap;if(!u){u=this._reverseMap=[];for(var x=0;x<_.length;x++)u[_.charCodeAt(x)]=x}var l=_.charAt(64);if(l){var p=n.indexOf(l);p!==-1&&(C=p)}return P(n,C,u)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="};function P(n,C,_){for(var u=[],x=0,l=0;l<C;l++)if(l%4){var p=_[n.charCodeAt(l-1)]<<l%4*2,y=_[n.charCodeAt(l)]>>>6-l%4*2,E=p|y;u[x>>>2]|=E<<24-x%4*8,x++}return w.create(u,x)}})(),k.enc.Base64})});var Y=I((V,nr)=>{(function(k,h){typeof V=="object"?nr.exports=V=h(T()):typeof define=="function"&&define.amd?define(["./core"],h):h(k.CryptoJS)})(V,function(k){return(function(h){var A=k,w=A.lib,K=w.WordArray,H=w.Hasher,P=A.algo,n=[];(function(){for(var p=0;p<64;p++)n[p]=h.abs(h.sin(p+1))*4294967296|0})();var C=P.MD5=H.extend({_doReset:function(){this._hash=new K.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(p,y){for(var E=0;E<16;E++){var b=y+E,r=p[b];p[b]=(r<<8|r>>>24)&16711935|(r<<24|r>>>8)&4278255360}var e=this._hash.words,v=p[y+0],d=p[y+1],m=p[y+2],z=p[y+3],F=p[y+4],B=p[y+5],W=p[y+6],q=p[y+7],t=p[y+8],c=p[y+9],g=p[y+10],a=p[y+11],S=p[y+12],D=p[y+13],L=p[y+14],R=p[y+15],i=e[0],o=e[1],s=e[2],f=e[3];i=_(i,o,s,f,v,7,n[0]),f=_(f,i,o,s,d,12,n[1]),s=_(s,f,i,o,m,17,n[2]),o=_(o,s,f,i,z,22,n[3]),i=_(i,o,s,f,F,7,n[4]),f=_(f,i,o,s,B,12,n[5]),s=_(s,f,i,o,W,17,n[6]),o=_(o,s,f,i,q,22,n[7]),i=_(i,o,s,f,t,7,n[8]),f=_(f,i,o,s,c,12,n[9]),s=_(s,f,i,o,g,17,n[10]),o=_(o,s,f,i,a,22,n[11]),i=_(i,o,s,f,S,7,n[12]),f=_(f,i,o,s,D,12,n[13]),s=_(s,f,i,o,L,17,n[14]),o=_(o,s,f,i,R,22,n[15]),i=u(i,o,s,f,d,5,n[16]),f=u(f,i,o,s,W,9,n[17]),s=u(s,f,i,o,a,14,n[18]),o=u(o,s,f,i,v,20,n[19]),i=u(i,o,s,f,B,5,n[20]),f=u(f,i,o,s,g,9,n[21]),s=u(s,f,i,o,R,14,n[22]),o=u(o,s,f,i,F,20,n[23]),i=u(i,o,s,f,c,5,n[24]),f=u(f,i,o,s,L,9,n[25]),s=u(s,f,i,o,z,14,n[26]),o=u(o,s,f,i,t,20,n[27]),i=u(i,o,s,f,D,5,n[28]),f=u(f,i,o,s,m,9,n[29]),s=u(s,f,i,o,q,14,n[30]),o=u(o,s,f,i,S,20,n[31]),i=x(i,o,s,f,B,4,n[32]),f=x(f,i,o,s,t,11,n[33]),s=x(s,f,i,o,a,16,n[34]),o=x(o,s,f,i,L,23,n[35]),i=x(i,o,s,f,d,4,n[36]),f=x(f,i,o,s,F,11,n[37]),s=x(s,f,i,o,q,16,n[38]),o=x(o,s,f,i,g,23,n[39]),i=x(i,o,s,f,D,4,n[40]),f=x(f,i,o,s,v,11,n[41]),s=x(s,f,i,o,z,16,n[42]),o=x(o,s,f,i,W,23,n[43]),i=x(i,o,s,f,c,4,n[44]),f=x(f,i,o,s,S,11,n[45]),s=x(s,f,i,o,R,16,n[46]),o=x(o,s,f,i,m,23,n[47]),i=l(i,o,s,f,v,6,n[48]),f=l(f,i,o,s,q,10,n[49]),s=l(s,f,i,o,L,15,n[50]),o=l(o,s,f,i,B,21,n[51]),i=l(i,o,s,f,S,6,n[52]),f=l(f,i,o,s,z,10,n[53]),s=l(s,f,i,o,g,15,n[54]),o=l(o,s,f,i,d,21,n[55]),i=l(i,o,s,f,t,6,n[56]),f=l(f,i,o,s,R,10,n[57]),s=l(s,f,i,o,W,15,n[58]),o=l(o,s,f,i,D,21,n[59]),i=l(i,o,s,f,F,6,n[60]),f=l(f,i,o,s,a,10,n[61]),s=l(s,f,i,o,m,15,n[62]),o=l(o,s,f,i,c,21,n[63]),e[0]=e[0]+i|0,e[1]=e[1]+o|0,e[2]=e[2]+s|0,e[3]=e[3]+f|0},_doFinalize:function(){var p=this._data,y=p.words,E=this._nDataBytes*8,b=p.sigBytes*8;y[b>>>5]|=128<<24-b%32;var r=h.floor(E/4294967296),e=E;y[(b+64>>>9<<4)+15]=(r<<8|r>>>24)&16711935|(r<<24|r>>>8)&4278255360,y[(b+64>>>9<<4)+14]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360,p.sigBytes=(y.length+1)*4,this._process();for(var v=this._hash,d=v.words,m=0;m<4;m++){var z=d[m];d[m]=(z<<8|z>>>24)&16711935|(z<<24|z>>>8)&4278255360}return v},clone:function(){var p=H.clone.call(this);return p._hash=this._hash.clone(),p}});function _(p,y,E,b,r,e,v){var d=p+(y&E|~y&b)+r+v;return(d<<e|d>>>32-e)+y}function u(p,y,E,b,r,e,v){var d=p+(y&b|E&~b)+r+v;return(d<<e|d>>>32-e)+y}function x(p,y,E,b,r,e,v){var d=p+(y^E^b)+r+v;return(d<<e|d>>>32-e)+y}function l(p,y,E,b,r,e,v){var d=p+(E^(y|~b))+r+v;return(d<<e|d>>>32-e)+y}A.MD5=H._createHelper(C),A.HmacMD5=H._createHmacHelper(C)})(Math),k.MD5})});var ar=I((J,ir)=>{(function(k,h){typeof J=="object"?ir.exports=J=h(T()):typeof define=="function"&&define.amd?define(["./core"],h):h(k.CryptoJS)})(J,function(k){return(function(){var h=k,A=h.lib,w=A.WordArray,K=A.Hasher,H=h.algo,P=[],n=H.SHA1=K.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(C,_){for(var u=this._hash.words,x=u[0],l=u[1],p=u[2],y=u[3],E=u[4],b=0;b<80;b++){if(b<16)P[b]=C[_+b]|0;else{var r=P[b-3]^P[b-8]^P[b-14]^P[b-16];P[b]=r<<1|r>>>31}var e=(x<<5|x>>>27)+E+P[b];b<20?e+=(l&p|~l&y)+1518500249:b<40?e+=(l^p^y)+1859775393:b<60?e+=(l&p|l&y|p&y)-1894007588:e+=(l^p^y)-899497514,E=y,y=p,p=l<<30|l>>>2,l=x,x=e}u[0]=u[0]+x|0,u[1]=u[1]+l|0,u[2]=u[2]+p|0,u[3]=u[3]+y|0,u[4]=u[4]+E|0},_doFinalize:function(){var C=this._data,_=C.words,u=this._nDataBytes*8,x=C.sigBytes*8;return _[x>>>5]|=128<<24-x%32,_[(x+64>>>9<<4)+14]=Math.floor(u/4294967296),_[(x+64>>>9<<4)+15]=u,C.sigBytes=_.length*4,this._process(),this._hash},clone:function(){var C=K.clone.call(this);return C._hash=this._hash.clone(),C}});h.SHA1=K._createHelper(n),h.HmacSHA1=K._createHmacHelper(n)})(),k.SHA1})});var sr=I((M,or)=>{(function(k,h){typeof M=="object"?or.exports=M=h(T()):typeof define=="function"&&define.amd?define(["./core"],h):h(k.CryptoJS)})(M,function(k){(function(){var h=k,A=h.lib,w=A.Base,K=h.enc,H=K.Utf8,P=h.algo,n=P.HMAC=w.extend({init:function(C,_){C=this._hasher=new C.init,typeof _=="string"&&(_=H.parse(_));var u=C.blockSize,x=u*4;_.sigBytes>x&&(_=C.finalize(_)),_.clamp();for(var l=this._oKey=_.clone(),p=this._iKey=_.clone(),y=l.words,E=p.words,b=0;b<u;b++)y[b]^=1549556828,E[b]^=909522486;l.sigBytes=p.sigBytes=x,this.reset()},reset:function(){var C=this._hasher;C.reset(),C.update(this._iKey)},update:function(C){return this._hasher.update(C),this},finalize:function(C){var _=this._hasher,u=_.finalize(C);_.reset();var x=_.finalize(this._oKey.clone().concat(u));return x}})})()})});var j=I((U,fr)=>{(function(k,h,A){typeof U=="object"?fr.exports=U=h(T(),ar(),sr()):typeof define=="function"&&define.amd?define(["./core","./sha1","./hmac"],h):h(k.CryptoJS)})(U,function(k){return(function(){var h=k,A=h.lib,w=A.Base,K=A.WordArray,H=h.algo,P=H.MD5,n=H.EvpKDF=w.extend({cfg:w.extend({keySize:128/32,hasher:P,iterations:1}),init:function(C){this.cfg=this.cfg.extend(C)},compute:function(C,_){for(var u,x=this.cfg,l=x.hasher.create(),p=K.create(),y=p.words,E=x.keySize,b=x.iterations;y.length<E;){u&&l.update(u),u=l.update(C).finalize(_),l.reset();for(var r=1;r<b;r++)u=l.finalize(u),l.reset();p.concat(u)}return p.sigBytes=E*4,p}});h.EvpKDF=function(C,_,u){return n.create(u).compute(C,_)}})(),k.EvpKDF})});var Z=I((G,cr)=>{(function(k,h,A){typeof G=="object"?cr.exports=G=h(T(),j()):typeof define=="function"&&define.amd?define(["./core","./evpkdf"],h):h(k.CryptoJS)})(G,function(k){k.lib.Cipher||(function(h){var A=k,w=A.lib,K=w.Base,H=w.WordArray,P=w.BufferedBlockAlgorithm,n=A.enc,C=n.Utf8,_=n.Base64,u=A.algo,x=u.EvpKDF,l=w.Cipher=P.extend({cfg:K.extend(),createEncryptor:function(t,c){return this.create(this._ENC_XFORM_MODE,t,c)},createDecryptor:function(t,c){return this.create(this._DEC_XFORM_MODE,t,c)},init:function(t,c,g){this.cfg=this.cfg.extend(g),this._xformMode=t,this._key=c,this.reset()},reset:function(){P.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){t&&this._append(t);var c=this._doFinalize();return c},keySize:128/32,ivSize:128/32,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:(function(){function t(c){return typeof c=="string"?q:F}return function(c){return{encrypt:function(g,a,S){return t(a).encrypt(c,g,a,S)},decrypt:function(g,a,S){return t(a).decrypt(c,g,a,S)}}}})()}),p=w.StreamCipher=l.extend({_doFinalize:function(){var t=this._process(!0);return t},blockSize:1}),y=A.mode={},E=w.BlockCipherMode=K.extend({createEncryptor:function(t,c){return this.Encryptor.create(t,c)},createDecryptor:function(t,c){return this.Decryptor.create(t,c)},init:function(t,c){this._cipher=t,this._iv=c}}),b=y.CBC=(function(){var t=E.extend();t.Encryptor=t.extend({processBlock:function(g,a){var S=this._cipher,D=S.blockSize;c.call(this,g,a,D),S.encryptBlock(g,a),this._prevBlock=g.slice(a,a+D)}}),t.Decryptor=t.extend({processBlock:function(g,a){var S=this._cipher,D=S.blockSize,L=g.slice(a,a+D);S.decryptBlock(g,a),c.call(this,g,a,D),this._prevBlock=L}});function c(g,a,S){var D,L=this._iv;L?(D=L,this._iv=h):D=this._prevBlock;for(var R=0;R<S;R++)g[a+R]^=D[R]}return t})(),r=A.pad={},e=r.Pkcs7={pad:function(t,c){for(var g=c*4,a=g-t.sigBytes%g,S=a<<24|a<<16|a<<8|a,D=[],L=0;L<a;L+=4)D.push(S);var R=H.create(D,a);t.concat(R)},unpad:function(t){var c=t.words[t.sigBytes-1>>>2]&255;t.sigBytes-=c}},v=w.BlockCipher=l.extend({cfg:l.cfg.extend({mode:b,padding:e}),reset:function(){var t;l.reset.call(this);var c=this.cfg,g=c.iv,a=c.mode;this._xformMode==this._ENC_XFORM_MODE?t=a.createEncryptor:(t=a.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==t?this._mode.init(this,g&&g.words):(this._mode=t.call(a,this,g&&g.words),this._mode.__creator=t)},_doProcessBlock:function(t,c){this._mode.processBlock(t,c)},_doFinalize:function(){var t,c=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(c.pad(this._data,this.blockSize),t=this._process(!0)):(t=this._process(!0),c.unpad(t)),t},blockSize:128/32}),d=w.CipherParams=K.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}}),m=A.format={},z=m.OpenSSL={stringify:function(t){var c,g=t.ciphertext,a=t.salt;return a?c=H.create([1398893684,1701076831]).concat(a).concat(g):c=g,c.toString(_)},parse:function(t){var c,g=_.parse(t),a=g.words;return a[0]==1398893684&&a[1]==1701076831&&(c=H.create(a.slice(2,4)),a.splice(0,4),g.sigBytes-=16),d.create({ciphertext:g,salt:c})}},F=w.SerializableCipher=K.extend({cfg:K.extend({format:z}),encrypt:function(t,c,g,a){a=this.cfg.extend(a);var S=t.createEncryptor(g,a),D=S.finalize(c),L=S.cfg;return d.create({ciphertext:D,key:g,iv:L.iv,algorithm:t,mode:L.mode,padding:L.padding,blockSize:t.blockSize,formatter:a.format})},decrypt:function(t,c,g,a){a=this.cfg.extend(a),c=this._parse(c,a.format);var S=t.createDecryptor(g,a).finalize(c.ciphertext);return S},_parse:function(t,c){return typeof t=="string"?c.parse(t,this):t}}),B=A.kdf={},W=B.OpenSSL={execute:function(t,c,g,a,S){if(a||(a=H.random(64/8)),S)var D=x.create({keySize:c+g,hasher:S}).compute(t,a);else var D=x.create({keySize:c+g}).compute(t,a);var L=H.create(D.words.slice(c),g*4);return D.sigBytes=c*4,d.create({key:D,iv:L,salt:a})}},q=w.PasswordBasedCipher=F.extend({cfg:F.cfg.extend({kdf:W}),encrypt:function(t,c,g,a){a=this.cfg.extend(a);var S=a.kdf.execute(g,t.keySize,t.ivSize,a.salt,a.hasher);a.iv=S.iv;var D=F.encrypt.call(this,t,c,S.key,a);return D.mixIn(S),D},decrypt:function(t,c,g,a){a=this.cfg.extend(a),c=this._parse(c,a.format);var S=a.kdf.execute(g,t.keySize,t.ivSize,c.salt,a.hasher);a.iv=S.iv;var D=F.decrypt.call(this,t,c,S.key,a);return D}})})()})});var dr=I(($,vr)=>{(function(k,h,A){typeof $=="object"?vr.exports=$=h(T(),Q(),Y(),j(),Z()):typeof define=="function"&&define.amd?define(["./core","./enc-base64","./md5","./evpkdf","./cipher-core"],h):h(k.CryptoJS)})($,function(k){return(function(){var h=k,A=h.lib,w=A.BlockCipher,K=h.algo,H=[],P=[],n=[],C=[],_=[],u=[],x=[],l=[],p=[],y=[];(function(){for(var r=[],e=0;e<256;e++)e<128?r[e]=e<<1:r[e]=e<<1^283;for(var v=0,d=0,e=0;e<256;e++){var m=d^d<<1^d<<2^d<<3^d<<4;m=m>>>8^m&255^99,H[v]=m,P[m]=v;var z=r[v],F=r[z],B=r[F],W=r[m]*257^m*16843008;n[v]=W<<24|W>>>8,C[v]=W<<16|W>>>16,_[v]=W<<8|W>>>24,u[v]=W;var W=B*16843009^F*65537^z*257^v*16843008;x[m]=W<<24|W>>>8,l[m]=W<<16|W>>>16,p[m]=W<<8|W>>>24,y[m]=W,v?(v=z^r[r[r[B^z]]],d^=r[r[d]]):v=d=1}})();var E=[0,1,2,4,8,16,32,64,128,27,54],b=K.AES=w.extend({_doReset:function(){var r;if(!(this._nRounds&&this._keyPriorReset===this._key)){for(var e=this._keyPriorReset=this._key,v=e.words,d=e.sigBytes/4,m=this._nRounds=d+6,z=(m+1)*4,F=this._keySchedule=[],B=0;B<z;B++)B<d?F[B]=v[B]:(r=F[B-1],B%d?d>6&&B%d==4&&(r=H[r>>>24]<<24|H[r>>>16&255]<<16|H[r>>>8&255]<<8|H[r&255]):(r=r<<8|r>>>24,r=H[r>>>24]<<24|H[r>>>16&255]<<16|H[r>>>8&255]<<8|H[r&255],r^=E[B/d|0]<<24),F[B]=F[B-d]^r);for(var W=this._invKeySchedule=[],q=0;q<z;q++){var B=z-q;if(q%4)var r=F[B];else var r=F[B-4];q<4||B<=4?W[q]=r:W[q]=x[H[r>>>24]]^l[H[r>>>16&255]]^p[H[r>>>8&255]]^y[H[r&255]]}}},encryptBlock:function(r,e){this._doCryptBlock(r,e,this._keySchedule,n,C,_,u,H)},decryptBlock:function(r,e){var v=r[e+1];r[e+1]=r[e+3],r[e+3]=v,this._doCryptBlock(r,e,this._invKeySchedule,x,l,p,y,P);var v=r[e+1];r[e+1]=r[e+3],r[e+3]=v},_doCryptBlock:function(r,e,v,d,m,z,F,B){for(var W=this._nRounds,q=r[e]^v[0],t=r[e+1]^v[1],c=r[e+2]^v[2],g=r[e+3]^v[3],a=4,S=1;S<W;S++){var D=d[q>>>24]^m[t>>>16&255]^z[c>>>8&255]^F[g&255]^v[a++],L=d[t>>>24]^m[c>>>16&255]^z[g>>>8&255]^F[q&255]^v[a++],R=d[c>>>24]^m[g>>>16&255]^z[q>>>8&255]^F[t&255]^v[a++],i=d[g>>>24]^m[q>>>16&255]^z[t>>>8&255]^F[c&255]^v[a++];q=D,t=L,c=R,g=i}var D=(B[q>>>24]<<24|B[t>>>16&255]<<16|B[c>>>8&255]<<8|B[g&255])^v[a++],L=(B[t>>>24]<<24|B[c>>>16&255]<<16|B[g>>>8&255]<<8|B[q&255])^v[a++],R=(B[c>>>24]<<24|B[g>>>16&255]<<16|B[q>>>8&255]<<8|B[t&255])^v[a++],i=(B[g>>>24]<<24|B[q>>>16&255]<<16|B[t>>>8&255]<<8|B[c&255])^v[a++];r[e]=D,r[e+1]=L,r[e+2]=R,r[e+3]=i},keySize:256/32});h.AES=w._createHelper(b)})(),k.AES})});var hr=T();Q();Y();j();Z();dr();typeof globalThis<"u"&&(globalThis.CryptoJS=hr);typeof window<"u"&&(window.CryptoJS=hr);})();


const BASE = 'https://softkomik.app';
const SECRET_KEY = 'nYTInq9MwR4pWa8yeXtu/2iO3t9nGP65WHpWEvqpEdU=';

const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': BASE + '/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

async function fetchHtml(url) {
    const res = await fetch(url, { headers: defaultHeaders });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
    return await res.text();
}

function extractNextData(html) {
    const tag = '<script id="__NEXT_DATA__" type="application/json">';
    const idx1 = html.indexOf(tag);
    if (idx1 === -1) return null;
    const idx2 = html.indexOf('</script>', idx1);
    if (idx2 === -1) return null;
    const jsonStr = html.slice(idx1 + tag.length, idx2);
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        return null;
    }
}

function decryptStk(stkBase64) {
    if (!stkBase64) return null;
    try {
        const C = (typeof globalThis !== 'undefined' && globalThis.CryptoJS) ? globalThis.CryptoJS : (typeof window !== 'undefined' ? window.CryptoJS : null);
        if (!C || !C.AES) return null;
        const bytes = C.AES.decrypt(stkBase64, SECRET_KEY);
        const decryptedStr = bytes.toString(C.enc.Utf8);
        return JSON.parse(decryptedStr);
    } catch (e) {
        return null;
    }
}

function fullCoverUrl(rawUrl) {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
    if (rawUrl.startsWith('//')) return 'https:' + rawUrl;
    return 'https://cover.softdevices.my.id/softkomik-cover/' + rawUrl.replace(/^\/+/, '');
}

var KonmikExtension = {
    /**
     * Mengambil daftar komik terbaru atau hasil pencarian.
     */
    async getList(page = 1, query = '', filters = {}) {
        let url = BASE + '/komik/update?page=' + (page || 1);
        if (query && query.trim()) {
            url = BASE + '/komik?q=' + encodeURIComponent(query.trim()) + '&page=' + (page || 1);
        }

        const html = await fetchHtml(url);
        const nextData = extractNextData(html);
        const pageProps = nextData && nextData.props ? nextData.props.pageProps : null;
        const initialData = pageProps ? pageProps.initialData : null;
        const items = (initialData && Array.isArray(initialData.data)) ? initialData.data : [];

        const mangaList = items.map(item => {
            const slug = item.title_slug || item.slug || item.link || String(item._id || '');
            let cover = fullCoverUrl(item.gambar);
            const latestCh = item.latest_chapter ? ('Ch. ' + item.latest_chapter) : '';
            const ratingVal = (item.rating && item.rating.value) ? String(Number(item.rating.value).toFixed(1)) : '0';

            return {
                id: slug,
                title: item.title || 'Untitled',
                cover_url: cover,
                latest_chapter: latestCh,
                rating: ratingVal,
                views: '-'
            };
        });

        return { manga_list: mangaList };
    },

    /**
     * Mengambil detail komik beserta daftar seluruh chapter.
     */
    async getDetail(slug) {
        const cleanSlug = slug.replace(/^\/+/, '').replace(/\/.*$/, '');
        const url = BASE + '/' + cleanSlug;
        const html = await fetchHtml(url);
        const nextData = extractNextData(html);
        const pageProps = nextData && nextData.props ? nextData.props.pageProps : null;

        const decrypted = decryptStk(pageProps ? pageProps._stk : null);
        const data = (decrypted && decrypted.data) ? decrypted.data : {};
        const chData = (decrypted && decrypted.chapterData) ? decrypted.chapterData : {};

        let cover = fullCoverUrl(data.gambar);
        const ratingVal = (data.rating && data.rating.value) ? String(Number(data.rating.value).toFixed(1)) : '0';
        let genres = Array.isArray(data.Genre) ? data.Genre : [];

        const rawChapters = (chData && Array.isArray(chData.chapter)) ? chData.chapter : [];
        const chapters = rawChapters.map(ch => {
            const chNum = typeof ch === 'object' ? (ch.chapter || '') : String(ch);
            const endpoint = cleanSlug + '/chapter/' + chNum;
            return {
                id: endpoint,
                title: 'Chapter ' + chNum,
                endpoint: endpoint,
                date: (typeof ch === 'object' && ch.created_at) ? ch.created_at : '-'
            };
        });

        return {
            title: data.title || 'Untitled',
            cover_url: cover,
            description: data.sinopsis || 'Tidak ada deskripsi.',
            author: data.author || 'Unknown',
            artist: data.author || 'Unknown',
            rating: ratingVal,
            views: data.visitor ? String(data.visitor) : '-',
            genres: genres,
            chapters: chapters
        };
    },

    /**
     * Mengambil seluruh URL gambar pada suatu bab/chapter.
     */
    async getChapterImages(endpoint) {
        const cleanEndpoint = endpoint.replace(/^\/+/, '');
        const url = BASE + '/' + cleanEndpoint;
        const html = await fetchHtml(url);
        const nextData = extractNextData(html);
        const pageProps = nextData && nextData.props ? nextData.props.pageProps : null;

        const decrypted = decryptStk(pageProps ? pageProps._stk : null);
        const imgList = (decrypted && Array.isArray(decrypted.imgList)) ? decrypted.imgList : [];
        const isInter = decrypted && decrypted.data && decrypted.data.data && decrypted.data.data.storageInter2;
        const cdnBase = isInter ? 'https://image.komik.im/softkomik' : 'https://psy1.komik.im';

        return imgList.map(img => {
            if (img.startsWith('http://') || img.startsWith('https://')) return img;
            return cdnBase + '/' + img.replace(/^\/+/, '');
        });
    }
};
