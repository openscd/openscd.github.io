try{self["workbox:core:6.1.1"]&&_()}catch(e){}const e=(e,...t)=>{let s=e;return t.length>0&&(s+=` :: ${JSON.stringify(t)}`),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}try{self["workbox:routing:6.1.1"]&&_()}catch(e){}const s=e=>e&&"object"==typeof e?e:{handle:e};class i{constructor(e,t,i="GET"){this.handler=s(t),this.match=e,this.method=i}setCatchHandler(e){this.catchHandler=s(e)}}class r extends i{constructor(e,t,s){super((({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)}),t,s)}}class n{constructor(){this.t=new Map,this.i=new Map}get routes(){return this.t}addFetchListener(){self.addEventListener("fetch",(e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map((t=>{"string"==typeof t&&(t=[t]);const s=new Request(...t);return this.handleRequest({request:s,event:e})})));e.waitUntil(s),e.ports&&e.ports[0]&&s.then((()=>e.ports[0].postMessage(!0)))}}))}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const i=s.origin===location.origin,{params:r,route:n}=this.findMatchingRoute({event:t,request:e,sameOrigin:i,url:s});let a=n&&n.handler;const c=e.method;if(!a&&this.i.has(c)&&(a=this.i.get(c)),!a)return;let o;try{o=a.handle({url:s,request:e,event:t,params:r})}catch(e){o=Promise.reject(e)}const u=n&&n.catchHandler;return o instanceof Promise&&(this.o||u)&&(o=o.catch((async i=>{if(u)try{return await u.handle({url:s,request:e,event:t,params:r})}catch(e){i=e}if(this.o)return this.o.handle({url:s,request:e,event:t});throw i}))),o}findMatchingRoute({url:e,sameOrigin:t,request:s,event:i}){const r=this.t.get(s.method)||[];for(const n of r){let r;const a=n.match({url:e,sameOrigin:t,request:s,event:i});if(a)return r=a,(Array.isArray(a)&&0===a.length||a.constructor===Object&&0===Object.keys(a).length||"boolean"==typeof a)&&(r=void 0),{route:n,params:r}}return{}}setDefaultHandler(e,t="GET"){this.i.set(t,s(e))}setCatchHandler(e){this.o=s(e)}registerRoute(e){this.t.has(e.method)||this.t.set(e.method,[]),this.t.get(e.method).push(e)}unregisterRoute(e){if(!this.t.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this.t.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this.t.get(e.method).splice(s,1)}}let a;const c=()=>(a||(a=new n,a.addFetchListener(),a.addCacheListener()),a);function o(e,s,n){let a;if("string"==typeof e){const t=new URL(e,location.href);a=new i((({url:e})=>e.href===t.href),s,n)}else if(e instanceof RegExp)a=new r(e,s,n);else if("function"==typeof e)a=new i(e,s,n);else{if(!(e instanceof i))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});a=e}return c().registerRoute(a),a}try{self["workbox:strategies:6.1.1"]&&_()}catch(e){}const u={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null},l={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},f=e=>[l.prefix,e,l.suffix].filter((e=>e&&e.length>0)).join("-"),h=e=>e||f(l.precache),d=e=>e||f(l.runtime);function b(){return(b=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var i in s)Object.prototype.hasOwnProperty.call(s,i)&&(e[i]=s[i])}return e}).apply(this,arguments)}function w(e,t){const s=new URL(e);for(const e of t)s.searchParams.delete(e);return s.href}class p{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}const v=new Set;function m(e){return"string"==typeof e?new Request(e):e}class g{constructor(e,t){this.u={},Object.assign(this,t),this.event=t.event,this.l=e,this.h=new p,this.p=[],this.v=[...e.plugins],this.m=new Map;for(const e of this.v)this.m.set(e,{});this.event.waitUntil(this.h.promise)}fetch(e){return this.waitUntil((async()=>{const{event:s}=this;let i=m(e);if("navigate"===i.mode&&s instanceof FetchEvent&&s.preloadResponse){const e=await s.preloadResponse;if(e)return e}const r=this.hasCallback("fetchDidFail")?i.clone():null;try{for(const e of this.iterateCallbacks("requestWillFetch"))i=await e({request:i.clone(),event:s})}catch(e){throw new t("plugin-error-request-will-fetch",{thrownError:e})}const n=i.clone();try{let e;e=await fetch(i,"navigate"===i.mode?void 0:this.l.fetchOptions);for(const t of this.iterateCallbacks("fetchDidSucceed"))e=await t({event:s,request:n,response:e});return e}catch(e){throw r&&await this.runCallbacks("fetchDidFail",{error:e,event:s,originalRequest:r.clone(),request:n.clone()}),e}})())}async fetchAndCachePut(e){const t=await this.fetch(e),s=t.clone();return this.waitUntil(this.cachePut(e,s)),t}cacheMatch(e){return this.waitUntil((async()=>{const t=m(e);let s;const{cacheName:i,matchOptions:r}=this.l,n=await this.getCacheKey(t,"read"),a=b({},r,{cacheName:i});s=await caches.match(n,a);for(const e of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await e({cacheName:i,matchOptions:r,cachedResponse:s,request:n,event:this.event})||void 0;return s})())}async cachePut(e,s){const i=m(e);var r;await(r=0,new Promise((e=>setTimeout(e,r))));const n=await this.getCacheKey(i,"write");if(!s)throw new t("cache-put-with-no-response",{url:(a=n.url,new URL(String(a),location.href).href.replace(new RegExp(`^${location.origin}`),""))});var a;const c=await this.g(s);if(!c)return!1;const{cacheName:o,matchOptions:u}=this.l,l=await self.caches.open(o),f=this.hasCallback("cacheDidUpdate"),h=f?await async function(e,t,s,i){const r=w(t.url,s);if(t.url===r)return e.match(t,i);const n=b({},i,{ignoreSearch:!0}),a=await e.keys(t,n);for(const t of a)if(r===w(t.url,s))return e.match(t,i)}(l,n.clone(),["__WB_REVISION__"],u):null;try{await l.put(n,f?c.clone():c)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of v)await e()}(),e}for(const e of this.iterateCallbacks("cacheDidUpdate"))await e({cacheName:o,oldResponse:h,newResponse:c.clone(),request:n,event:this.event});return!0}async getCacheKey(e,t){if(!this.u[t]){let s=e;for(const e of this.iterateCallbacks("cacheKeyWillBeUsed"))s=m(await e({mode:t,request:s,event:this.event,params:this.params}));this.u[t]=s}return this.u[t]}hasCallback(e){for(const t of this.l.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(const s of this.iterateCallbacks(e))await s(t)}*iterateCallbacks(e){for(const t of this.l.plugins)if("function"==typeof t[e]){const s=this.m.get(t),i=i=>{const r=b({},i,{state:s});return t[e](r)};yield i}}waitUntil(e){return this.p.push(e),e}async doneWaiting(){let e;for(;e=this.p.shift();)await e}destroy(){this.h.resolve()}async g(e){let t=e,s=!1;for(const e of this.iterateCallbacks("cacheWillUpdate"))if(t=await e({request:this.request,response:t,event:this.event})||void 0,s=!0,!t)break;return s||t&&200!==t.status&&(t=void 0),t}}class y{constructor(e={}){this.cacheName=d(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const t=e.event,s="string"==typeof e.request?new Request(e.request):e.request,i="params"in e?e.params:void 0,r=new g(this,{event:t,request:s,params:i}),n=this.R(r,s,t);return[n,this.j(n,r,s,t)]}async R(e,s,i){let r;await e.runCallbacks("handlerWillStart",{event:i,request:s});try{if(r=await this.q(s,e),!r||"error"===r.type)throw new t("no-response",{url:s.url})}catch(t){for(const n of e.iterateCallbacks("handlerDidError"))if(r=await n({error:t,event:i,request:s}),r)break;if(!r)throw t}for(const t of e.iterateCallbacks("handlerWillRespond"))r=await t({event:i,request:s,response:r});return r}async j(e,t,s,i){let r,n;try{r=await e}catch(n){}try{await t.runCallbacks("handlerDidRespond",{event:i,request:s,response:r}),await t.doneWaiting()}catch(e){n=e}if(await t.runCallbacks("handlerDidComplete",{event:i,request:s,response:r,error:n}),t.destroy(),n)throw n}}function R(e,t){const s=t();return e.waitUntil(s),s}try{self["workbox:precaching:6.1.1"]&&_()}catch(e){}function j(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:i}=e;if(!i)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(i,location.href);return{cacheKey:e.href,url:e.href}}const r=new URL(i,location.href),n=new URL(i,location.href);return r.searchParams.set("__WB_REVISION__",s),{cacheKey:r.href,url:n.href}}class q{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:s})=>{if("install"===e.type){const e=t.originalRequest.url;s?this.notUpdatedURLs.push(e):this.updatedURLs.push(e)}return s}}}class U{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:e,params:t})=>{const s=t&&t.cacheKey||this.U.getCacheKeyForURL(e.url);return s?new Request(s):e},this.U=e}}let L,x;async function C(e,s){let i=null;if(e.url){i=new URL(e.url).origin}if(i!==self.location.origin)throw new t("cross-origin-copy-response",{origin:i});const r=e.clone(),n={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},a=s?s(n):n,c=function(){if(void 0===L){const e=new Response("");if("body"in e)try{new Response(e.body),L=!0}catch(e){L=!1}L=!1}return L}()?r.body:await r.blob();return new Response(c,a)}class E extends y{constructor(e={}){e.cacheName=h(e.cacheName),super(e),this.L=!1!==e.fallbackToNetwork,this.plugins.push(E.copyRedirectedCacheableResponsesPlugin)}async q(e,t){const s=await t.cacheMatch(e);return s||(t.event&&"install"===t.event.type?await this._(e,t):await this.C(e,t))}async C(e,s){let i;if(!this.L)throw new t("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return i=await s.fetch(e),i}async _(e,s){this.N();const i=await s.fetch(e);if(!await s.cachePut(e,i.clone()))throw new t("bad-precaching-response",{url:e.url,status:i.status});return i}N(){let e=null,t=0;for(const[s,i]of this.plugins.entries())i!==E.copyRedirectedCacheableResponsesPlugin&&(i===E.defaultPrecacheCacheabilityPlugin&&(e=s),i.cacheWillUpdate&&t++);0===t?this.plugins.push(E.defaultPrecacheCacheabilityPlugin):t>1&&null!==e&&this.plugins.splice(e,1)}}E.defaultPrecacheCacheabilityPlugin={cacheWillUpdate:async({response:e})=>!e||e.status>=400?null:e},E.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:async({response:e})=>e.redirected?await C(e):e};class N{constructor({cacheName:e,plugins:t=[],fallbackToNetwork:s=!0}={}){this.T=new Map,this.k=new Map,this.O=new Map,this.l=new E({cacheName:h(e),plugins:[...t,new U({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this.l}precache(e){this.addToCacheList(e),this.P||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this.P=!0)}addToCacheList(e){const s=[];for(const i of e){"string"==typeof i?s.push(i):i&&void 0===i.revision&&s.push(i.url);const{cacheKey:e,url:r}=j(i),n="string"!=typeof i&&i.revision?"reload":"default";if(this.T.has(r)&&this.T.get(r)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this.T.get(r),secondEntry:e});if("string"!=typeof i&&i.integrity){if(this.O.has(e)&&this.O.get(e)!==i.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:r});this.O.set(e,i.integrity)}if(this.T.set(r,e),this.k.set(r,n),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}install(e){return R(e,(async()=>{const t=new q;this.strategy.plugins.push(t);for(const[t,s]of this.T){const i=this.O.get(s),r=this.k.get(t),n=new Request(t,{integrity:i,cache:r,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:s},request:n,event:e}))}const{updatedURLs:s,notUpdatedURLs:i}=t;return{updatedURLs:s,notUpdatedURLs:i}}))}activate(e){return R(e,(async()=>{const e=await self.caches.open(this.strategy.cacheName),t=await e.keys(),s=new Set(this.T.values()),i=[];for(const r of t)s.has(r.url)||(await e.delete(r),i.push(r.url));return{deletedURLs:i}}))}getURLsToCacheKeys(){return this.T}getCachedURLs(){return[...this.T.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this.T.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this.strategy.cacheName)).match(s)}}createHandlerBoundToURL(e){const s=this.getCacheKeyForURL(e);if(!s)throw new t("non-precached-url",{url:e});return t=>(t.request=new Request(e),t.params=b({cacheKey:s},t.params),this.strategy.handle(t))}}const T=()=>(x||(x=new N),x);class k extends i{constructor(e,t){super((({request:s})=>{const i=e.getURLsToCacheKeys();for(const e of function*(e,{ignoreURLParametersMatching:t=[/^utm_/,/^fbclid$/],directoryIndex:s="index.html",cleanURLs:i=!0,urlManipulation:r}={}){const n=new URL(e,location.href);n.hash="",yield n.href;const a=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some((e=>e.test(s)))&&e.searchParams.delete(s);return e}(n,t);if(yield a.href,s&&a.pathname.endsWith("/")){const e=new URL(a.href);e.pathname+=s,yield e.href}if(i){const e=new URL(a.href);e.pathname+=".html",yield e.href}if(r){const e=r({url:n});for(const t of e)yield t.href}}(s.url,t)){const t=i.get(e);if(t)return{cacheKey:t}}}),e.strategy)}}var O;self.skipWaiting(),O={},function(e){T().precache(e)}([{url:"public/apple-touch-icon.png",revision:"62e7c75a8b21624dca15bd0bef539438"},{url:"public/css/normalize.css",revision:"112272e51c80ffe5bd01becd2ce7d656"},{url:"public/favicon-16x16.png",revision:"275aa2d0c672623cc28f0572348befe7"},{url:"public/favicon-32x32.png",revision:"2ee56f4805a985f34bd914dad9a5af78"},{url:"public/icon-192x192.png",revision:"31ae08296b6be35de83931d8e1cf966b"},{url:"public/icon-512x512.png",revision:"1e7723b8736961b09acce6ea63178a40"},{url:"public/icon.svg",revision:"26984e5d2724d581bc7fb39c3f7cb389"},{url:"public/js/worker.js",revision:"a77ab898eac9d3acc3841252aefe5f36"},{url:"public/js/xmlvalidate.js",revision:"13a15ca3eb50636fb4971e1ea7d664e8"},{url:"public/js/xmlvalidate.wasm",revision:"622a405972a204ca97e7e994a0e8244b"},{url:"public/json/plugins.json",revision:"84b29aadc667fc073a7e441577ce7f8a"},{url:"public/maskable_icon.png",revision:"dcf4d1e9a7c6d791c83345eadaa8251d"},{url:"public/monochrome_icon.png",revision:"329ec2d6785a691c932962b40c48f19f"},{url:"public/mstile-144x144.png",revision:"e65bc3ab3bcbf366bfb1a8aea688ba45"},{url:"public/mstile-150x150.png",revision:"a3b54491a78398fdd16d9d650bcee21a"},{url:"public/mstile-310x150.png",revision:"dbab2415b660994355da616a7b05f56e"},{url:"public/mstile-310x310.png",revision:"08f78b8fb9c4618eeb87dc76254dee39"},{url:"public/mstile-70x70.png",revision:"2707a4bc27e42e15c0bf88302bcab503"},{url:"src/carehtml/transform.js",revision:"682c7307173965c64aba9ca9c21890f8"},{url:"src/carehtml/wrap.js",revision:"1fc74fed432b4107a49bea6a928b314a"},{url:"src/Editing.js",revision:"0fd93a9f5684fa826cffaddc6efd6745"},{url:"src/editors/Communication.js",revision:"0e4d709c94ad4c6be3a509505e8f73b2"},{url:"src/editors/communication/connectedap-editor.js",revision:"c49c1140bef8b09d8e0eb90e2aa7d9d2"},{url:"src/editors/communication/foundation.js",revision:"83d4aaafdd671d25e5fd9156a1889c41"},{url:"src/editors/communication/p-types.js",revision:"b3b1e0ec404e8686ebed07d87616f23e"},{url:"src/editors/communication/subnetwork-editor.js",revision:"7dfadeb8201228c5cc4ba5657336829c"},{url:"src/editors/Substation.js",revision:"fd02c367f06bbea0822766734364bf08"},{url:"src/editors/substation/bay-editor.js",revision:"250d9a7af3cb7535950a75468fc76d2a"},{url:"src/editors/substation/conducting-equipment-editor.js",revision:"badd20e329edacce531912f6c21bfc2a"},{url:"src/editors/substation/conducting-equipment-types.js",revision:"6a17f9e96326a4a2efa76e5ce8470de8"},{url:"src/editors/substation/foundation.js",revision:"cec8e0bbc9b87315d61a408c897c2884"},{url:"src/editors/substation/guess-wizard.js",revision:"70cb06035cd66a1b85ea96e81316e660"},{url:"src/editors/substation/lnodewizard.js",revision:"5e6893201f1e87bc5d167994c64ac860"},{url:"src/editors/substation/substation-editor.js",revision:"2634bab5d6171ebef842402b5b0c548a"},{url:"src/editors/substation/voltage-level-editor.js",revision:"27930e3225f260400f0caff824efb642"},{url:"src/editors/Templates.js",revision:"60c928806df28457ddd6888d668249de"},{url:"src/editors/templates/enum-type-editor.js",revision:"05773dab965efae64d0ac9a40e51387a"},{url:"src/editors/templates/enum-val-editor.js",revision:"f783f9905ced34a97b7edb9ef9f3a185"},{url:"src/editors/templates/foundation.js",revision:"16a3a989178947796f89174229c5acca"},{url:"src/foundation.js",revision:"dbdc11df4190ad891c028dd42bac3f86"},{url:"src/icons.js",revision:"87dfcdf69850805ea9ebb1e95740dd25"},{url:"src/Importing.js",revision:"431fb8611f5abf8f542002167b3c00e8"},{url:"src/Logging.js",revision:"345ad38fbeb58507cfcce6f291046b25"},{url:"src/open-scd.js",revision:"9546730985a3937a973716044f6088e4"},{url:"src/Plugging.js",revision:"478042a700e6db851fafcf821a2c8ed4"},{url:"src/schemas.js",revision:"252dd9ff966b3e8ceb285b74624c267f"},{url:"src/Setting.js",revision:"0a39efc59a7e424b2d2a6baddb919ad6"},{url:"src/themes.js",revision:"8bbec3972055f9100a12262725b42940"},{url:"src/translations/de.js",revision:"96f4e68cf0492e5682541e7078535d3f"},{url:"src/translations/en.js",revision:"47e8d9500e4706fb801f554e50bc0c34"},{url:"src/translations/loader.js",revision:"9032cc10f0e34b8b6c3c1f5bc0a0c0a2"},{url:"src/triggered/SubscriberInfo.js",revision:"f3b51d06c1a5c37932e8c37fb8814327"},{url:"src/Validating.js",revision:"a3236c32040a8dfe1f4f83cb425a3dd2"},{url:"src/Waiting.js",revision:"16efa68af9e4f80ed8f9272d476e6269"},{url:"src/wizard-dialog.js",revision:"2c9757aebae6d4a822103c6bd32dc30a"},{url:"src/wizard-textfield.js",revision:"1f69ffbe818af4a3303ab70cfea86b2f"},{url:"src/Wizarding.js",revision:"049d20d758aaa4005ee8deac1a1972a0"},{url:"browserconfig.xml",revision:"a8c181f3745541f8aa4653452592763b"},{url:"CC-EULA.pdf",revision:"84642855997c978c5d96187c63835413"},{url:"CHANGELOG.md",revision:"28afb9069d976272010a7478f5684cf5"},{url:"favicon.ico",revision:"84e4fb128b947bc51ebf808a4f5b2512"},{url:"index.html",revision:"38441aa68935c766bee1427e2889ca8e"},{url:"manifest.json",revision:"bfaeaa0c06c6b68d4296488294daf260"},{url:"README.md",revision:"d9d59e5aabbb41280fd165ab26d447ca"}]),function(e){const t=T();o(new k(t,e))}(O),o(/.*/,new class extends y{constructor(e={}){super(e),this.plugins.some((e=>"cacheWillUpdate"in e))||this.plugins.unshift(u),this.W=e.networkTimeoutSeconds||0}async q(e,s){const i=[],r=[];let n;if(this.W){const{id:t,promise:a}=this.S({request:e,logs:i,handler:s});n=t,r.push(a)}const a=this.D({timeoutId:n,request:e,logs:i,handler:s});r.push(a);const c=await s.waitUntil((async()=>await s.waitUntil(Promise.race(r))||await a)());if(!c)throw new t("no-response",{url:e.url});return c}S({request:e,logs:t,handler:s}){let i;return{promise:new Promise((t=>{i=setTimeout((async()=>{t(await s.cacheMatch(e))}),1e3*this.W)})),id:i}}async D({timeoutId:e,request:t,logs:s,handler:i}){let r,n;try{n=await i.fetchAndCachePut(t)}catch(e){r=e}return e&&clearTimeout(e),!r&&n||(n=await i.cacheMatch(t)),n}},"GET");
//# sourceMappingURL=sw.js.map
