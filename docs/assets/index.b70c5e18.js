import{d as t,r as e,o as i,c as s,J as n,_ as a,a as o,b as l,e as r,f as c,F as h,g as u,w as d,u as f,E as g,i as p,p as m,h as y,j as b,k as x,l as v,m as w,n as U,q as L,K as T,v as F,s as E,t as k,x as M,y as P,z as S,A as I,B}from"./vendor.ce6a9cf6.js";var R=t({setup:t=>(t,n)=>{const a=e("router-view");return i(),s(a)}});function H(t,e){const i=t.split("/").slice(0,-1),s=e.split("/");for(var n=0;n<s.length;n++)"."!=s[n]&&(".."==s[n]?i.pop():i.push(s[n]));return i.join("/")}function C(t,e){const i=t.split("/").slice(0,-1),s=e.split("/");for(;i[0]===s[0];)i.shift(),s.shift();let n=new Array(i.length).fill("..");return n=n.concat(s),n.join("/")}function D(t){let e=t.split("/").slice(0,-1).join("/");return""!==e&&(e+="/"),e}function N(t){const e=t.map(D);return a.head(a(e).countBy().entries().maxBy(a.last))}class A{constructor(t){this.zip=new n,this.loaded=!1,this.dp=new DOMParser,this.name="",this.fileList=[],this.textFileList=[],this.textPath="",this.styleFileList=[],this.stylePath="",this.imageFileList=[],this.imageBlobs=[],this.imagePath="",this.textDocs={},this.opfFilePath="",this.opfDoc=new Document,this.ncxFilePath="",this.ncxDoc=new Document,void 0!==t&&(this.file=t,this.name=t.name)}async load(){if(!this.loaded)try{await this.loadAsZip(),await this.parseOpf(),await this.parseNcx(),this.loaded=!0}catch(t){throw t}}async loadAsZip(){if(void 0===this.file)throw new Error("file not found.");this.zip=await n.loadAsync(this.file),this.fileList=Object.keys(this.zip.files)}async getOpfFilePath(){const t=()=>{const t=this.fileList.find((t=>/[\s\S]+\.opf/g.test(t)));if(void 0===t)throw new Error("opf filepath not found");return t},e=this.zip.file("META-INF/container.xml");if(null===e)return t();const i=await e.async("text"),s=this.dp.parseFromString(i,"text/xml").getElementsByTagName("rootfile")[0];if(void 0===s)return t();const n=s.getAttribute("full-path");return null===n?t():n}async parseOpf(){this.opfFilePath=await this.getOpfFilePath();const t=D(this.opfFilePath),e=this.zip.file(this.opfFilePath);if(null===e)throw new Error("opf file not found");const i=await e.async("string");this.opfDoc=this.dp.parseFromString(i,"text/xml");const s=this.opfDoc.getElementsByTagName("manifest")[0];if(void 0===s)throw new Error("the opf file has no manifest");const n=[...s.children].map((t=>t.getAttribute("href"))).filter((t=>null!==t));this.textFileList=n.filter((t=>/[\s\S]+\.(xhtml|html)/g.test(t))).map((e=>H(t,e))),this.textPath=N(this.textFileList),this.styleFileList=this.fileList.filter((t=>/[\s\S]+\.css/g.test(t))),this.stylePath=N(this.styleFileList),this.imageFileList=this.fileList.filter((t=>/[\s\S]+\.(png|jpe?g|gif|svg)/g.test(t))),this.imagePath=N(this.imageFileList);for(let a of this.imageFileList)this.imageBlobs.push({path:a,blob:await this.getImage(a)})}async getTextDoc(t){if(void 0!==this.textDocs[t])return this.textDocs[t];const e=this.zip.file(t);if(null===e)return new Document;const i=await e.async("string"),s=this.dp.parseFromString(i,"text/html");return this.textDocs[t]=s,s}async updateImageSrc(t,e){const i=(await this.getTextDoc(t)).getElementsByTagName("img");for(let s of i){let i=s.getAttribute("src");null!==i&&(i=H(t,i),void 0!==e[i]&&s.setAttribute("src",e[i]))}}async getTextBody(t){return(await this.getTextDoc(t)).body.innerHTML}getNcxFilePath(){const t=()=>{const t=this.fileList.find((t=>/[\s\S]+\.ncx/g.test(t)));if(void 0===t)throw new Error("ncx filepath not found");return t},e=this.opfDoc.getElementById("ncx");if(null===e)return t();const i=e.getAttribute("href");return null===i?t():H(this.opfFilePath,i)}async parseNcx(){this.ncxFilePath=this.getNcxFilePath();const t=this.zip.file(this.ncxFilePath);if(null===t)throw new Error(".ncx file not found");const e=await t.async("text");this.ncxDoc=this.dp.parseFromString(e,"text/xml")}async getNavFlat(){const t=[...this.ncxDoc.getElementsByTagName("navPoint")],e={};return t.forEach((t=>{const i=t.getElementsByTagName("text")[0].innerHTML;let s=t.getElementsByTagName("content")[0].getAttribute("src");null!==s&&(s=s.split("#")[0],s=H(this.ncxFilePath,s),e[s]=i)})),e}getMetadata(){const t=this.opfDoc.getElementsByTagName("metadata")[0];if(!t)return{};const e=[...t.children],i={};return e.forEach((t=>{let e=t.tagName;if(!1===/dc:[\s\S]+/g.test(e))return;e=e.slice(3);const s=t.innerHTML;i[e]=s})),i}async getCssListOfTextFile(t){return[...(await this.getTextDoc(t)).getElementsByTagName("link")].map((t=>{const e=t.getAttribute("href");return null===e?"":e})).filter((t=>""!==t)).map((e=>H(t,e)))}async getInternalStyle(t){const e=[...(await this.getTextDoc(t)).getElementsByTagName("style")];if(0===e.length)return"";return e.map((t=>t.innerHTML)).reduce(((t,e)=>`${t}\n${e}`))}async getCssText(t){const e=this.zip.file(t);return null===e?"":await e.async("string")}async getImage(t){const e=this.zip.file(t);if(null===e)throw new Error("file not found");return e.async("blob")}async addImage(t){if(!this.loaded)return"";const e=t.name,i=t.type,s=this.imagePath+e;this.zip.file(s,t);const n=this.opfDoc,a=n.getElementsByTagName("manifest")[0],o=n.createElement("item");return o.setAttribute("href",C(this.opfFilePath,s)),o.setAttribute("media-type",i),a.appendChild(o),s}async saveTextFile(t,e,i){const s=await this.getTextDoc(t);s.body.innerHTML=e;const n=s.getElementsByTagName("img");for(let o of n){let e=o.getAttribute("src");null!==e&&(void 0!==i[e]&&(e=C(t,i[e]),o.setAttribute("src",e)))}const a=s.documentElement.outerHTML;this.zip.file(t,a)}saveStyleFile(t,e){this.zip.file(t,e)}async saveOpfFile(){const t=this.opfDoc.documentElement.outerHTML;this.zip.file(this.opfFilePath,t)}async saveMetadata(t){const e=Object.keys(t),i=this.opfDoc;let s=i.getElementsByTagName("metadata")[0];if(void 0===s){const t=i.createElement("metadata");i.appendChild(t),s=t}for(let n of e){const e=`dc:${n}`,a=i.getElementsByTagName(e)[0];if(void 0===a){const a=i.createElement(e);a.innerHTML=t[n],s.appendChild(a)}else a.innerHTML=t[n]}}async getBlob(){return this.saveOpfFile(),await this.zip.generateAsync({type:"blob"})}}const _=[115,116,121,125,131,200,201,202,203,204,205,206,207,300];class z{constructor(t){this.view=new DataView(t),this.buffer=new Uint8Array(t),this.offset=0,this.pdbHeader=this.loadPdbHeader(),this.recordList=this.loadRecordList(),this.palmHeader=this.loadPalmHeader(),this.mobiHeader=this.loadMobiHeader(),this.exthList=this.loadExthHeader(),this.content=this.loadText(),this.loadIndex(),this.doc=(new DOMParser).parseFromString(this.content,"text/html"),this.imageBlobs=this.loadImages()}loadPdbHeader(){return{name:this.getStr(32),fileAttributes:this.getUint16(),version:this.getUint16(),creationTime:this.getUint32(),modificationTime:this.getUint32(),backupTime:this.getUint32(),modificationNumber:this.getUint32(),appinfo:this.getUint32(),sortinfo:this.getUint32(),type:this.getStr(4),creator:this.getStr(4),uid:this.getUint32(),nextRecordList:this.getUint32(),numRecords:this.getUint16()}}loadRecordList(){let t=new Array;for(let e=0;e<this.pdbHeader.numRecords;e++)t.push({offset:this.getUint32(),attribute:this.getUint32()});return t}loadPalmHeader(){const t=this.recordList[0];return this.offset=t.offset,{begin:this.offset,compression:this.getUint16(),unused:this.getUint16(),textLength:this.getUint32(),recordCount:this.getUint16(),recordSize:this.getUint16(),currentPosition:this.getUint16(),encryptionType:this.getUint16(),end:this.offset}}loadMobiHeader(){const t=this.offset;let e={begin:this.offset,identifier:this.getStr(4),headerLength:this.getUint32(),mobiType:this.getUint32(),textEncoding:this.getUint32(),uid:this.getUint32(),fileVersion:this.getUint32()};return this.offset+=40,e.firstNonBookindex=this.getUint32(),e.fullNameOffset=this.getUint32(),e.fullNameLength=this.getUint32(),e.Locale=this.getUint32(),e.inputLanguage=this.getUint32(),e.outputLanguage=this.getUint32(),e.minVersion=this.getUint32(),e.firstImageRec=this.getUint32(),e.huffmanRecordOffset=this.getUint32(),e.huffmanRecordCount=this.getUint32(),e.huffmanTableOffset=this.getUint32(),e.huffmanTableLength=this.getUint32(),e.exthFlags=this.getUint32(),this.offset+=36,e.drmOffset=this.getUint32(),e.drmCount=this.getUint32(),e.drmSize=this.getUint32(),e.drmFlags=this.getUint32(),this.offset+=8,e.firstContentRec=this.getUint16(),e.lastContentRec=this.getUint16(),this.offset+=44,e.extraflags=this.getUint32(),e.indexRecOffset=this.getUint32(),this.offset=t+e.headerLength,e}loadExthHeader(){if("EXTH"!==this.getStr(4))return[];this.getUint32();let t=this.getUint32();const e=[];for(;t>0;){const i=this.getUint32(),s=this.getUint32()-8;let n="";n=_.includes(i)&&4===s?this.getUint32():this.getStr(s),e.push({type:i,data:n}),t--}return e}loadText(){const t=this.palmHeader.recordCount,e=[];let i=0;const s=this.mobiHeader.extraflags;for(let o=1;o<=t;o++){let t=this.buffer.slice(this.recordList[o].offset,this.recordList[o+1].offset);const n=V(t,s);t=t.slice(0,t.length-n),2===this.palmHeader.compression&&(t=X(t)),i+=t.byteLength,e.push(t)}const n=new Uint8Array(i);let a=0;return e.forEach((t=>{n.set(t,a),a+=t.byteLength})),O(n)}loadIndex(){const t=this.mobiHeader.indexRecOffset;if(void 0===t||4294967295===t)return;const e=this.offset=this.recordList[t].offset;let i=this.getStr(4);if("INDX"!==i)return;const s=this.getUint32();this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32(),this.getUint32();this.offset=e+s;const n={identifier:this.getStr(4),headerLength:this.getUint32(),ctrlByteCount:this.getUint32(),tagTable:[]};for(let l=0;l<(n.headerLength-12)/4;l++)n.tagTable.push({tag:this.getUint8(),valueNum:this.getUint8(),mask:this.getUint8(),ctrlByteEnd:this.getUint8()});const a=this.mobiHeader.firstImageRec,o=[];for(let l=t;l<a;l++)o.push(this.buffer.slice(this.recordList[l].offset,this.recordList[l+1].offset));this.indexRecords=o}loadImages(){const t=[],e=this.mobiHeader.firstImageRec,i=this.mobiHeader.lastContentRec;for(let s=e;s<i;s++){const i=this.recordList[s].offset,n=this.recordList[s+1].offset,a=new Blob([this.buffer.slice(i,n)]);t.push({path:String(s-e+1).padStart(5,"0"),blob:a})}return t}updateImageSrc(t){[...this.doc.getElementsByTagName("img")].forEach((e=>{const i=e.getAttribute("recindex");if(null===i)return;const s=t[i];null!==s&&e.setAttribute("src",s)}))}getText(){return this.doc.body.innerHTML}setText(t){this.doc.body.innerHTML=t}saveFile(){const t=this.doc.documentElement.outerHTML,e=(new TextEncoder).encode(t),i=e.length,s=this.recordList[1].offset-this.recordList[0].offset,{recordList:n,textRecNum:a,indexRec:o,firstImageRec:l,lastContentRec:r,flisRec:c,fcisRec:h,eofRec:u}=function(t,e,i,s){const n=[],a=Math.ceil(e/4096);let o=8*(a+s.length+i.length+4)+2+78;function l(t){n.push({offset:o,attribute:2*n.length}),o+=t}l(t);for(;e>0;)l(Math.min(4096,e)),e-=4096;return i.forEach((t=>{l(t.length)})),s.forEach((t=>{l(t.blob.size)})),l(36),l(44),l(4),{recordList:n,textRecNum:a,indexRec:a+1,firstImageRec:a+i.length+1,lastContentRec:n.length-4,flisRec:n.length-3,fcisRec:n.length-2,eofRec:n.length-1}}(s,i,this.indexRecords,this.imageBlobs),d=function(t){const e=8*t.length+2,i=new DataView(new ArrayBuffer(e));let s=0;return t.forEach((t=>{i.setUint32(s,t.offset),i.setUint32(s+4,t.attribute),s+=8})),i.buffer}(n);let f=this.buffer.slice(0,78).buffer;const g=new DataView(f);g.setUint16(76,n.length),f=g.buffer;let p=this.buffer.slice(this.palmHeader.begin,this.recordList[1].offset).buffer;const m=new DataView(p);m.setUint16(0,1),m.setUint32(4,i),m.setUint16(8,a),m.setUint32(108,l),m.setUint16(194,r),m.setUint32(200,h),m.setUint32(208,c),m.setUint32(240,1),m.setUint32(244,o),p=m.buffer;const y=this.mobiHeader.firstNonBookindex,b=this.recordList[y].offset,x=this.buffer.slice(b);return new Blob([f,d,p,e,x])}getUint8(){const t=this.view.getUint8(this.offset);return this.offset+=1,t}getUint16(){const t=this.view.getUint16(this.offset);return this.offset+=2,t}getUint32(){const t=this.view.getUint32(this.offset);return this.offset+=4,t}getStr(t){let e=O(this.buffer.slice(this.offset,this.offset+t));return this.offset+=t,e}}function O(t){return new TextDecoder("utf-8").decode(t)}function V(t,e){for(var i=t.length-1,s=0,n=15;n>0;n--)if(e&1<<n){var a=j(t,i),o=a[0],l=a[1];i=a[2],i-=o-l,s+=o}1&e&&(s+=1+(3&t[i]));return s}function j(t,e){for(var i=0,s=0,n=0,a=0,o=0;;o++){var l=t[e];if(s|=(127&l)<<a,a+=7,i+=1,e-=1,(n+=1)>=4||(128&l)>0)break}return[s,i,e]}function X(t){const e=new Uint8Array(8*t.length);let i=0,s=0;for(;i<t.length;){let n=t[i++];if(0===n||n>=9&&n<=127)e[s++]=n;else if(n>=1&&n<=8){for(let a=0;a<n&&i+a<t.length;a++)e[s++]=t[i+a];i+=n}else if(n>=128&&n<=191){if(i>t.length)break;n=n<<8|t[i++];const a=3+(7&n),o=n>>3&2047;if(o<=0||o>s)break;for(let t=0;t<a;t++){const t=s-o;e[s++]=e[t]}}else n>=192&&(e[s++]=32,e[s++]=128^n)}return e.slice(0,s)}function $(t,e){!function(){const t=document.getElementById("book-css");null!==t&&document.head.removeChild(t)}(),t=function(t,e){var i;const s=(new Document).implementation.createHTMLDocument(""),n=document.createElement("style");return n.innerText=t,s.body.appendChild(n),[...null==(i=n.sheet)?void 0:i.cssRules].map((t=>`${e}`+t.cssText)).join("\n")}(t,e);const i=document.createElement("style");i.setAttribute("id","book-css"),i.innerText=t,document.head.appendChild(i)}class q{constructor(){this.urlMap={},this.pathMap={}}set(t,e){this.urlMap[t]=e,this.pathMap[e]=t}setUrls(t){this.revoke(),t.forEach((t=>{this.set(t.path,URL.createObjectURL(t.blob))}))}revoke(){Object.values(this.urlMap).forEach(window.URL.revokeObjectURL),this.urlMap={},this.pathMap={}}}var K=t({props:{text:String},emits:["update:text"],setup(t,{emit:e}){const n=t,a=o();let c;return l((()=>{c=r(a.value,{value:n.text,mode:"css",lineNumbers:!0,viewportMargin:1/0}),c.on("change",(t=>{e("update:text",t.getValue())}))})),(t,e)=>(i(),s("div",{id:"cm",ref:a},null,512))}});K.__scopeId="data-v-19fb7a74";const Z=d("data-v-5bee36e1");var J=t({props:{data:{type:Object,required:!0}},setup(t){const n=t,a=o({key:"",value:""});function l(){const t=n.data,e=a.value.key,i=a.value.value;""!==e&&""!==i&&(t[e]=i)}return(n,o)=>{const r=e("el-input"),d=e("el-form-item"),f=e("el-form"),g=e("el-button");return i(),s("main",null,[c(f,{model:t.data,"label-position":"right","label-width":"100px"},{default:Z((()=>[(i(!0),s(h,null,u(Object.keys(t.data),(e=>(i(),s(d,{label:e,key:e},{default:Z((()=>[c(r,{modelValue:t.data[e],"onUpdate:modelValue":i=>t.data[e]=i,type:t.data[e].length<50?"text":"textarea",autosize:""},null,8,["modelValue","onUpdate:modelValue","type"])])),_:2},1032,["label"])))),128))])),_:1},8,["model"]),c(f,{id:"add-form",model:a.value},{default:Z((()=>[c(d,{id:"key-input"},{default:Z((()=>[c(r,{modelValue:a.value.key,"onUpdate:modelValue":o[1]||(o[1]=t=>a.value.key=t)},null,8,["modelValue"])])),_:1}),c(d,{id:"value-input"},{default:Z((()=>[c(r,{modelValue:a.value.value,"onUpdate:modelValue":o[2]||(o[2]=t=>a.value.value=t)},null,8,["modelValue"])])),_:1}),c(d,null,{default:Z((()=>[c(g,{type:"primary",onClick:l,icon:"el-icon-plus",circle:"",plain:""})])),_:1})])),_:1},8,["model"])])}}});J.__scopeId="data-v-5bee36e1";var G=t({setup:t=>(t,n)=>{const a=e("el-alert");return i(),s(h,null,[c(a,{title:"Mobi is not fully supported",type:"warning",description:"Potential problems: Index/TOC in chaos; Text encoded wrong; Image not inserted...","show-icon":"",closable:!1}),c(a,{title:"未能完全支持 Mobi 格式",type:"warning",description:"潜在问题: 目录错乱；文字编码错误；图片插入失败……","show-icon":"",closable:!1}),c(a,{title:"Mobi is edited in a single html",type:"info",description:"File will be saved as mobi(6th version), without the KF8 parts","show-icon":"",closable:!1}),c(a,{title:"您将在单一 HTML 文件中编辑 Mobi 文本",type:"info",description:"保存格式为 6 代 Mobi 文件, 不包括 KF8 部分","show-icon":"",closable:!1})],64)}});G.__scopeId="data-v-4c9828c2";const Q=d("data-v-674a2a26");var W=t({props:{text:{type:String,required:!0}},emits:["update:text","addImage"],setup(t,{emit:n}){const a=t;let r;f((t=>({"3f73852c":d.value})));const u=o();l((()=>{var t;t=a.text,r&&r.destroy(),r=new g(u.value),r.config.menus=["head","bold","italic","underline","strikeThrough","quote","list","splitLine","indent","justify","image","undo","redo"],r.config.lang="en",r.i18next=p,r.config.showFullScreen=!1,r.config.showMenuTooltips=!1,r.config.placeholder="",r.config.zIndex=50,r.config.showLinkImg=!1,r.config.uploadImgMaxLength=1,r.config.customUploadImg=async(t,e)=>{const i=t[0],s=URL.createObjectURL(i);e(s),n("addImage",i,s)},r.create(),r.txt.html(t),r.config.zIndex=1,r.config.onchange=()=>{n("update:text",r.txt.html())},setTimeout((()=>{r.history.observe()}),100)}));const d=o(1);function m(){d.value+=.1}function y(){d.value>=.5&&(d.value-=.1)}return(t,n)=>{const a=e("el-button"),o=e("el-button-group");return i(),s(h,null,[c("div",{id:"we",ref:u},null,512),c(o,{id:"zoom"},{default:Q((()=>[c(a,{round:"",icon:"el-icon-zoom-out",size:"medium",onClick:y}),c(a,{round:"",icon:"el-icon-zoom-in",size:"medium",onClick:m})])),_:1})],64)}}});W.__scopeId="data-v-674a2a26";const Y=d("data-v-b8fbd472");m("data-v-b8fbd472");const tt={id:"container"},et={class:"aside-box",id:"input"},it={class:"aside-box",id:"buttons"},st=E("New"),nt=E("Save"),at={key:0,class:"aside-box"},ot=c("i",{class:"el-icon-document"},null,-1),lt=c("span",null," Text / XHTML",-1),rt=c("i",{class:"el-icon-brush"},null,-1),ct=c("span",null," Stylesheet / CSS",-1),ht=c("i",{class:"el-icon-more-outline"},null,-1),ut=c("span",null," Others",-1),dt=E("Metadata");y();var ft=t({setup(t){f((t=>({a75af172:V.value}))),l((async()=>{const t=await(await fetch("./demo.epub")).blob();B(new File([t],"demo.epub"))}));const n=o("");async function a(t,e){if("epub"===I.type){const i=await m.addImage(t);S.set(i,e)}}const r=o();function d(){r.value.click()}function g(t){const e=t.target;if(null===e.files||0===e.files.length)return;const i=e.files[0];"application/epub+zip"===i.type?B(i):async function(t){p=new z(await t.arrayBuffer()),console.log(p),I.type="mobi",I.name=t.name,I.files=[],I.textFileList=[],I.styleFileList=[],I.editedFilePath=t.name,I.editedFileType="text",S.setUrls(p.imageBlobs),p.updateImageSrc(S.urlMap),n.value=p.getText(),$("",".w-e-text ")}(i)}let p,m;const y=o({}),P=o(!0),S=new q,I=b({name:"",type:"epub",files:[],textFileList:[],styleFileList:[],editedFilePath:"",editedFileType:"text"});async function B(t){try{P.value=!0,m=new A(t),await m.load(),S.setUrls(m.imageBlobs),y.value=await m.getNavFlat(),I.name=t.name,I.type="epub",I.textFileList=m.textFileList,I.styleFileList=m.styleFileList,I.editedFilePath="",await R(I.textFileList[0])}catch(e){console.error(e),x.error("加载失败")}finally{setTimeout((()=>{P.value=!1}),200)}}async function R(t){""!==I.editedFilePath&&await N(),await m.updateImageSrc(t,S.urlMap);const e=await m.getTextBody(t);n.value=e,I.editedFilePath=t,I.editedFileType="text",await async function(t){const e=await m.getCssListOfTextFile(t);let i="";for(let s of e)i+=await m.getCssText(s)+"\n";i+=await m.getInternalStyle(t),$(i,".w-e-text ")}(t)}const H=o("");const C=o({});function D(){C.value=m.getMetadata(),I.editedFileType="metadata"}async function N(){const t=I.editedFilePath;if(""===t)return;const e=I.editedFileType;if("text"===e){const e=n.value;await m.saveTextFile(t,e,S.pathMap)}else"style"===e?m.saveStyleFile(t,H.value):"metadata"===e&&m.saveMetadata(C.value)}const _=o(!1);async function O(){if("mobi"===I.type){if(void 0===p)return;const t=n.value;p.setText(t),k.exports.saveAs(p.saveFile(),"test.mobi")}else{if(void 0===m)return;_.value=!0,await N();const t=await m.getBlob();k.exports.saveAs(t,I.name),_.value=!1}}const V=o("translateX(-100%)");function j(){"translateX(-100%)"===V.value?V.value="translateX(0)":V.value="translateX(-100%)"}return(t,o)=>{const l=e("el-button"),f=e("el-input"),p=e("el-menu-item"),b=e("el-menu-item-group"),x=e("el-menu"),k=e("el-scrollbar"),S=v("loading");return i(),s(h,null,[w(c("section",tt,[c("aside",null,[c("div",et,[c(f,{placeholder:"请打开文件",modelValue:U(I).name,"onUpdate:modelValue":o[1]||(o[1]=t=>U(I).name=t)},{append:Y((()=>[c(l,{icon:"el-icon-folder-opened",onClick:d})])),_:1},8,["modelValue"])]),c("div",it,[c(l,{disabled:"",round:"",size:"medium",icon:"el-icon-circle-plus-outline"},{default:Y((()=>[st])),_:1}),c(l,{round:"",plain:"",size:"medium",type:"primary",onClick:O,loading:_.value,icon:"el-icon-folder-checked"},{default:Y((()=>[nt])),_:1},8,["loading"])]),"mobi"===U(I).type?(i(),s("div",at,[c(G)])):L("",!0),"epub"===U(I).type?(i(),s(k,{key:1,class:"aside-box",id:"menu",always:!0},{default:Y((()=>[c(x,{"default-active":"1-0",key:U(I).name},{default:Y((()=>[c(b,null,{title:Y((()=>[ot,lt])),default:Y((()=>[(i(!0),s(h,null,u(U(I).textFileList,((t,e)=>(i(),s(p,{key:e,index:`1-${e}`,onClick:e=>R(t)},{default:Y((()=>[E(M(y.value[t]||t.split("/").pop()),1)])),_:2},1032,["index","onClick"])))),128))])),_:1}),c(b,null,{title:Y((()=>[rt,ct])),default:Y((()=>[(i(!0),s(h,null,u(U(I).styleFileList,((t,e)=>(i(),s(p,{key:e,index:`2-${e}`,onClick:e=>async function(t){await N(),H.value=await m.getCssText(t),I.editedFilePath=t,I.editedFileType="style"}(t)},{default:Y((()=>[E(M(t.split("/").pop()),1)])),_:2},1032,["index","onClick"])))),128))])),_:1}),c(b,null,{title:Y((()=>[ht,ut])),default:Y((()=>[c(p,{onClick:D,index:"3"},{default:Y((()=>[dt])),_:1})])),_:1})])),_:1})])),_:1})):L("",!0)]),c("main",null,[(i(),s(T,null,["text"===U(I).editedFileType?(i(),s(W,{text:n.value,"onUpdate:text":o[2]||(o[2]=t=>n.value=t),onAddImage:a,key:U(I).editedFilePath},null,8,["text"])):L("",!0)],1024)),"style"===U(I).editedFileType?(i(),s(K,{text:H.value,"onUpdate:text":o[3]||(o[3]=t=>H.value=t),key:U(I).editedFilePath},null,8,["text"])):L("",!0),"metadata"===U(I).editedFileType?(i(),s(J,{key:1,data:C.value},null,8,["data"])):L("",!0)])],512),[[S,P.value]]),w(c("input",{type:"file",ref:r,accept:".epub, .mobi",onChange:g},null,544),[[F,!1]]),c(l,{class:"aside-button",onClick:j,circle:"",icon:"el-icon-menu",type:"primary"})],64)}}});ft.__scopeId="data-v-b8fbd472";var gt=t({setup:t=>(t,e)=>null});gt.__scopeId="data-v-6695d3a9";const pt=[{path:"/editor",component:ft},{path:"/test",component:gt},{path:"/",redirect:"/editor"}],mt=P({history:S("/BookScript/"),routes:pt});const yt=I(R);yt.use(mt).use(B).mount("#app"),yt.config.performance=!0;