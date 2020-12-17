try{self["workbox:core:6.0.2"]&&_()}catch(e){}const e=(e,...t)=>{let s=e;return t.length>0&&(s+=` :: ${JSON.stringify(t)}`),s};class t extends Error{constructor(t,s){super(e(t,s)),this.name=t,this.details=s}}try{self["workbox:routing:6.0.2"]&&_()}catch(e){}const s=e=>e&&"object"==typeof e?e:{handle:e};class i{constructor(e,t,i="GET"){this.handler=s(t),this.match=e,this.method=i}}class r extends i{constructor(e,t,s){super((({url:t})=>{const s=e.exec(t.href);if(s&&(t.origin===location.origin||0===s.index))return s.slice(1)}),t,s)}}class n{constructor(){this.t=new Map,this.i=new Map}get routes(){return this.t}addFetchListener(){self.addEventListener("fetch",(e=>{const{request:t}=e,s=this.handleRequest({request:t,event:e});s&&e.respondWith(s)}))}addCacheListener(){self.addEventListener("message",(e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:t}=e.data,s=Promise.all(t.urlsToCache.map((t=>{"string"==typeof t&&(t=[t]);const s=new Request(...t);return this.handleRequest({request:s,event:e})})));e.waitUntil(s),e.ports&&e.ports[0]&&s.then((()=>e.ports[0].postMessage(!0)))}}))}handleRequest({request:e,event:t}){const s=new URL(e.url,location.href);if(!s.protocol.startsWith("http"))return;const i=s.origin===location.origin,{params:r,route:n}=this.findMatchingRoute({event:t,request:e,sameOrigin:i,url:s});let a=n&&n.handler;const c=e.method;if(!a&&this.i.has(c)&&(a=this.i.get(c)),!a)return;let o;try{o=a.handle({url:s,request:e,event:t,params:r})}catch(e){o=Promise.reject(e)}return o instanceof Promise&&this.o&&(o=o.catch((i=>this.o.handle({url:s,request:e,event:t})))),o}findMatchingRoute({url:e,sameOrigin:t,request:s,event:i}){const r=this.t.get(s.method)||[];for(const n of r){let r;const a=n.match({url:e,sameOrigin:t,request:s,event:i});if(a)return r=a,(Array.isArray(a)&&0===a.length||a.constructor===Object&&0===Object.keys(a).length||"boolean"==typeof a)&&(r=void 0),{route:n,params:r}}return{}}setDefaultHandler(e,t="GET"){this.i.set(t,s(e))}setCatchHandler(e){this.o=s(e)}registerRoute(e){this.t.has(e.method)||this.t.set(e.method,[]),this.t.get(e.method).push(e)}unregisterRoute(e){if(!this.t.has(e.method))throw new t("unregister-route-but-not-found-with-method",{method:e.method});const s=this.t.get(e.method).indexOf(e);if(!(s>-1))throw new t("unregister-route-route-not-registered");this.t.get(e.method).splice(s,1)}}let a;const c=()=>(a||(a=new n,a.addFetchListener(),a.addCacheListener()),a);function o(e,s,n){let a;if("string"==typeof e){const t=new URL(e,location.href);a=new i((({url:e})=>e.href===t.href),s,n)}else if(e instanceof RegExp)a=new r(e,s,n);else if("function"==typeof e)a=new i(e,s,n);else{if(!(e instanceof i))throw new t("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});a=e}return c().registerRoute(a),a}try{self["workbox:strategies:6.0.2"]&&_()}catch(e){}const l={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null},u={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},d=e=>[u.prefix,e,u.suffix].filter((e=>e&&e.length>0)).join("-"),f=e=>e||d(u.precache),b=e=>e||d(u.runtime);function h(){return(h=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var i in s)Object.prototype.hasOwnProperty.call(s,i)&&(e[i]=s[i])}return e}).apply(this,arguments)}function m(e,t){const s=new URL(e);for(const e of t)s.searchParams.delete(e);return s.href}class w{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}const p=new Set;function v(e){return"string"==typeof e?new Request(e):e}class g{constructor(e,t){this.l={},Object.assign(this,t),this.event=t.event,this.u=e,this.h=new w,this.m=[],this.p=[...e.plugins],this.v=new Map;for(const e of this.p)this.v.set(e,{});this.event.waitUntil(this.h.promise)}fetch(e){return this.waitUntil((async()=>{const{event:s}=this;let i=v(e);if("navigate"===i.mode&&s instanceof FetchEvent&&s.preloadResponse){const e=await s.preloadResponse;if(e)return e}const r=this.hasCallback("fetchDidFail")?i.clone():null;try{for(const e of this.iterateCallbacks("requestWillFetch"))i=await e({request:i.clone(),event:s})}catch(e){throw new t("plugin-error-request-will-fetch",{thrownError:e})}const n=i.clone();try{let e;e=await fetch(i,"navigate"===i.mode?void 0:this.u.fetchOptions);for(const t of this.iterateCallbacks("fetchDidSucceed"))e=await t({event:s,request:n,response:e});return e}catch(e){throw r&&await this.runCallbacks("fetchDidFail",{error:e,event:s,originalRequest:r.clone(),request:n.clone()}),e}})())}async fetchAndCachePut(e){const t=await this.fetch(e),s=t.clone();return this.waitUntil(this.cachePut(e,s)),t}cacheMatch(e){return this.waitUntil((async()=>{const t=v(e);let s;const{cacheName:i,matchOptions:r}=this.u,n=await this.getCacheKey(t,"read"),a=h({},r,{cacheName:i});s=await caches.match(n,a);for(const e of this.iterateCallbacks("cachedResponseWillBeUsed"))s=await e({cacheName:i,matchOptions:r,cachedResponse:s,request:n,event:this.event})||void 0;return s})())}async cachePut(e,s){const i=v(e);var r;await(r=0,new Promise((e=>setTimeout(e,r))));const n=await this.getCacheKey(i,"write");if(!s)throw new t("cache-put-with-no-response",{url:(a=n.url,new URL(String(a),location.href).href.replace(new RegExp(`^${location.origin}`),""))});var a;const c=await this.g(s);if(!c)return;const{cacheName:o,matchOptions:l}=this.u,u=await self.caches.open(o),d=this.hasCallback("cacheDidUpdate"),f=d?await async function(e,t,s,i){const r=m(t.url,s);if(t.url===r)return e.match(t,i);const n=h({},i,{ignoreSearch:!0}),a=await e.keys(t,n);for(const t of a)if(r===m(t.url,s))return e.match(t,i)}(u,n.clone(),["__WB_REVISION__"],l):null;try{await u.put(n,d?c.clone():c)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of p)await e()}(),e}for(const e of this.iterateCallbacks("cacheDidUpdate"))await e({cacheName:o,oldResponse:f,newResponse:c.clone(),request:n,event:this.event})}async getCacheKey(e,t){if(!this.l[t]){let s=e;for(const e of this.iterateCallbacks("cacheKeyWillBeUsed"))s=v(await e({mode:t,request:s,event:this.event,params:this.params}));this.l[t]=s}return this.l[t]}hasCallback(e){for(const t of this.u.plugins)if(e in t)return!0;return!1}async runCallbacks(e,t){for(const s of this.iterateCallbacks(e))await s(t)}*iterateCallbacks(e){for(const t of this.u.plugins)if("function"==typeof t[e]){const s=this.v.get(t),i=i=>{const r=h({},i,{state:s});return t[e](r)};yield i}}waitUntil(e){return this.m.push(e),e}async doneWaiting(){let e;for(;e=this.m.shift();)await e}destroy(){this.h.resolve()}async g(e){let t=e,s=!1;for(const e of this.iterateCallbacks("cacheWillUpdate"))if(t=await e({request:this.request,response:t,event:this.event})||void 0,s=!0,!t)break;return s||t&&200!==t.status&&(t=void 0),t}}class y{constructor(e={}){this.cacheName=b(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[t]=this.handleAll(e);return t}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const t=e.event,s="string"==typeof e.request?new Request(e.request):e.request,i="params"in e?e.params:void 0,r=new g(this,{event:t,request:s,params:i}),n=this.j(r,s,t);return[n,this._(n,r,s,t)]}async j(e,s,i){let r;await e.runCallbacks("handlerWillStart",{event:i,request:s});try{if(r=await this.R(s,e),!r||"error"===r.type)throw new t("no-response",{url:s.url})}catch(t){for(const n of e.iterateCallbacks("handlerDidError"))if(r=await n({error:t,event:i,request:s}),r)break;if(!r)throw t}for(const t of e.iterateCallbacks("handlerWillRespond"))r=await t({event:i,request:s,response:r});return r}async _(e,t,s,i){let r,n;try{r=await e}catch(n){}try{await t.runCallbacks("handlerDidRespond",{event:i,request:s,response:r}),await t.doneWaiting()}catch(e){n=e}if(await t.runCallbacks("handlerDidComplete",{event:i,request:s,response:r,error:n}),t.destroy(),n)throw n}}function j(e,t){const s=t();return e.waitUntil(s),s}try{self["workbox:precaching:6.0.2"]&&_()}catch(e){}function R(e){if(!e)throw new t("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const t=new URL(e,location.href);return{cacheKey:t.href,url:t.href}}const{revision:s,url:i}=e;if(!i)throw new t("add-to-cache-list-unexpected-type",{entry:e});if(!s){const e=new URL(i,location.href);return{cacheKey:e.href,url:e.href}}const r=new URL(i,location.href),n=new URL(i,location.href);return r.searchParams.set("__WB_REVISION__",s),{cacheKey:r.href,url:n.href}}class q{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:t})=>{t&&(t.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:t,cachedResponse:s})=>{if("install"===e.type){const e=t.originalRequest.url;s?this.notUpdatedURLs.push(e):this.updatedURLs.push(e)}return s}}}class U{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:e,params:t})=>{const s=t&&t.cacheKey||this.q.getCacheKeyForURL(e.url);return s?new Request(s):e},this.q=e}}let x;async function L(e,s){let i=null;if(e.url){i=new URL(e.url).origin}if(i!==self.location.origin)throw new t("cross-origin-copy-response",{origin:i});const r=e.clone(),n={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},a=s?s(n):n,c=function(){if(void 0===x){const e=new Response("");if("body"in e)try{new Response(e.body),x=!0}catch(e){x=!1}x=!1}return x}()?r.body:await r.blob();return new Response(c,a)}const C={cacheWillUpdate:async({response:e})=>e.redirected?await L(e):e};class E extends y{constructor(e={}){e.cacheName=f(e.cacheName),super(e),this.U=!1!==e.fallbackToNetwork,this.plugins.push(C)}async R(e,t){const s=await t.cacheMatch(e);return s||(t.event&&"install"===t.event.type?await this.L(e,t):await this.C(e,t))}async C(e,s){let i;if(!this.U)throw new t("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return i=await s.fetch(e),i}async L(e,s){const i=await s.fetchAndCachePut(e);let r=Boolean(i);if(i&&i.status>=400&&!this.N()&&(r=!1),!r)throw new t("bad-precaching-response",{url:e.url,status:i.status});return i}N(){return this.plugins.some((e=>e.cacheWillUpdate&&e!==C))}}class N{constructor({cacheName:e,plugins:t=[],fallbackToNetwork:s=!0}={}){this.k=new Map,this.T=new Map,this.O=new Map,this.u=new E({cacheName:f(e),plugins:[...t,new U({precacheController:this})],fallbackToNetwork:s}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this.u}precache(e){this.addToCacheList(e),this.W||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this.W=!0)}addToCacheList(e){const s=[];for(const i of e){"string"==typeof i?s.push(i):i&&void 0===i.revision&&s.push(i.url);const{cacheKey:e,url:r}=R(i),n="string"!=typeof i&&i.revision?"reload":"default";if(this.k.has(r)&&this.k.get(r)!==e)throw new t("add-to-cache-list-conflicting-entries",{firstEntry:this.k.get(r),secondEntry:e});if("string"!=typeof i&&i.integrity){if(this.O.has(e)&&this.O.get(e)!==i.integrity)throw new t("add-to-cache-list-conflicting-integrities",{url:r});this.O.set(e,i.integrity)}if(this.k.set(r,e),this.T.set(r,n),s.length>0){const e=`Workbox is precaching URLs without revision info: ${s.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}install(e){return j(e,(async()=>{const t=new q;this.strategy.plugins.push(t);for(const[t,s]of this.k){const i=this.O.get(s),r=this.T.get(t),n=new Request(t,{integrity:i,cache:r,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:s},request:n,event:e}))}const{updatedURLs:s,notUpdatedURLs:i}=t;return{updatedURLs:s,notUpdatedURLs:i}}))}activate(e){return j(e,(async()=>{const e=await self.caches.open(this.strategy.cacheName),t=await e.keys(),s=new Set(this.k.values()),i=[];for(const r of t)s.has(r.url)||(await e.delete(r),i.push(r.url));return{deletedURLs:i}}))}getURLsToCacheKeys(){return this.k}getCachedURLs(){return[...this.k.keys()]}getCacheKeyForURL(e){const t=new URL(e,location.href);return this.k.get(t.href)}async matchPrecache(e){const t=e instanceof Request?e.url:e,s=this.getCacheKeyForURL(t);if(s){return(await self.caches.open(this.strategy.cacheName)).match(s)}}createHandlerBoundToURL(e){const s=this.getCacheKeyForURL(e);if(!s)throw new t("non-precached-url",{url:e});return t=>(t.request=new Request(e),t.params=h({cacheKey:s},t.params),this.strategy.handle(t))}}let k;const T=()=>(k||(k=new N),k);class O extends i{constructor(e,t){super((({request:s})=>{const i=e.getURLsToCacheKeys();for(const e of function*(e,{ignoreURLParametersMatching:t=[/^utm_/,/^fbclid$/],directoryIndex:s="index.html",cleanURLs:i=!0,urlManipulation:r}={}){const n=new URL(e,location.href);n.hash="",yield n.href;const a=function(e,t=[]){for(const s of[...e.searchParams.keys()])t.some((e=>e.test(s)))&&e.searchParams.delete(s);return e}(n,t);if(yield a.href,s&&a.pathname.endsWith("/")){const e=new URL(a.href);e.pathname+=s,yield e.href}if(i){const e=new URL(a.href);e.pathname+=".html",yield e.href}if(r){const e=r({url:n});for(const t of e)yield t.href}}(s.url,t)){const t=i.get(e);if(t)return{cacheKey:t}}}),e.strategy)}}var W;self.skipWaiting(),W={},function(e){T().precache(e)}([{url:"public/apple-touch-icon.png",revision:"62e7c75a8b21624dca15bd0bef539438"},{url:"public/css/normalize.css",revision:"112272e51c80ffe5bd01becd2ce7d656"},{url:"public/favicon-16x16.png",revision:"275aa2d0c672623cc28f0572348befe7"},{url:"public/favicon-32x32.png",revision:"2ee56f4805a985f34bd914dad9a5af78"},{url:"public/icon-192x192.png",revision:"31ae08296b6be35de83931d8e1cf966b"},{url:"public/icon-512x512.png",revision:"1e7723b8736961b09acce6ea63178a40"},{url:"public/icon.svg",revision:"26984e5d2724d581bc7fb39c3f7cb389"},{url:"public/js/worker.js",revision:"a77ab898eac9d3acc3841252aefe5f36"},{url:"public/js/xmlvalidate.js",revision:"13a15ca3eb50636fb4971e1ea7d664e8"},{url:"public/js/xmlvalidate.wasm",revision:"622a405972a204ca97e7e994a0e8244b"},{url:"public/json/de.json",revision:"6cee10c1e6e82f1c9f7eed0545ff3d30"},{url:"public/json/en.json",revision:"cc5cd99f0d546b2ed4c5041564656790"},{url:"public/maskable_icon.png",revision:"dcf4d1e9a7c6d791c83345eadaa8251d"},{url:"public/monochrome_icon.png",revision:"329ec2d6785a691c932962b40c48f19f"},{url:"public/mstile-144x144.png",revision:"e65bc3ab3bcbf366bfb1a8aea688ba45"},{url:"public/mstile-150x150.png",revision:"a3b54491a78398fdd16d9d650bcee21a"},{url:"public/mstile-310x150.png",revision:"dbab2415b660994355da616a7b05f56e"},{url:"public/mstile-310x310.png",revision:"08f78b8fb9c4618eeb87dc76254dee39"},{url:"public/mstile-70x70.png",revision:"2707a4bc27e42e15c0bf88302bcab503"},{url:"src/Editing.js",revision:"180b8f3960e76a7f56342867ba11b0a2"},{url:"src/editors/Substation.js",revision:"bc9718fc65ebfae9c026f060c373487b"},{url:"src/editors/substation/bay-editor.js",revision:"1758894c00ea4f0ddbc5779024822f7a"},{url:"src/editors/substation/conducting-equipment-editor.js",revision:"f1bf26b49541fc5866f8b355637ddfc9"},{url:"src/editors/substation/conducting-equipment-types.js",revision:"1627c744020b7ff4a3170ba99a97c8e3"},{url:"src/editors/substation/foundation.js",revision:"92a3075aba7bfc8217246822c4c840d3"},{url:"src/editors/substation/lnodewizard.js",revision:"6b14a441714b072df4534315aaf68599"},{url:"src/editors/substation/substation-editor.js",revision:"d059f7070d0d8d03aff917970227a430"},{url:"src/editors/substation/voltage-level-editor.js",revision:"cb0a488e95b58faa137f0af13f08f90b"},{url:"src/foundation.js",revision:"e50a3cd37220904ac8f9b33dd55f34fe"},{url:"src/icons.js",revision:"ad978d4da052baef1968d8a5d2b14d0a"},{url:"src/Logging.js",revision:"bc5038feef3a1e7e1407759f18deb938"},{url:"src/open-scd.js",revision:"4b571e7329ca46b920387cb67f2e3667"},{url:"src/plugin.js",revision:"9f362762c1bedce2568db69622f917d9"},{url:"src/schemas.js",revision:"216652f451342856dbb517875f26573f"},{url:"src/Setting.js",revision:"ce023cadadca53deecb0dd852eb252b9"},{url:"src/themes.js",revision:"2fc05aca9a03642a271332462c1817fb"},{url:"src/translations/de.js",revision:"619e055e2602bc95a1ea0e0c2281d045"},{url:"src/translations/en.js",revision:"eb0fdad5c354f466920e99bafbf53331"},{url:"src/translations/loader.js",revision:"b619938d4c614eefd34b714a8f667a4c"},{url:"src/Validating.js",revision:"b84c760d41b3d66732a5259a9ee8b595"},{url:"src/Waiting.js",revision:"1f46a6841a96a595b1cb367d7f6fd092"},{url:"src/wizard-dialog.js",revision:"f84b0b221b031e4b2ac053f00d41bf5b"},{url:"src/wizard-textfield.js",revision:"6398025532b1ca8ddd8415fc37812052"},{url:"src/Wizarding.js",revision:"f042c5254d8decec66b8d8d496876d62"},{url:"web_modules/@material/mwc-button.js",revision:"6d40f94e7aefeea44161aec88526ea4c"},{url:"web_modules/@material/mwc-circular-progress-four-color.js",revision:"2cdf3bf8dbd61ee8f18f364b19122d6b"},{url:"web_modules/@material/mwc-dialog.js",revision:"c73f4181dee0b4ce20ff6038ed6fb27b"},{url:"web_modules/@material/mwc-drawer.js",revision:"adeac16888b06dd4f7ea92fd542c1819"},{url:"web_modules/@material/mwc-fab.js",revision:"8fff92b265ae6f41fb3c18d8e339e429"},{url:"web_modules/@material/mwc-formfield.js",revision:"b9baa688cc44ef76ceb43554d637b862"},{url:"web_modules/@material/mwc-icon-button.js",revision:"0ed1b71934529bf26432218362d502d8"},{url:"web_modules/@material/mwc-icon.js",revision:"54f9d90ff8cb16fb44a86f09a868d59f"},{url:"web_modules/@material/mwc-linear-progress.js",revision:"d3d3f06a98d138a99b1c597008d58b90"},{url:"web_modules/@material/mwc-list.js",revision:"42611c26a321f3fdc3855a5f4f764e54"},{url:"web_modules/@material/mwc-list/mwc-check-list-item.js",revision:"717b686dabc2b5712705541b412a44fe"},{url:"web_modules/@material/mwc-list/mwc-list-item.js",revision:"613011bc8a53bc2243162219b5246192"},{url:"web_modules/@material/mwc-list/mwc-radio-list-item.js",revision:"3bc9703e20e64048980b0e9c22cfcaa8"},{url:"web_modules/@material/mwc-menu.js",revision:"774f0d896233a4961b09b166949cfd5c"},{url:"web_modules/@material/mwc-select.js",revision:"bd5140cdce8393bf84f457d76c324b8e"},{url:"web_modules/@material/mwc-snackbar.js",revision:"22a58d4a24050be9f65776a770c6b7ef"},{url:"web_modules/@material/mwc-switch.js",revision:"76f1288b7ef5baccbf3dcb9ebf67aa69"},{url:"web_modules/@material/mwc-tab-bar.js",revision:"dbcf4c6e1f70a0c7a65e8b1aee650d38"},{url:"web_modules/@material/mwc-tab.js",revision:"2bbb76be8b217cda9fb952633023af60"},{url:"web_modules/@material/mwc-textfield.js",revision:"360c143d870380a9e7b30bf7a2160b13"},{url:"web_modules/@material/mwc-top-app-bar-fixed.js",revision:"afc92cb5838d9e0abedce21d0297b0b9"},{url:"web_modules/common/class-map-a9acf8cf.js",revision:"b51d4b53967fc408d9a460860cf7bbf3"},{url:"web_modules/common/form-element-0c86ea9f.js",revision:"7ccf5c2ee8058b3cd7f8e1bae65ac051"},{url:"web_modules/common/foundation-9d700227.js",revision:"5cd56d023a381d355b5fe5ab7fbbf08e"},{url:"web_modules/common/if-defined-472da897.js",revision:"cc1cab824887b84a0f08365053c58b22"},{url:"web_modules/common/inert.esm-e76ef07d.js",revision:"a7c841d5376da855bf669ba30ea6e15b"},{url:"web_modules/common/lit-element-a56576a0.js",revision:"23f597faca740cfa9f71585e30a5e8d8"},{url:"web_modules/common/lit-html-8a43e7a8.js",revision:"25cd1d7f06e6a6c0203cb57c5c6c45d0"},{url:"web_modules/common/mwc-control-list-item-css-715789c8.js",revision:"5a0edc1a1f306ade727c256c81c8eaaf"},{url:"web_modules/common/mwc-line-ripple-directive-2238bb35.js",revision:"f98b2eb7e8f746242d743fde3995b1e4"},{url:"web_modules/common/mwc-list-e3c023fa.js",revision:"8e2f9c6ea4ce0306c91c5c1af863e1d9"},{url:"web_modules/common/mwc-list-item-css-38e33c46.js",revision:"7bca4015260e71d76176e6fc9e3c14a7"},{url:"web_modules/common/mwc-menu-2af904b9.js",revision:"149ebe57f82d9159bd24d785775a2ca8"},{url:"web_modules/common/observer-fa3d205e.js",revision:"35ecc6c1dcc0e94b236e9b128d3e97b3"},{url:"web_modules/common/render-60aafaaf.js",revision:"d8e50ee04317176c4a50d038afe13dd6"},{url:"web_modules/common/ripple-handlers-d284281e.js",revision:"87a776e72b0e385be3699e838e4b0664"},{url:"web_modules/common/style-map-0f6d1bd7.js",revision:"f102961e44ddff867b389dfb38740469"},{url:"web_modules/common/tslib.es6-f4316a58.js",revision:"ebb86446141a830d6a002ce9a3f4129a"},{url:"web_modules/import-map.json",revision:"bffaa00e43b5b87ba5462374426faede"},{url:"web_modules/lit-element.js",revision:"152f8b3ee52f22d7aa53ca20870c7742"},{url:"web_modules/lit-html.js",revision:"711131da725c2d5b441a1d2e21f85ef6"},{url:"web_modules/lit-html/directives/if-defined.js",revision:"d7f646b3348065f3867a5773ec2314b4"},{url:"web_modules/lit-html/directives/until.js",revision:"83eec24a277c96533dc0b6f133997786"},{url:"web_modules/lit-translate.js",revision:"6b061714a98b3be12f24a835993f5bfc"},{url:"browserconfig.xml",revision:"a8c181f3745541f8aa4653452592763b"},{url:"CC-EULA.pdf",revision:"84642855997c978c5d96187c63835413"},{url:"favicon.ico",revision:"84e4fb128b947bc51ebf808a4f5b2512"},{url:"index.html",revision:"8d9de36aef71413532611a75bf6043f5"},{url:"manifest.json",revision:"3e84fab05d66aa52e072a87232e94585"},{url:"README.md",revision:"4eca0352fcd3c4281df28287ca7ed220"}]),function(e){const t=T();o(new O(t,e))}(W),o(/.*/,new class extends y{constructor(e={}){super(e),this.plugins.some((e=>"cacheWillUpdate"in e))||this.plugins.unshift(l),this.P=e.networkTimeoutSeconds||0}async R(e,s){const i=[],r=[];let n;if(this.P){const{id:t,promise:a}=this.S({request:e,logs:i,handler:s});n=t,r.push(a)}const a=this.K({timeoutId:n,request:e,logs:i,handler:s});r.push(a);for(const e of r)s.waitUntil(e);let c=await Promise.race(r);if(c||(c=await a),!c)throw new t("no-response",{url:e.url});return c}S({request:e,logs:t,handler:s}){let i;return{promise:new Promise((t=>{i=setTimeout((async()=>{t(await s.cacheMatch(e))}),1e3*this.P)})),id:i}}async K({timeoutId:e,request:t,logs:s,handler:i}){let r,n;try{n=await i.fetchAndCachePut(t)}catch(e){r=e}return e&&clearTimeout(e),!r&&n||(n=await i.cacheMatch(t)),n}},"GET");
//# sourceMappingURL=sw.js.map
