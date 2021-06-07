try{self["workbox:core:6.1.5"]&&_()}catch(e){}const e=(e,...t)=>{let s=e;return t.length>0&&(s+=` :: ${JSON.stringify(t)}`),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}try{self["workbox:routing:6.1.5"]&&_()}catch(e){}const s=e=>e&&"object"==typeof e?e:{handle:e};class i{constructor(e,t,i="GET"){this.handler=s(t),this.match=e,this.method=i}setCatchHandler(e){this.catchHandler=s(e)}}class r extends i{constructor(e,t,s){super((({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)}),t,s)}}class n{constructor(){this.t=new Map,this.i=new Map}get routes(){return this.t}addFetchListener(){self.addEventListener("fetch",(e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map((t=>{"string"==typeof t&&(t=[t]);const s=new Request(...t);return this.handleRequest({request:s,event:e})})));e.waitUntil(s),e.ports&&e.ports[0]&&s.then((()=>e.ports[0].postMessage(!0)))}}))}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const i=s.origin===location.origin,{params:r,route:n}=this.findMatchingRoute({event:t,request:e,sameOrigin:i,url:s});let c=n&&n.handler;const a=e.method;if(!c&&this.i.has(a)&&(c=this.i.get(a)),!c)return;let o;try{o=c.handle({url:s,request:e,event:t,params:r})}catch(e){o=Promise.reject(e)}const u=n&&n.catchHandler;return o instanceof Promise&&(this.o||u)&&(o=o.catch((async i=>{if(u)try{return await u.handle({url:s,request:e,event:t,params:r})}catch(e){i=e}if(this.o)return this.o.handle({url:s,request:e,event:t});throw i}))),o}findMatchingRoute({url:e,sameOrigin:t,request:s,event:i}){const r=this.t.get(s.method)||[];for(const n of r){let r;const c=n.match({url:e,sameOrigin:t,request:s,event:i});if(c)return r=c,(Array.isArray(c)&&0===c.length||c.constructor===Object&&0===Object.keys(c).length||"boolean"==typeof c)&&(r=void 0),{route:n,params:r}}return{}}setDefaultHandler(e,t="GET"){this.i.set(t,s(e))}setCatchHandler(e){this.o=s(e)}registerRoute(e){this.t.has(e.method)||this.t.set(e.method,[]),this.t.get(e.method).push(e)}unregisterRoute(e){if(!this.t.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this.t.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this.t.get(e.method).splice(s,1)}}let c;const a=()=>(c||(c=new n,c.addFetchListener(),c.addCacheListener()),c);function o(e,s,n){let c;if("string"==typeof e){const t=new URL(e,location.href);c=new i((({url:e})=>e.href===t.href),s,n)}else if(e instanceof RegExp)c=new r(e,s,n);else if("function"==typeof e)c=new i(e,s,n);else{if(!(e instanceof i))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});c=e}return a().registerRoute(c),c}try{self["workbox:strategies:6.1.5"]&&_()}catch(e){}const u={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null},l={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},d=e=>[l.prefix,e,l.suffix].filter((e=>e&&e.length>0)).join("-"),f=e=>e||d(l.precache),h=e=>e||d(l.runtime);function b(){return(b=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var i in s)Object.prototype.hasOwnProperty.call(s,i)&&(e[i]=s[i])}return e}).apply(this,arguments)}function p(e,t){const s=new URL(e);for(const e of t)s.searchParams.delete(e);return s.href}class w{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}const v=new Set;function g(e){return"string"==typeof e?new Request(e):e}class m{constructor(e,t){this.u={},Object.assign(this,t),this.event=t.event,this.l=e,this.h=new w,this.p=[],this.v=[...e.plugins],this.g=new Map;for(const e of this.v)this.g.set(e,{});this.event.waitUntil(this.h.promise)}async fetch(e){const{event:s}=this;let i=g(e);if("navigate"===i.mode&&s instanceof FetchEvent&&s.preloadResponse){const e=await s.preloadResponse;if(e)return e}const r=this.hasCallback("fetchDidFail")?i.clone():null;try{for(const e of this.iterateCallbacks("requestWillFetch"))i=await e({request:i.clone(),event:s})}catch(e){throw new t("plugin-error-request-will-fetch",{thrownError:e})}const n=i.clone();try{let e;e=await fetch(i,"navigate"===i.mode?void 0:this.l.fetchOptions);for(const t of this.iterateCallbacks("fetchDidSucceed"))e=await t({event:s,request:n,response:e});return e}catch(e){throw r&&await this.runCallbacks("fetchDidFail",{error:e,event:s,originalRequest:r.clone(),request:n.clone()}),e}}async fetchAndCachePut(e){const t=await this.fetch(e),s=t.clone();return this.waitUntil(this.cachePut(e,s)),t}async cacheMatch(e){const t=g(e);let s;const{cacheName:i,matchOptions:r}=this.l,n=await this.getCacheKey(t,"read"),c=b({},r,{cacheName:i});s=await caches.match(n,c);for(const e of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await e({cacheName:i,matchOptions:r,cachedResponse:s,request:n,event:this.event})||void 0;return s}async cachePut(e,s){const i=g(e);var r;await(r=0,new Promise((e=>setTimeout(e,r))));const n=await this.getCacheKey(i,"write");if(!s)throw new t("cache-put-with-no-response",{url:(c=n.url,new URL(String(c),location.href).href.replace(new RegExp(`^${location.origin}`),""))});var c;const a=await this.m(s);if(!a)return!1;const{cacheName:o,matchOptions:u}=this.l,l=await self.caches.open(o),d=this.hasCallback("cacheDidUpdate"),f=d?await async function(e,t,s,i){const r=p(t.url,s);if(t.url===r)return e.match(t,i);const n=b({},i,{ignoreSearch:!0}),c=await e.keys(t,n);for(const t of c)if(r===p(t.url,s))return e.match(t,i)}(l,n.clone(),["__WB_REVISION__"],u):null;try{await l.put(n,d?a.clone():a)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of v)await e()}(),e}for(const e of this.iterateCallbacks("cacheDidUpdate"))await e({cacheName:o,oldResponse:f,newResponse:a.clone(),request:n,event:this.event});return!0}async getCacheKey(e,t){if(!this.u[t]){let s=e;for(const e of this.iterateCallbacks("cacheKeyWillBeUsed"))s=g(await e({mode:t,request:s,event:this.event,params:this.params}));this.u[t]=s}return this.u[t]}hasCallback(e){for(const t of this.l.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(const s of this.iterateCallbacks(e))await s(t)}*iterateCallbacks(e){for(const t of this.l.plugins)if("function"==typeof t[e]){const s=this.g.get(t),i=i=>{const r=b({},i,{state:s});return t[e](r)};yield i}}waitUntil(e){return this.p.push(e),e}async doneWaiting(){let e;for(;e=this.p.shift();)await e}destroy(){this.h.resolve()}async m(e){let t=e,s=!1;for(const e of this.iterateCallbacks("cacheWillUpdate"))if(t=await e({request:this.request,response:t,event:this.event})||void 0,s=!0,!t)break;return s||t&&200!==t.status&&(t=void 0),t}}class y{constructor(e={}){this.cacheName=h(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const t=e.event,s="string"==typeof e.request?new Request(e.request):e.request,i="params"in e?e.params:void 0,r=new m(this,{event:t,request:s,params:i}),n=this.j(r,s,t);return[n,this.R(n,r,s,t)]}async j(e,s,i){let r;await e.runCallbacks("handlerWillStart",{event:i,request:s});try{if(r=await this.q(s,e),!r||"error"===r.type)throw new t("no-response",{url:s.url})}catch(t){for(const n of e.iterateCallbacks("handlerDidError"))if(r=await n({error:t,event:i,request:s}),r)break;if(!r)throw t}for(const t of e.iterateCallbacks("handlerWillRespond"))r=await t({event:i,request:s,response:r});return r}async R(e,t,s,i){let r,n;try{r=await e}catch(n){}try{await t.runCallbacks("handlerDidRespond",{event:i,request:s,response:r}),await t.doneWaiting()}catch(e){n=e}if(await t.runCallbacks("handlerDidComplete",{event:i,request:s,response:r,error:n}),t.destroy(),n)throw n}}function j(e,t){const s=t();return e.waitUntil(s),s}try{self["workbox:precaching:6.1.5"]&&_()}catch(e){}function R(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:i}=e;if(!i)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(i,location.href);return{cacheKey:e.href,url:e.href}}const r=new URL(i,location.href),n=new URL(i,location.href);return r.searchParams.set("__WB_REVISION__",s),{cacheKey:r.href,url:n.href}}class q{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:s})=>{if("install"===e.type){const e=t.originalRequest.url;s?this.notUpdatedURLs.push(e):this.updatedURLs.push(e)}return s}}}class U{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:e,params:t})=>{const s=t&&t.cacheKey||this.U.getCacheKeyForURL(e.url);return s?new Request(s):e},this.U=e}}let L,x;async function C(e,s){let i=null;if(e.url){i=new URL(e.url).origin}if(i!==self.location.origin)throw new t("cross-origin-copy-response",{origin:i});const r=e.clone(),n={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},c=s?s(n):n,a=function(){if(void 0===L){const e=new Response("");if("body"in e)try{new Response(e.body),L=!0}catch(e){L=!1}L=!1}return L}()?r.body:await r.blob();return new Response(a,c)}class E extends y{constructor(e={}){e.cacheName=f(e.cacheName),super(e),this.L=!1!==e.fallbackToNetwork,this.plugins.push(E.copyRedirectedCacheableResponsesPlugin)}async q(e,t){const s=await t.cacheMatch(e);return s||(t.event&&"install"===t.event.type?await this._(e,t):await this.C(e,t))}async C(e,s){let i;if(!this.L)throw new t("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return i=await s.fetch(e),i}async _(e,s){this.N();const i=await s.fetch(e);if(!await s.cachePut(e,i.clone()))throw new t("bad-precaching-response",{url:e.url,status:i.status});return i}N(){let e=null,t=0;for(const[s,i]of this.plugins.entries())i!==E.copyRedirectedCacheableResponsesPlugin&&(i===E.defaultPrecacheCacheabilityPlugin&&(e=s),i.cacheWillUpdate&&t++);0===t?this.plugins.push(E.defaultPrecacheCacheabilityPlugin):t>1&&null!==e&&this.plugins.splice(e,1)}}E.defaultPrecacheCacheabilityPlugin={cacheWillUpdate:async({response:e})=>!e||e.status>=400?null:e},E.copyRedirectedCacheableResponsesPlugin={cacheWillUpdate:async({response:e})=>e.redirected?await C(e):e};class N{constructor({cacheName:e,plugins:t=[],fallbackToNetwork:s=!0}={}){this.O=new Map,this.P=new Map,this.T=new Map,this.l=new E({cacheName:f(e),plugins:[...t,new U({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this.l}precache(e){this.addToCacheList(e),this.k||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this.k=!0)}addToCacheList(e){const s=[];for(const i of e){"string"==typeof i?s.push(i):i&&void 0===i.revision&&s.push(i.url);const{cacheKey:e,url:r}=R(i),n="string"!=typeof i&&i.revision?"reload":"default";if(this.O.has(r)&&this.O.get(r)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this.O.get(r),secondEntry:e});if("string"!=typeof i&&i.integrity){if(this.T.has(e)&&this.T.get(e)!==i.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:r});this.T.set(e,i.integrity)}if(this.O.set(r,e),this.P.set(r,n),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}install(e){return j(e,(async()=>{const t=new q;this.strategy.plugins.push(t);for(const[t,s]of this.O){const i=this.T.get(s),r=this.P.get(t),n=new Request(t,{integrity:i,cache:r,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:s},request:n,event:e}))}const{updatedURLs:s,notUpdatedURLs:i}=t;return{updatedURLs:s,notUpdatedURLs:i}}))}activate(e){return j(e,(async()=>{const e=await self.caches.open(this.strategy.cacheName),t=await e.keys(),s=new Set(this.O.values()),i=[];for(const r of t)s.has(r.url)||(await e.delete(r),i.push(r.url));return{deletedURLs:i}}))}getURLsToCacheKeys(){return this.O}getCachedURLs(){return[...this.O.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this.O.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this.strategy.cacheName)).match(s)}}createHandlerBoundToURL(e){const s=this.getCacheKeyForURL(e);if(!s)throw new t("non-precached-url",{url:e});return t=>(t.request=new Request(e),t.params=b({cacheKey:s},t.params),this.strategy.handle(t))}}const O=()=>(x||(x=new N),x);class P extends i{constructor(e,t){super((({request:s})=>{const i=e.getURLsToCacheKeys();for(const e of function*(e,{ignoreURLParametersMatching:t=[/^utm_/,/^fbclid$/],directoryIndex:s="index.html",cleanURLs:i=!0,urlManipulation:r}={}){const n=new URL(e,location.href);n.hash="",yield n.href;const c=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some((e=>e.test(s)))&&e.searchParams.delete(s);return e}(n,t);if(yield c.href,s&&c.pathname.endsWith("/")){const e=new URL(c.href);e.pathname+=s,yield e.href}if(i){const e=new URL(c.href);e.pathname+=".html",yield e.href}if(r){const e=r({url:n});for(const t of e)yield t.href}}(s.url,t)){const t=i.get(e);if(t)return{cacheKey:t}}}),e.strategy)}}var T;self.skipWaiting(),T={},function(e){O().precache(e)}([{url:"public/apple-touch-icon.png",revision:"62e7c75a8b21624dca15bd0bef539438"},{url:"public/css/normalize.css",revision:"112272e51c80ffe5bd01becd2ce7d656"},{url:"public/favicon-16x16.png",revision:"275aa2d0c672623cc28f0572348befe7"},{url:"public/favicon-32x32.png",revision:"2ee56f4805a985f34bd914dad9a5af78"},{url:"public/icon-192x192.png",revision:"31ae08296b6be35de83931d8e1cf966b"},{url:"public/icon-512x512.png",revision:"1e7723b8736961b09acce6ea63178a40"},{url:"public/icon.svg",revision:"26984e5d2724d581bc7fb39c3f7cb389"},{url:"public/js/plugins.js",revision:"7cb14a28b34d6b0dae5732453d77e6e1"},{url:"public/js/worker.js",revision:"a77ab898eac9d3acc3841252aefe5f36"},{url:"public/js/xmlvalidate.js",revision:"13a15ca3eb50636fb4971e1ea7d664e8"},{url:"public/js/xmlvalidate.wasm",revision:"622a405972a204ca97e7e994a0e8244b"},{url:"public/maskable_icon.png",revision:"dcf4d1e9a7c6d791c83345eadaa8251d"},{url:"public/monochrome_icon.png",revision:"329ec2d6785a691c932962b40c48f19f"},{url:"public/mstile-144x144.png",revision:"e65bc3ab3bcbf366bfb1a8aea688ba45"},{url:"public/mstile-150x150.png",revision:"a3b54491a78398fdd16d9d650bcee21a"},{url:"public/mstile-310x150.png",revision:"dbab2415b660994355da616a7b05f56e"},{url:"public/mstile-310x310.png",revision:"08f78b8fb9c4618eeb87dc76254dee39"},{url:"public/mstile-70x70.png",revision:"2707a4bc27e42e15c0bf88302bcab503"},{url:"src/Editing.js",revision:"0fd93a9f5684fa826cffaddc6efd6745"},{url:"src/editors/Communication.js",revision:"b9b5af8b77200c20be96e212ed65d362"},{url:"src/editors/communication/connectedap-editor.js",revision:"75a7d6815efca2ee83d8d36e5d336788"},{url:"src/editors/communication/foundation.js",revision:"83d4aaafdd671d25e5fd9156a1889c41"},{url:"src/editors/communication/p-types.js",revision:"b3b1e0ec404e8686ebed07d87616f23e"},{url:"src/editors/communication/subnetwork-editor.js",revision:"6ab36a38da64d8c3c38c5eb01cc07527"},{url:"src/editors/Substation.js",revision:"fd02c367f06bbea0822766734364bf08"},{url:"src/editors/substation/bay-editor.js",revision:"f8023c8ef6f4a56fc7b608bb6153dcbc"},{url:"src/editors/substation/conducting-equipment-editor.js",revision:"3dc2eed470a58ef0b09c7cbdcdee1b97"},{url:"src/editors/substation/conducting-equipment-types.js",revision:"6a17f9e96326a4a2efa76e5ce8470de8"},{url:"src/editors/substation/foundation.js",revision:"cec8e0bbc9b87315d61a408c897c2884"},{url:"src/editors/substation/guess-wizard.js",revision:"10690ea7fd700887c3c628c9c4dcec68"},{url:"src/editors/substation/lnodewizard.js",revision:"027670b106e9fb85200dae72571857ad"},{url:"src/editors/substation/substation-editor.js",revision:"f35826d3450a3318eef9e0973be79c28"},{url:"src/editors/substation/voltage-level-editor.js",revision:"0d4c755567c95ec177b5e43ec8b7a95e"},{url:"src/editors/Templates.js",revision:"959088995b531b2b273cc68390c4f6e8"},{url:"src/editors/templates/datype-wizards.js",revision:"1694b47073bc67457345f455ea886a02"},{url:"src/editors/templates/enum-type-editor.js",revision:"0d090039fe50fb32c71884ce9d2c951f"},{url:"src/editors/templates/enum-val-editor.js",revision:"7c182e80efd9ee3b0645558ec1e19749"},{url:"src/editors/templates/foundation.js",revision:"ad10d356103921792e5eca95f031672e"},{url:"src/filtered-list.js",revision:"0e8ef380062be5c5fe42390d088bdc3d"},{url:"src/foundation.js",revision:"b763ec6f8ccb77043fdda80e9fac7563"},{url:"src/icons.js",revision:"1e286eb84b26aab420e95e6753afe295"},{url:"src/Logging.js",revision:"e7a849b6214360b81dcc3fbce22e48eb"},{url:"src/open-scd.js",revision:"6e9ca6572e4dfcfea367b61ba428e44d"},{url:"src/Plugging.js",revision:"797264234eb2797387abfbeeab5a6029"},{url:"src/schemas.js",revision:"252dd9ff966b3e8ceb285b74624c267f"},{url:"src/Setting.js",revision:"0a39efc59a7e424b2d2a6baddb919ad6"},{url:"src/themes.js",revision:"8bbec3972055f9100a12262725b42940"},{url:"src/translations/de.js",revision:"8e8bae3b4517b3b55b7fe725fb251f9c"},{url:"src/translations/en.js",revision:"fe7d23d9ca1d962cac790909fd8a0e49"},{url:"src/translations/loader.js",revision:"9032cc10f0e34b8b6c3c1f5bc0a0c0a2"},{url:"src/triggered/CommunicationMapping.js",revision:"04f2ddc37436300e7f6b36a4e767e232"},{url:"src/triggered/ImportIEDs.js",revision:"337c85c2bc2fd2e423b31a6dc12e59bb"},{url:"src/triggered/Merge.js",revision:"fe1ac69731ead5d07850dda89e1dc7b4"},{url:"src/triggered/SubscriberInfo.js",revision:"2931d18262d782019656215848f6ed9b"},{url:"src/triggered/UpdateSubstation.js",revision:"f475b891027d107e1d1452fc09d9fe95"},{url:"src/Validating.js",revision:"a3236c32040a8dfe1f4f83cb425a3dd2"},{url:"src/Waiting.js",revision:"16efa68af9e4f80ed8f9272d476e6269"},{url:"src/wizard-dialog.js",revision:"cb56a16a56f398ce89aa29ea379cdfdd"},{url:"src/wizard-textfield.js",revision:"1f69ffbe818af4a3303ab70cfea86b2f"},{url:"src/Wizarding.js",revision:"2f5b4b925da7df769ab4a8577048ebb7"},{url:"src/wizards.js",revision:"de4805a3e5e7d1ab01106fafd6544783"},{url:"browserconfig.xml",revision:"a8c181f3745541f8aa4653452592763b"},{url:"CC-EULA.pdf",revision:"84642855997c978c5d96187c63835413"},{url:"CHANGELOG.md",revision:"f6e361104bbf93b2badc53f047bcbb2d"},{url:"favicon.ico",revision:"84e4fb128b947bc51ebf808a4f5b2512"},{url:"index.html",revision:"38441aa68935c766bee1427e2889ca8e"},{url:"LICENSE.md",revision:"9cc11fc6c697d3f1d8ac1d3c3ccd0567"},{url:"manifest.json",revision:"1e5a39ab4142d53991113a6253476ca3"},{url:"README.md",revision:"d0e17d4cf8fa4b0e365a3aa6b2cea4b4"},{url:"ROADMAP.md",revision:"07e3c953b4c8a312e71857d9a5205ee9"}]),function(e){const t=O();o(new P(t,e))}(T),o(/.*/,new class extends y{constructor(e={}){super(e),this.plugins.some((e=>"cacheWillUpdate"in e))||this.plugins.unshift(u),this.S=e.networkTimeoutSeconds||0}async q(e,s){const i=[],r=[];let n;if(this.S){const{id:t,promise:c}=this.W({request:e,logs:i,handler:s});n=t,r.push(c)}const c=this.M({timeoutId:n,request:e,logs:i,handler:s});r.push(c);const a=await s.waitUntil((async()=>await s.waitUntil(Promise.race(r))||await c)());if(!a)throw new t("no-response",{url:e.url});return a}W({request:e,logs:t,handler:s}){let i;return{promise:new Promise((t=>{i=setTimeout((async()=>{t(await s.cacheMatch(e))}),1e3*this.S)})),id:i}}async M({timeoutId:e,request:t,logs:s,handler:i}){let r,n;try{n=await i.fetchAndCachePut(t)}catch(e){r=e}return e&&clearTimeout(e),!r&&n||(n=await i.cacheMatch(t)),n}},"GET");
//# sourceMappingURL=sw.js.map
