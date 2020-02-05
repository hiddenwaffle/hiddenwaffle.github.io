parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"kOve":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.SVGNS=void 0;const e="http://www.w3.org/2000/svg";exports.SVGNS=e;
},{}],"yAKI":[function(require,module,exports) {
"use strict";function t(t,o,e){if(t&&t.length){const[n,s]=o,r=Math.PI/180*e,c=Math.cos(r),a=Math.sin(r);t.forEach(t=>{const[o,e]=t;t[0]=(o-n)*c-(e-s)*a+n,t[1]=(o-n)*a+(e-s)*c+s})}}function o(o,e,n){const s=[];o.forEach(t=>s.push(...t)),t(s,e,n)}function e(t){const o=t[0],e=t[1];return Math.sqrt(Math.pow(o[0]-e[0],2)+Math.pow(o[1]-e[1],2))}Object.defineProperty(exports,"__esModule",{value:!0}),exports.rotatePoints=t,exports.rotateLines=o,exports.lineLength=e;
},{}],"hLss":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.PathFitter=exports.RoughArcConverter=exports.RoughPath=void 0;var t=require("./geometry");function s(t,s){return t.type===s}const i={A:7,a:7,C:6,c:6,H:1,h:1,L:2,l:2,M:2,m:2,Q:4,q:4,S:4,s:4,T:4,t:2,V:1,v:1,Z:0,z:0};class e{constructor(t){this.COMMAND=0,this.NUMBER=1,this.EOD=2,this.segments=[],this.parseData(t),this.processPoints()}tokenize(t){const s=new Array;for(;""!==t;)if(t.match(/^([ \t\r\n,]+)/))t=t.substr(RegExp.$1.length);else if(t.match(/^([aAcChHlLmMqQsStTvVzZ])/))s[s.length]={type:this.COMMAND,text:RegExp.$1},t=t.substr(RegExp.$1.length);else{if(!t.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/))return[];s[s.length]={type:this.NUMBER,text:`${parseFloat(RegExp.$1)}`},t=t.substr(RegExp.$1.length)}return s[s.length]={type:this.EOD,text:""},s}parseData(t){const e=this.tokenize(t);let h=0,r=e[h],n="BOD";for(this.segments=new Array;!s(r,this.EOD);){let a;const o=new Array;if("BOD"===n){if("M"!==r.text&&"m"!==r.text)return void this.parseData("M0,0"+t);h++,a=i[r.text],n=r.text}else s(r,this.NUMBER)?a=i[n]:(h++,a=i[r.text],n=r.text);if(h+a<e.length){for(let t=h;t<h+a;t++){const i=e[t];if(!s(i,this.NUMBER))return void console.error("Param not a number: "+n+","+i.text);o[o.length]=+i.text}if("number"!=typeof i[n])return void console.error("Bad segment: "+n);{const t={key:n,data:o};this.segments.push(t),r=e[h+=a],"M"===n&&(n="L"),"m"===n&&(n="l")}}else console.error("Path data ended short")}}get closed(){if(void 0===this._closed){this._closed=!1;for(const t of this.segments)"z"===t.key.toLowerCase()&&(this._closed=!0)}return this._closed}processPoints(){let t=null,s=[0,0];for(let i=0;i<this.segments.length;i++){const e=this.segments[i];switch(e.key){case"M":case"L":case"T":e.point=[e.data[0],e.data[1]];break;case"m":case"l":case"t":e.point=[e.data[0]+s[0],e.data[1]+s[1]];break;case"H":e.point=[e.data[0],s[1]];break;case"h":e.point=[e.data[0]+s[0],s[1]];break;case"V":e.point=[s[0],e.data[0]];break;case"v":e.point=[s[0],e.data[0]+s[1]];break;case"z":case"Z":t&&(e.point=[t[0],t[1]]);break;case"C":e.point=[e.data[4],e.data[5]];break;case"c":e.point=[e.data[4]+s[0],e.data[5]+s[1]];break;case"S":e.point=[e.data[2],e.data[3]];break;case"s":e.point=[e.data[2]+s[0],e.data[3]+s[1]];break;case"Q":e.point=[e.data[2],e.data[3]];break;case"q":e.point=[e.data[2]+s[0],e.data[3]+s[1]];break;case"A":e.point=[e.data[5],e.data[6]];break;case"a":e.point=[e.data[5]+s[0],e.data[6]+s[1]]}"m"!==e.key&&"M"!==e.key||(t=null),e.point&&(s=e.point,t||(t=e.point)),"z"!==e.key&&"Z"!==e.key||(t=null)}}}class h{constructor(t){this._position=[0,0],this._first=null,this.bezierReflectionPoint=null,this.quadReflectionPoint=null,this.parsed=new e(t)}get segments(){return this.parsed.segments}get closed(){return this.parsed.closed}get linearPoints(){if(!this._linearPoints){const t=[];let s=[];for(const i of this.parsed.segments){const e=i.key.toLowerCase();("m"!==e&&"z"!==e||(s.length&&(t.push(s),s=[]),"z"!==e))&&(i.point&&s.push(i.point))}s.length&&(t.push(s),s=[]),this._linearPoints=t}return this._linearPoints}get first(){return this._first}set first(t){this._first=t}setPosition(t,s){this._position=[t,s],this._first||(this._first=[t,s])}get position(){return this._position}get x(){return this._position[0]}get y(){return this._position[1]}}exports.RoughPath=h;class r{constructor(t,s,i,e,h,r){if(this._segIndex=0,this._numSegs=0,this._rx=0,this._ry=0,this._sinPhi=0,this._cosPhi=0,this._C=[0,0],this._theta=0,this._delta=0,this._T=0,this._from=t,t[0]===s[0]&&t[1]===s[1])return;const n=Math.PI/180;this._rx=Math.abs(i[0]),this._ry=Math.abs(i[1]),this._sinPhi=Math.sin(e*n),this._cosPhi=Math.cos(e*n);const a=this._cosPhi*(t[0]-s[0])/2+this._sinPhi*(t[1]-s[1])/2,o=-this._sinPhi*(t[0]-s[0])/2+this._cosPhi*(t[1]-s[1])/2;let _=0;const c=this._rx*this._rx*this._ry*this._ry-this._rx*this._rx*o*o-this._ry*this._ry*a*a;if(c<0){const t=Math.sqrt(1-c/(this._rx*this._rx*this._ry*this._ry));this._rx=this._rx*t,this._ry=this._ry*t,_=0}else _=(h===r?-1:1)*Math.sqrt(c/(this._rx*this._rx*o*o+this._ry*this._ry*a*a));const l=_*this._rx*o/this._ry,p=-_*this._ry*a/this._rx;this._C=[0,0],this._C[0]=this._cosPhi*l-this._sinPhi*p+(t[0]+s[0])/2,this._C[1]=this._sinPhi*l+this._cosPhi*p+(t[1]+s[1])/2,this._theta=this.calculateVectorAngle(1,0,(a-l)/this._rx,(o-p)/this._ry);let u=this.calculateVectorAngle((a-l)/this._rx,(o-p)/this._ry,(-a-l)/this._rx,(-o-p)/this._ry);!r&&u>0?u-=2*Math.PI:r&&u<0&&(u+=2*Math.PI),this._numSegs=Math.ceil(Math.abs(u/(Math.PI/2))),this._delta=u/this._numSegs,this._T=8/3*Math.sin(this._delta/4)*Math.sin(this._delta/4)/Math.sin(this._delta/2)}getNextSegment(){if(this._segIndex===this._numSegs)return null;const t=Math.cos(this._theta),s=Math.sin(this._theta),i=this._theta+this._delta,e=Math.cos(i),h=Math.sin(i),r=[this._cosPhi*this._rx*e-this._sinPhi*this._ry*h+this._C[0],this._sinPhi*this._rx*e+this._cosPhi*this._ry*h+this._C[1]],n=[this._from[0]+this._T*(-this._cosPhi*this._rx*s-this._sinPhi*this._ry*t),this._from[1]+this._T*(-this._sinPhi*this._rx*s+this._cosPhi*this._ry*t)],a=[r[0]+this._T*(this._cosPhi*this._rx*h+this._sinPhi*this._ry*e),r[1]+this._T*(this._sinPhi*this._rx*h-this._cosPhi*this._ry*e)];return this._theta=i,this._from=[r[0],r[1]],this._segIndex++,{cp1:n,cp2:a,to:r}}calculateVectorAngle(t,s,i,e){const h=Math.atan2(s,t),r=Math.atan2(e,i);return r>=h?r-h:2*Math.PI-(h-r)}}exports.RoughArcConverter=r;class n{constructor(t,s){this.sets=t,this.closed=s}fit(t){const s=[];for(const e of this.sets){const i=e.length;let h=Math.floor(t*i);if(h<5){if(i<=5)continue;h=5}s.push(this.reduce(e,h))}let i="";for(const e of s){for(let t=0;t<e.length;t++){const s=e[t];i+=0===t?"M"+s[0]+","+s[1]:"L"+s[0]+","+s[1]}this.closed&&(i+="z ")}return i}reduce(s,i){if(s.length<=i)return s;const e=s.slice(0);for(;e.length>i;){const s=[];let i=-1,h=-1;for(let r=1;r<e.length-1;r++){const n=(0,t.lineLength)([e[r-1],e[r]]),a=(0,t.lineLength)([e[r],e[r+1]]),o=(0,t.lineLength)([e[r-1],e[r+1]]),_=(n+a+o)/2,c=Math.sqrt(_*(_-n)*(_-a)*(_-o));s.push(c),(i<0||c<i)&&(i=c,h=r)}if(!(h>0))break;e.splice(h,1)}return e}}exports.PathFitter=n;
},{"./geometry":"yAKI"}],"K6f8":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.polygonHachureLines=t;var e=require("../geometry");function t(t,o){const r=[0,0],a=Math.round(o.hachureAngle+90);a&&(0,e.rotatePoints)(t,r,a);const h=n(t,o);return a&&((0,e.rotatePoints)(t,r,-a),(0,e.rotateLines)(h,r,-a)),h}function n(e,t){const n=[...e];n[0].join(",")!==n[n.length-1].join(",")&&n.push([n[0][0],n[0][1]]);const o=[];if(n&&n.length>2){let e=t.hachureGap;e<0&&(e=4*t.strokeWidth),e=Math.max(e,.1);const r=[];for(let t=0;t<n.length-1;t++){const e=n[t],o=n[t+1];if(e[1]!==o[1]){const t=Math.min(e[1],o[1]);r.push({ymin:t,ymax:Math.max(e[1],o[1]),x:t===e[1]?e[0]:o[0],islope:(o[0]-e[0])/(o[1]-e[1])})}}if(r.sort((e,t)=>e.ymin<t.ymin?-1:e.ymin>t.ymin?1:e.x<t.x?-1:e.x>t.x?1:e.ymax===t.ymax?0:(e.ymax-t.ymax)/Math.abs(e.ymax-t.ymax)),!r.length)return o;let a=[],h=r[0].ymin;for(;a.length||r.length;){if(r.length){let e=-1;for(let t=0;t<r.length&&!(r[t].ymin>h);t++)e=t;r.splice(0,e+1).forEach(e=>{a.push({s:h,edge:e})})}if((a=a.filter(e=>!(e.edge.ymax<=h))).sort((e,t)=>e.edge.x===t.edge.x?0:(e.edge.x-t.edge.x)/Math.abs(e.edge.x-t.edge.x)),a.length>1)for(let e=0;e<a.length;e+=2){const t=e+1;if(t>=a.length)break;const n=a[e].edge,r=a[t].edge;o.push([[Math.round(n.x),h],[Math.round(r.x),h]])}h+=e,a.forEach(t=>{t.edge.x=t.edge.x+e*t.edge.islope})}}return o}
},{"../geometry":"yAKI"}],"G7ue":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.HachureFiller=void 0;var e=require("./scan-line-hachure");class r{constructor(e){this.helper=e}fillPolygon(e,r){return this._fillPolygon(e,r)}_fillPolygon(r,l,o=!1){const t=(0,e.polygonHachureLines)(r,l);return{type:"fillSketch",ops:this.renderLines(t,l,o)}}renderLines(e,r,l){let o=[],t=null;for(const n of e)o=o.concat(this.helper.doubleLineOps(n[0][0],n[0][1],n[1][0],n[1][1],r)),l&&t&&(o=o.concat(this.helper.doubleLineOps(t[0],t[1],n[0][0],n[0][1],r))),t=n[1];return o}}exports.HachureFiller=r;
},{"./scan-line-hachure":"K6f8"}],"hHj4":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.ZigZagFiller=void 0;var e=require("./hachure-filler");class l extends e.HachureFiller{fillPolygon(e,l){return this._fillPolygon(e,l,!0)}}exports.ZigZagFiller=l;
},{"./hachure-filler":"G7ue"}],"z0fq":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.HatchFiller=void 0;var e=require("./hachure-filler");class l extends e.HachureFiller{fillPolygon(e,l){const r=this._fillPolygon(e,l),o=Object.assign({},l,{hachureAngle:l.hachureAngle+90}),s=this._fillPolygon(e,o);return r.ops=r.ops.concat(s.ops),r}}exports.HatchFiller=l;
},{"./hachure-filler":"G7ue"}],"miYn":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.DotFiller=void 0;var e=require("../geometry"),t=require("./scan-line-hachure");class s{constructor(e){this.helper=e}fillPolygon(e,s){s=Object.assign({},s,{curveStepCount:4,hachureAngle:0,roughness:1});const r=(0,t.polygonHachureLines)(e,s);return this.dotsOnLines(r,s)}dotsOnLines(t,s){let r=[],o=s.hachureGap;o<0&&(o=4*s.strokeWidth),o=Math.max(o,.1);let n=s.fillWeight;n<0&&(n=s.strokeWidth/2);for(const h of t){const t=(0,e.lineLength)(h)/o,i=Math.ceil(t)-1,l=Math.atan((h[1][1]-h[0][1])/(h[1][0]-h[0][0]));for(let e=0;e<i;e++){const t=o*(e+1),i=t*Math.sin(l),a=t*Math.cos(l),c=[h[0][0]-a,h[0][1]+i],p=this.helper.randOffsetWithRange(c[0]-o/4,c[0]+o/4,s),u=this.helper.randOffsetWithRange(c[1]-o/4,c[1]+o/4,s),f=this.helper.ellipse(p,u,n,n,s);r=r.concat(f.ops)}}return{type:"fillSketch",ops:r}}}exports.DotFiller=s;
},{"../geometry":"yAKI","./scan-line-hachure":"K6f8"}],"y0Zq":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.DashedFiller=void 0;var e=require("../geometry"),t=require("./scan-line-hachure");class s{constructor(e){this.helper=e}fillPolygon(e,s){const h=(0,t.polygonHachureLines)(e,s);return{type:"fillSketch",ops:this.dashedLine(h,s)}}dashedLine(t,s){const h=s.dashOffset<0?s.hachureGap<0?4*s.strokeWidth:s.hachureGap:s.dashOffset,a=s.dashGap<0?s.hachureGap<0?4*s.strokeWidth:s.hachureGap:s.dashGap;let r=[];return t.forEach(t=>{const o=(0,e.lineLength)(t),c=Math.floor(o/(h+a)),n=(o+a-c*(h+a))/2;let i=t[0],l=t[1];i[0]>l[0]&&(i=t[1],l=t[0]);const d=Math.atan((l[1]-i[1])/(l[0]-i[0]));for(let e=0;e<c;e++){const t=e*(h+a),o=t+h,c=[i[0]+t*Math.cos(d)+n*Math.cos(d),i[1]+t*Math.sin(d)+n*Math.sin(d)],l=[i[0]+o*Math.cos(d)+n*Math.cos(d),i[1]+o*Math.sin(d)+n*Math.sin(d)];r=r.concat(this.helper.doubleLineOps(c[0],c[1],l[0],l[1],s))}}),r}}exports.DashedFiller=s;
},{"../geometry":"yAKI","./scan-line-hachure":"K6f8"}],"evO0":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.ZigZagLineFiller=void 0;var e=require("../geometry"),t=require("./scan-line-hachure");class s{constructor(e){this.helper=e}fillPolygon(e,s){const a=s.hachureGap<0?4*s.strokeWidth:s.hachureGap,i=s.zigzagOffset<0?a:s.zigzagOffset;s=Object.assign({},s,{hachureGap:a+i});const r=(0,t.polygonHachureLines)(e,s);return{type:"fillSketch",ops:this.zigzagLines(r,i,s)}}zigzagLines(t,s,a){let i=[];return t.forEach(t=>{const r=(0,e.lineLength)(t),h=Math.round(r/(2*s));let o=t[0],n=t[1];o[0]>n[0]&&(o=t[1],n=t[0]);const c=Math.atan((n[1]-o[1])/(n[0]-o[0]));for(let e=0;e<h;e++){const t=2*e*s,r=2*(e+1)*s,h=Math.sqrt(2*Math.pow(s,2)),n=[o[0]+t*Math.cos(c),o[1]+t*Math.sin(c)],l=[o[0]+r*Math.cos(c),o[1]+r*Math.sin(c)],g=[n[0]+h*Math.cos(c+Math.PI/4),n[1]+h*Math.sin(c+Math.PI/4)];i=(i=i.concat(this.helper.doubleLineOps(n[0],n[1],g[0],g[1],a))).concat(this.helper.doubleLineOps(g[0],g[1],l[0],l[1],a))}}),i}}exports.ZigZagLineFiller=s;
},{"../geometry":"yAKI","./scan-line-hachure":"K6f8"}],"iUSf":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.getFiller=s;var e=require("./hachure-filler"),r=require("./zigzag-filler"),l=require("./hatch-filler"),i=require("./dot-filler"),a=require("./dashed-filler"),c=require("./zigzag-line-filler");const t={};function s(s,h){let u=s.fillStyle||"hachure";if(!t[u])switch(u){case"zigzag":t[u]||(t[u]=new r.ZigZagFiller(h));break;case"cross-hatch":t[u]||(t[u]=new l.HatchFiller(h));break;case"dots":t[u]||(t[u]=new i.DotFiller(h));break;case"dashed":t[u]||(t[u]=new a.DashedFiller(h));break;case"zigzag-line":t[u]||(t[u]=new c.ZigZagLineFiller(h));break;case"hachure":default:t[u="hachure"]||(t[u]=new e.HachureFiller(h))}return t[u]}
},{"./hachure-filler":"G7ue","./zigzag-filler":"hHj4","./hatch-filler":"z0fq","./dot-filler":"miYn","./dashed-filler":"y0Zq","./zigzag-line-filler":"evO0"}],"kB9F":[function(require,module,exports) {
"use strict";function e(){return Math.floor(Math.random()*2**31)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.randomSeed=e,exports.Random=void 0;class t{constructor(e){this.seed=e}next(){return this.seed?(2**31-1&(this.seed=Math.imul(48271,this.seed)))/2**31:Math.random()}}exports.Random=t;
},{}],"dlEq":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.line=o,exports.linearPath=s,exports.polygon=c,exports.rectangle=r,exports.curve=i,exports.ellipse=h,exports.generateEllipseParams=u,exports.ellipseWithParams=p,exports.arc=l,exports.svgPath=f,exports.solidFillPolygon=d,exports.patternFillPolygon=M,exports.patternFillArc=x,exports.randOffset=y,exports.randOffsetWithRange=g,exports.doubleLineOps=m;var t=require("./path.js"),e=require("./fillers/filler.js"),a=require("./math.js");const n={randOffset:y,randOffsetWithRange:g,ellipse:h,doubleLineOps:m};function o(t,e,a,n,o){return{type:"path",ops:k(t,e,a,n,o)}}function s(t,e,a){const n=(t||[]).length;if(n>2){let o=[];for(let e=0;e<n-1;e++)o=o.concat(k(t[e][0],t[e][1],t[e+1][0],t[e+1][1],a));return e&&(o=o.concat(k(t[n-1][0],t[n-1][1],t[0][0],t[0][1],a))),{type:"path",ops:o}}return 2===n?o(t[0][0],t[0][1],t[1][0],t[1][1],a):{type:"path",ops:[]}}function c(t,e){return s(t,!0,e)}function r(t,e,a,n,o){return c([[t,e],[t+a,e],[t+a,e+n],[t,e+n]],o)}function i(t,e){const a=q(t,1*(1+.2*e.roughness),e),n=q(t,1.5*(1+.22*e.roughness),e);return{type:"path",ops:a.concat(n)}}function h(t,e,a,n,o){return p(t,e,o,u(a,n,o)).opset}function u(t,e,a){const n=Math.sqrt(2*Math.PI*Math.sqrt((Math.pow(t/2,2)+Math.pow(e/2,2))/2)),o=Math.max(a.curveStepCount,a.curveStepCount/Math.sqrt(200)*n),s=2*Math.PI/o;let c=Math.abs(t/2),r=Math.abs(e/2);const i=1-a.curveFitting;return{increment:s,rx:c+=b(c*i,a),ry:r+=b(r*i,a)}}function p(t,e,a,n){const[o,s]=I(n.increment,t,e,n.rx,n.ry,1,n.increment*v(.1,v(.4,1,a),a),a),[c]=I(n.increment,t,e,n.rx,n.ry,1.5,0,a),r=T(o,null,a),i=T(c,null,a);return{estimatedPoints:s,opset:{type:"path",ops:r.concat(i)}}}function l(t,e,a,n,o,s,c,r,i){const h=t,u=e;let p=Math.abs(a/2),l=Math.abs(n/2);p+=b(.01*p,i),l+=b(.01*l,i);let f=o,d=s;for(;f<0;)f+=2*Math.PI,d+=2*Math.PI;d-f>2*Math.PI&&(f=0,d=2*Math.PI);const M=2*Math.PI/i.curveStepCount,x=Math.min(M/2,(d-f)/2),y=O(x,h,u,p,l,f,d,1,i),g=O(x,h,u,p,l,f,d,1.5,i);let m=y.concat(g);return c&&(r?m=(m=m.concat(k(h,u,h+p*Math.cos(f),u+l*Math.sin(f),i))).concat(k(h,u,h+p*Math.cos(d),u+l*Math.sin(d),i)):(m.push({op:"lineTo",data:[h,u]}),m.push({op:"lineTo",data:[h+p*Math.cos(f),u+l*Math.sin(f)]}))),{type:"path",ops:m}}function f(e,a){e=(e||"").replace(/\n/g," ").replace(/(-\s)/g,"-").replace("/(ss)/g"," ");let n=new t.RoughPath(e);if(a.simplification){const e=new t.PathFitter(n.linearPoints,n.closed).fit(a.simplification);n=new t.RoughPath(e)}let o=[];const s=n.segments||[];for(let t=0;t<s.length;t++){const e=S(n,s[t],t>0?s[t-1]:null,a);e&&e.length&&(o=o.concat(e))}return{type:"path",ops:o}}function d(t,e){const a=[];if(t.length){const n=e.maxRandomnessOffset||0,o=t.length;if(o>2){a.push({op:"move",data:[t[0][0]+b(n,e),t[0][1]+b(n,e)]});for(let s=1;s<o;s++)a.push({op:"lineTo",data:[t[s][0]+b(n,e),t[s][1]+b(n,e)]})}}return{type:"fillPath",ops:a}}function M(t,a){return(0,e.getFiller)(a,n).fillPolygon(t,a)}function x(t,e,a,n,o,s,c){const r=t,i=e;let h=Math.abs(a/2),u=Math.abs(n/2);h+=b(.01*h,c),u+=b(.01*u,c);let p=o,l=s;for(;p<0;)p+=2*Math.PI,l+=2*Math.PI;l-p>2*Math.PI&&(p=0,l=2*Math.PI);const f=(l-p)/c.curveStepCount,d=[];for(let M=p;M<=l;M+=f)d.push([r+h*Math.cos(M),i+u*Math.sin(M)]);return d.push([r+h*Math.cos(l),i+u*Math.sin(l)]),d.push([r,i]),M(d,c)}function y(t,e){return b(t,e)}function g(t,e,a){return v(t,e,a)}function m(t,e,a,n,o){return k(t,e,a,n,o)}function P(t){return t.randomizer||(t.randomizer=new a.Random(t.seed||0)),t.randomizer.next()}function v(t,e,a){return a.roughness*a.roughnessGain*(P(a)*(e-t)+t)}function b(t,e){return v(-t,t,e)}function k(t,e,a,n,o){const s=R(t,e,a,n,o,!0,!1),c=R(t,e,a,n,o,!0,!0);return s.concat(c)}function R(t,e,a,n,o,s,c){const r=Math.pow(t-a,2)+Math.pow(e-n,2),i=Math.sqrt(r);o.roughnessGain=i<200?1:i>500?.4:-.0016668*i+1.233334;let h=o.maxRandomnessOffset||0;h*h*100>r&&(h=i/10);const u=h/2,p=.2+.2*P(o);let l=o.bowing*o.maxRandomnessOffset*(n-e)/200,f=o.bowing*o.maxRandomnessOffset*(t-a)/200;l=b(l,o),f=b(f,o);const d=[],M=()=>b(u,o),x=()=>b(h,o);return s&&(c?d.push({op:"move",data:[t+M(),e+M()]}):d.push({op:"move",data:[t+b(h,o),e+b(h,o)]})),c?d.push({op:"bcurveTo",data:[l+t+(a-t)*p+M(),f+e+(n-e)*p+M(),l+t+2*(a-t)*p+M(),f+e+2*(n-e)*p+M(),a+M(),n+M()]}):d.push({op:"bcurveTo",data:[l+t+(a-t)*p+x(),f+e+(n-e)*p+x(),l+t+2*(a-t)*p+x(),f+e+2*(n-e)*p+x(),a+x(),n+x()]}),d}function q(t,e,a){const n=[];n.push([t[0][0]+b(e,a),t[0][1]+b(e,a)]),n.push([t[0][0]+b(e,a),t[0][1]+b(e,a)]);for(let o=1;o<t.length;o++)n.push([t[o][0]+b(e,a),t[o][1]+b(e,a)]),o===t.length-1&&n.push([t[o][0]+b(e,a),t[o][1]+b(e,a)]);return T(n,null,a)}function T(t,e,a){const n=t.length;let o=[];if(n>3){const s=[],c=1-a.curveTightness;o.push({op:"move",data:[t[1][0],t[1][1]]});for(let e=1;e+2<n;e++){const a=t[e];s[0]=[a[0],a[1]],s[1]=[a[0]+(c*t[e+1][0]-c*t[e-1][0])/6,a[1]+(c*t[e+1][1]-c*t[e-1][1])/6],s[2]=[t[e+1][0]+(c*t[e][0]-c*t[e+2][0])/6,t[e+1][1]+(c*t[e][1]-c*t[e+2][1])/6],s[3]=[t[e+1][0],t[e+1][1]],o.push({op:"bcurveTo",data:[s[1][0],s[1][1],s[2][0],s[2][1],s[3][0],s[3][1]]})}if(e&&2===e.length){const t=a.maxRandomnessOffset;o.push({op:"lineTo",data:[e[0]+b(t,a),e[1]+b(t,a)]})}}else 3===n?(o.push({op:"move",data:[t[1][0],t[1][1]]}),o.push({op:"bcurveTo",data:[t[1][0],t[1][1],t[2][0],t[2][1],t[2][0],t[2][1]]})):2===n&&(o=o.concat(k(t[0][0],t[0][1],t[1][0],t[1][1],a)));return o}function I(t,e,a,n,o,s,c,r){const i=[],h=[],u=b(.5,r)-Math.PI/2;h.push([b(s,r)+e+.9*n*Math.cos(u-t),b(s,r)+a+.9*o*Math.sin(u-t)]);for(let p=u;p<2*Math.PI+u-.01;p+=t){const t=[b(s,r)+e+n*Math.cos(p),b(s,r)+a+o*Math.sin(p)];i.push(t),h.push(t)}return h.push([b(s,r)+e+n*Math.cos(u+2*Math.PI+.5*c),b(s,r)+a+o*Math.sin(u+2*Math.PI+.5*c)]),h.push([b(s,r)+e+.98*n*Math.cos(u+c),b(s,r)+a+.98*o*Math.sin(u+c)]),h.push([b(s,r)+e+.9*n*Math.cos(u+.5*c),b(s,r)+a+.9*o*Math.sin(u+.5*c)]),[h,i]}function O(t,e,a,n,o,s,c,r,i){const h=s+b(.1,i),u=[];u.push([b(r,i)+e+.9*n*Math.cos(h-t),b(r,i)+a+.9*o*Math.sin(h-t)]);for(let p=h;p<=c;p+=t)u.push([b(r,i)+e+n*Math.cos(p),b(r,i)+a+o*Math.sin(p)]);return u.push([e+n*Math.cos(c),a+o*Math.sin(c)]),u.push([e+n*Math.cos(c),a+o*Math.sin(c)]),T(u,null,i)}function w(t,e,a,n,o,s,c,r){const i=[],h=[r.maxRandomnessOffset||1,(r.maxRandomnessOffset||1)+.5];let u=[0,0];for(let p=0;p<2;p++)0===p?i.push({op:"move",data:[c.x,c.y]}):i.push({op:"move",data:[c.x+b(h[0],r),c.y+b(h[0],r)]}),u=[o+b(h[p],r),s+b(h[p],r)],i.push({op:"bcurveTo",data:[t+b(h[p],r),e+b(h[p],r),a+b(h[p],r),n+b(h[p],r),u[0],u[1]]});return c.setPosition(u[0],u[1]),i}function S(e,a,n,o){let s=[];switch(a.key){case"M":case"m":{const t="m"===a.key;if(a.data.length>=2){let n=+a.data[0],c=+a.data[1];t&&(n+=e.x,c+=e.y);const r=1*(o.maxRandomnessOffset||0);n+=b(r,o),c+=b(r,o),e.setPosition(n,c),s.push({op:"move",data:[n,c]})}break}case"L":case"l":{const t="l"===a.key;if(a.data.length>=2){let n=+a.data[0],c=+a.data[1];t&&(n+=e.x,c+=e.y),s=s.concat(k(e.x,e.y,n,c,o)),e.setPosition(n,c)}break}case"H":case"h":{const t="h"===a.key;if(a.data.length){let n=+a.data[0];t&&(n+=e.x),s=s.concat(k(e.x,e.y,n,e.y,o)),e.setPosition(n,e.y)}break}case"V":case"v":{const t="v"===a.key;if(a.data.length){let n=+a.data[0];t&&(n+=e.y),s=s.concat(k(e.x,e.y,e.x,n,o)),e.setPosition(e.x,n)}break}case"Z":case"z":e.first&&(s=s.concat(k(e.x,e.y,e.first[0],e.first[1],o)),e.setPosition(e.first[0],e.first[1]),e.first=null);break;case"C":case"c":{const t="c"===a.key;if(a.data.length>=6){let n=+a.data[0],c=+a.data[1],r=+a.data[2],i=+a.data[3],h=+a.data[4],u=+a.data[5];t&&(n+=e.x,r+=e.x,h+=e.x,c+=e.y,i+=e.y,u+=e.y);const p=w(n,c,r,i,h,u,e,o);s=s.concat(p),e.bezierReflectionPoint=[h+(h-r),u+(u-i)]}break}case"S":case"s":{const t="s"===a.key;if(a.data.length>=4){let c=+a.data[0],r=+a.data[1],i=+a.data[2],h=+a.data[3];t&&(c+=e.x,i+=e.x,r+=e.y,h+=e.y);let u=c,p=r;const l=n?n.key:"";let f=null;"c"!==l&&"C"!==l&&"s"!==l&&"S"!==l||(f=e.bezierReflectionPoint),f&&(u=f[0],p=f[1]);const d=w(u,p,c,r,i,h,e,o);s=s.concat(d),e.bezierReflectionPoint=[i+(i-c),h+(h-r)]}break}case"Q":case"q":{const t="q"===a.key;if(a.data.length>=4){let n=+a.data[0],c=+a.data[1],r=+a.data[2],i=+a.data[3];t&&(n+=e.x,r+=e.x,c+=e.y,i+=e.y);const h=1*(1+.2*o.roughness),u=1.5*(1+.22*o.roughness);s.push({op:"move",data:[e.x+b(h,o),e.y+b(h,o)]});let p=[r+b(h,o),i+b(h,o)];s.push({op:"qcurveTo",data:[n+b(h,o),c+b(h,o),p[0],p[1]]}),s.push({op:"move",data:[e.x+b(u,o),e.y+b(u,o)]}),p=[r+b(u,o),i+b(u,o)],s.push({op:"qcurveTo",data:[n+b(u,o),c+b(u,o),p[0],p[1]]}),e.setPosition(p[0],p[1]),e.quadReflectionPoint=[r+(r-n),i+(i-c)]}break}case"T":case"t":{const t="t"===a.key;if(a.data.length>=2){let c=+a.data[0],r=+a.data[1];t&&(c+=e.x,r+=e.y);let i=c,h=r;const u=n?n.key:"";let p=null;"q"!==u&&"Q"!==u&&"t"!==u&&"T"!==u||(p=e.quadReflectionPoint),p&&(i=p[0],h=p[1]);const l=1*(1+.2*o.roughness),f=1.5*(1+.22*o.roughness);s.push({op:"move",data:[e.x+b(l,o),e.y+b(l,o)]});let d=[c+b(l,o),r+b(l,o)];s.push({op:"qcurveTo",data:[i+b(l,o),h+b(l,o),d[0],d[1]]}),s.push({op:"move",data:[e.x+b(f,o),e.y+b(f,o)]}),d=[c+b(f,o),r+b(f,o)],s.push({op:"qcurveTo",data:[i+b(f,o),h+b(f,o),d[0],d[1]]}),e.setPosition(d[0],d[1]),e.quadReflectionPoint=[c+(c-i),r+(r-h)]}break}case"A":case"a":{const n="a"===a.key;if(a.data.length>=7){const c=+a.data[0],r=+a.data[1],i=+a.data[2],h=+a.data[3],u=+a.data[4];let p=+a.data[5],l=+a.data[6];if(n&&(p+=e.x,l+=e.y),p===e.x&&l===e.y)break;if(0===c||0===r)s=s.concat(k(e.x,e.y,p,l,o)),e.setPosition(p,l);else for(let a=0;a<1;a++){const a=new t.RoughArcConverter([e.x,e.y],[p,l],[c,r],i,!!h,!!u);let n=a.getNextSegment();for(;n;){const t=w(n.cp1[0],n.cp1[1],n.cp2[0],n.cp2[1],n.to[0],n.to[1],e,o);s=s.concat(t),n=a.getNextSegment()}}}break}}return s}
},{"./path.js":"hLss","./fillers/filler.js":"iUSf","./math.js":"kB9F"}],"k761":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.RoughGenerator=void 0;var t=require("./core"),e=require("./renderer.js"),s=require("./math");const i="undefined"!=typeof self,o="none";class l{constructor(t,e){this.defaultOptions={maxRandomnessOffset:2,roughness:1,bowing:1,stroke:"#000",strokeWidth:1,curveTightness:0,curveFitting:.95,curveStepCount:9,fillStyle:"hachure",fillWeight:-1,hachureAngle:-41,hachureGap:-1,dashOffset:-1,dashGap:-1,zigzagOffset:-1,seed:0,roughnessGain:1},this.config=t||{},this.surface=e,this.config.options&&(this.defaultOptions=this._options(this.config.options))}static newSeed(){return(0,s.randomSeed)()}_options(t){return t?Object.assign({},this.defaultOptions,t):this.defaultOptions}_drawable(t,e,s){return{shape:t,sets:e||[],options:s||this.defaultOptions}}line(t,s,i,o,l){const r=this._options(l);return this._drawable("line",[(0,e.line)(t,s,i,o,r)],r)}rectangle(t,s,i,l,r){const a=this._options(r),h=[],n=(0,e.rectangle)(t,s,i,l,a);if(a.fill){const o=[[t,s],[t+i,s],[t+i,s+l],[t,s+l]];"solid"===a.fillStyle?h.push((0,e.solidFillPolygon)(o,a)):h.push((0,e.patternFillPolygon)(o,a))}return a.stroke!==o&&h.push(n),this._drawable("rectangle",h,a)}ellipse(t,s,i,l,r){const a=this._options(r),h=[],n=(0,e.generateEllipseParams)(i,l,a),p=(0,e.ellipseWithParams)(t,s,a,n);if(a.fill)if("solid"===a.fillStyle){const i=(0,e.ellipseWithParams)(t,s,a,n).opset;i.type="fillPath",h.push(i)}else h.push((0,e.patternFillPolygon)(p.estimatedPoints,a));return a.stroke!==o&&h.push(p.opset),this._drawable("ellipse",h,a)}circle(t,e,s,i){const o=this.ellipse(t,e,s,s,i);return o.shape="circle",o}linearPath(t,s){const i=this._options(s);return this._drawable("linearPath",[(0,e.linearPath)(t,!1,i)],i)}arc(t,s,i,l,r,a,h=!1,n){const p=this._options(n),c=[],u=(0,e.arc)(t,s,i,l,r,a,h,!0,p);if(h&&p.fill)if("solid"===p.fillStyle){const o=(0,e.arc)(t,s,i,l,r,a,!0,!1,p);o.type="fillPath",c.push(o)}else c.push((0,e.patternFillArc)(t,s,i,l,r,a,p));return p.stroke!==o&&c.push(u),this._drawable("arc",c,p)}curve(t,s){const i=this._options(s);return this._drawable("curve",[(0,e.curve)(t,i)],i)}polygon(t,s){const i=this._options(s),l=[],r=(0,e.linearPath)(t,!0,i);return i.fill&&("solid"===i.fillStyle?l.push((0,e.solidFillPolygon)(t,i)):l.push((0,e.patternFillPolygon)(t,i))),i.stroke!==o&&l.push(r),this._drawable("polygon",l,i)}path(t,s){const i=this._options(s),l=[];if(!t)return this._drawable("path",l,i);const r=(0,e.svgPath)(t,i);if(i.fill)if("solid"===i.fillStyle){const e={type:"path2Dfill",path:t,ops:[]};l.push(e)}else{const s=this.computePathSize(t),o=[[0,0],[s[0],0],[s[0],s[1]],[0,s[1]]],r=(0,e.patternFillPolygon)(o,i);r.type="path2Dpattern",r.size=s,r.path=t,l.push(r)}return i.stroke!==o&&l.push(r),this._drawable("path",l,i)}computePathSize(e){let s=[0,0];if(i&&self.document)try{const i=self.document.createElementNS(t.SVGNS,"svg");i.setAttribute("width","0"),i.setAttribute("height","0");const o=self.document.createElementNS(t.SVGNS,"path");o.setAttribute("d",e),i.appendChild(o),self.document.body.appendChild(i);const r=o.getBBox();r&&(s[0]=r.width||0,s[1]=r.height||0),self.document.body.removeChild(i)}catch(l){}const o=this.getCanvasSize();return s[0]*s[1]||(s=o),s}getCanvasSize(){const t=t=>t&&"object"==typeof t&&t.baseVal&&t.baseVal.value?t.baseVal.value:t||100;return this.surface?[t(this.surface.width),t(this.surface.height)]:[100,100]}opsToPath(t){let e="";for(const s of t.ops){const t=s.data;switch(s.op){case"move":e+=`M${t[0]} ${t[1]} `;break;case"bcurveTo":e+=`C${t[0]} ${t[1]}, ${t[2]} ${t[3]}, ${t[4]} ${t[5]} `;break;case"qcurveTo":e+=`Q${t[0]} ${t[1]}, ${t[2]} ${t[3]} `;break;case"lineTo":e+=`L${t[0]} ${t[1]} `}}return e.trim()}toPaths(t){const e=t.sets||[],s=t.options||this.defaultOptions,i=[];for(const l of e){let t=null;switch(l.type){case"path":t={d:this.opsToPath(l),stroke:s.stroke,strokeWidth:s.strokeWidth,fill:o};break;case"fillPath":t={d:this.opsToPath(l),stroke:o,strokeWidth:0,fill:s.fill||o};break;case"fillSketch":t=this.fillSketch(l,s);break;case"path2Dfill":t={d:l.path||"",stroke:o,strokeWidth:0,fill:s.fill||o};break;case"path2Dpattern":{const e=l.size,i={x:0,y:0,width:1,height:1,viewBox:`0 0 ${Math.round(e[0])} ${Math.round(e[1])}`,patternUnits:"objectBoundingBox",path:this.fillSketch(l,s)};t={d:l.path,stroke:o,strokeWidth:0,pattern:i};break}}t&&i.push(t)}return i}fillSketch(t,e){let s=e.fillWeight;return s<0&&(s=e.strokeWidth/2),{d:this.opsToPath(t),stroke:e.fill||o,strokeWidth:s,fill:o}}}exports.RoughGenerator=l;
},{"./core":"kOve","./renderer.js":"dlEq","./math":"kB9F"}],"COmE":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.RoughCanvas=void 0;var t=require("./core"),e=require("./generator");const s="undefined"!=typeof document;class r{constructor(t,s){this.canvas=t,this.ctx=this.canvas.getContext("2d"),this.gen=new e.RoughGenerator(s,this.canvas)}draw(t){const e=t.sets||[],r=t.options||this.getDefaultOptions(),i=this.ctx;for(const n of e)switch(n.type){case"path":i.save(),i.strokeStyle="none"===r.stroke?"transparent":r.stroke,i.lineWidth=r.strokeWidth,this._drawToContext(i,n),i.restore();break;case"fillPath":i.save(),i.fillStyle=r.fill||"",this._drawToContext(i,n),i.restore();break;case"fillSketch":this.fillSketch(i,n,r);break;case"path2Dfill":{this.ctx.save(),this.ctx.fillStyle=r.fill||"";const t=new Path2D(n.path);this.ctx.fill(t),this.ctx.restore();break}case"path2Dpattern":{const t=this.canvas.ownerDocument||s&&document;if(t){const e=n.size,s=t.createElement("canvas"),i=s.getContext("2d"),a=this.computeBBox(n.path);a&&(a.width||a.height)?(s.width=this.canvas.width,s.height=this.canvas.height,i.translate(a.x||0,a.y||0)):(s.width=e[0],s.height=e[1]),this.fillSketch(i,n,r),this.ctx.save(),this.ctx.fillStyle=this.ctx.createPattern(s,"repeat");const o=new Path2D(n.path);this.ctx.fill(o),this.ctx.restore()}else console.error("Pattern fill fail: No defs");break}}}computeBBox(e){if(s)try{const s=document.createElementNS(t.SVGNS,"svg");s.setAttribute("width","0"),s.setAttribute("height","0");const i=self.document.createElementNS(t.SVGNS,"path");i.setAttribute("d",e),s.appendChild(i),document.body.appendChild(s);const n=i.getBBox();return document.body.removeChild(s),n}catch(r){}return null}fillSketch(t,e,s){let r=s.fillWeight;r<0&&(r=s.strokeWidth/2),t.save(),t.strokeStyle=s.fill||"",t.lineWidth=r,this._drawToContext(t,e),t.restore()}_drawToContext(t,e){t.beginPath();for(const s of e.ops){const e=s.data;switch(s.op){case"move":t.moveTo(e[0],e[1]);break;case"bcurveTo":t.bezierCurveTo(e[0],e[1],e[2],e[3],e[4],e[5]);break;case"qcurveTo":t.quadraticCurveTo(e[0],e[1],e[2],e[3]);break;case"lineTo":t.lineTo(e[0],e[1])}}"fillPath"===e.type?t.fill():t.stroke()}get generator(){return this.gen}getDefaultOptions(){return this.gen.defaultOptions}line(t,e,s,r,i){const n=this.gen.line(t,e,s,r,i);return this.draw(n),n}rectangle(t,e,s,r,i){const n=this.gen.rectangle(t,e,s,r,i);return this.draw(n),n}ellipse(t,e,s,r,i){const n=this.gen.ellipse(t,e,s,r,i);return this.draw(n),n}circle(t,e,s,r){const i=this.gen.circle(t,e,s,r);return this.draw(i),i}linearPath(t,e){const s=this.gen.linearPath(t,e);return this.draw(s),s}polygon(t,e){const s=this.gen.polygon(t,e);return this.draw(s),s}arc(t,e,s,r,i,n,a=!1,o){const h=this.gen.arc(t,e,s,r,i,n,a,o);return this.draw(h),h}curve(t,e){const s=this.gen.curve(t,e);return this.draw(s),s}path(t,e){const s=this.gen.path(t,e);return this.draw(s),s}}exports.RoughCanvas=r;
},{"./core":"kOve","./generator":"k761"}],"EtU7":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.RoughSVG=void 0;var t=require("./core"),e=require("./generator");const s="undefined"!=typeof document;class r{constructor(t,s){this.svg=t,this.gen=new e.RoughGenerator(s,this.svg)}get defs(){const e=this.svg.ownerDocument||s&&document;if(e&&!this._defs){const s=e.createElementNS(t.SVGNS,"defs");this.svg.firstChild?this.svg.insertBefore(s,this.svg.firstChild):this.svg.appendChild(s),this._defs=s}return this._defs||null}draw(e){const s=e.sets||[],r=e.options||this.getDefaultOptions(),i=this.svg.ownerDocument||window.document,n=i.createElementNS(t.SVGNS,"g");for(const o of s){let e=null;switch(o.type){case"path":(e=i.createElementNS(t.SVGNS,"path")).setAttribute("d",this.opsToPath(o)),e.style.stroke=r.stroke,e.style.strokeWidth=r.strokeWidth+"",e.style.fill="none";break;case"fillPath":(e=i.createElementNS(t.SVGNS,"path")).setAttribute("d",this.opsToPath(o)),e.style.stroke="none",e.style.strokeWidth="0",e.style.fill=r.fill||"";break;case"fillSketch":e=this.fillSketch(i,o,r);break;case"path2Dfill":(e=i.createElementNS(t.SVGNS,"path")).setAttribute("d",o.path||""),e.style.stroke="none",e.style.strokeWidth="0",e.style.fill=r.fill||"";break;case"path2Dpattern":if(this.defs){const s=o.size,n=i.createElementNS(t.SVGNS,"pattern"),h=`rough-${Math.floor(Math.random()*(Number.MAX_SAFE_INTEGER||999999))}`;n.setAttribute("id",h),n.setAttribute("x","0"),n.setAttribute("y","0"),n.setAttribute("width","1"),n.setAttribute("height","1"),n.setAttribute("height","1"),n.setAttribute("viewBox",`0 0 ${Math.round(s[0])} ${Math.round(s[1])}`),n.setAttribute("patternUnits","objectBoundingBox");const l=this.fillSketch(i,o,r);n.appendChild(l),this.defs.appendChild(n),(e=i.createElementNS(t.SVGNS,"path")).setAttribute("d",o.path||""),e.style.stroke="none",e.style.strokeWidth="0",e.style.fill=`url(#${h})`}else console.error("Pattern fill fail: No defs")}e&&n.appendChild(e)}return n}fillSketch(e,s,r){let i=r.fillWeight;i<0&&(i=r.strokeWidth/2);const n=e.createElementNS(t.SVGNS,"path");return n.setAttribute("d",this.opsToPath(s)),n.style.stroke=r.fill||"",n.style.strokeWidth=i+"",n.style.fill="none",n}get generator(){return this.gen}getDefaultOptions(){return this.gen.defaultOptions}opsToPath(t){return this.gen.opsToPath(t)}line(t,e,s,r,i){const n=this.gen.line(t,e,s,r,i);return this.draw(n)}rectangle(t,e,s,r,i){const n=this.gen.rectangle(t,e,s,r,i);return this.draw(n)}ellipse(t,e,s,r,i){const n=this.gen.ellipse(t,e,s,r,i);return this.draw(n)}circle(t,e,s,r){const i=this.gen.circle(t,e,s,r);return this.draw(i)}linearPath(t,e){const s=this.gen.linearPath(t,e);return this.draw(s)}polygon(t,e){const s=this.gen.polygon(t,e);return this.draw(s)}arc(t,e,s,r,i,n,o=!1,h){const l=this.gen.arc(t,e,s,r,i,n,o,h);return this.draw(l)}curve(t,e){const s=this.gen.curve(t,e);return this.draw(s)}path(t,e){const s=this.gen.path(t,e);return this.draw(s)}}exports.RoughSVG=r;
},{"./core":"kOve","./generator":"k761"}],"ZxyV":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=require("./canvas"),r=require("./generator"),a=require("./svg"),o={canvas:(r,a)=>new e.RoughCanvas(r,a),svg:(e,r)=>new a.RoughSVG(e,r),generator:(e,a)=>new r.RoughGenerator(e,a),newSeed:()=>r.RoughGenerator.newSeed()};exports.default=o;
},{"./canvas":"COmE","./generator":"k761","./svg":"EtU7"}],"epB2":[function(require,module,exports) {
"use strict";var t=e(require("roughjs/bin/rough"));function e(t){return t&&t.__esModule?t:{default:t}}var o="localhost"===location.hostname?"http://localhost:8000/tic-tac-toe-AI":"https://fatdog.herokuapp.com/tic-tac-toe-AI",n=document.getElementById("message"),r=document.getElementById("canvas"),c=r.getContext("2d"),i=t.default.canvas(r),s=32,a=r.width,u=r.height,l=!1,h=[0,0,0,0,0,0,0,0,0];function d(t,e,o,n){i.line(t,e,o,n,{strokeWidth:15,roughness:3,stroke:"rgb(249, 200, 14)"})}function f(){d(.33*a,s,.33*a,u-s),d(.66*a,s,.66*a,u-s),d(s,.33*u,a-s,.33*u),d(s,.66*u,a-s,.66*u)}function g(t){var e=t%3,o=Math.floor(t/3),n=1.5*s+e*(a/3),r=1.5*s+o*(u/3),c=-3*s+n+a/3,l=-3*s+r+u/3;i.line(n,r,c,l,{strokeWidth:15,roughness:3,stroke:"rgb(204, 0, 53"}),i.line(c,r,n,l,{strokeWidth:15,roughness:3,stroke:"rgb(204, 0, 53"})}function m(t){var e=t%3,o=Math.floor(t/3),n=1.5*s+e*(a/3),r=1.5*s+o*(u/3),c=(n+(-3*s+n+a/3))/2,l=(r+(-3*s+r+u/3))/2;i.ellipse(c,l,(a-7.5*s)/3,(u-5.5*s)/3,{strokeWidth:15,roughness:1,stroke:"rgb(53, 76, 161)"})}function v(){c.clearRect(0,0,r.width,r.height),f();for(var t=0;t<9;t++)1===h[t]?g(t):-1===h[t]&&m(t)}function b(){return!l&&(l=!0,r.classList.add("translucent"),document.body.classList.add("wait"),!0)}function k(){r.classList.remove("translucent"),document.body.classList.remove("wait"),l=!1}function M(){var t={board:h};b()&&fetch("".concat(o),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then(function(t){return t.json()}).then(function(t){h=t.board,v()}).catch(function(t){console.error("HMMMMM",t)}).finally(function(){k()})}r.addEventListener("click",function(t){var e=r.getBoundingClientRect(),o=Math.floor((t.clientX-e.left)/(.33*a)),n=3*Math.floor((t.clientY-e.top)/(.33*u))+o;0===h[n]&&(h[n]=-1,v(),M())}),v(),M();
},{"roughjs/bin/rough":"ZxyV"}]},{},["epB2"], null)
//# sourceMappingURL=/main.9b2ffa6e.js.map