var S=Object.defineProperty;var j=(a,e,t)=>e in a?S(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var m=(a,e,t)=>j(a,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const d=class d{static switchTheme(e="darkly"){const t=`https://cdn.jsdelivr.net/npm/bootswatch@v5.3.3/dist/${e}/bootstrap.min.css`;d.currentThemeLink?d.currentThemeLink.href=t:d.currentThemeLink=d.stylesheet(t,"bootswatch-theme")}static stylesheet(e,t){let i=document.getElementById(t);return i?i.href=e:(i=document.createElement("link"),i.id=t,i.rel="stylesheet",i.href=e,d.head.appendChild(i)),i}static get head(){return document.head}static get body(){return document.body}static element(e,t={}){const{parent:i,classes:s,text:r,html:n,attributes:I,events:C,children:M,styles:k}=t,h=document.createElement(e);return e=e.toLowerCase(),r&&(h.textContent=r),n&&(h.innerHTML=n),s&&d.addClasses(h,s),I&&d.addAttributes(h,I),C&&d.addEvents(h,C),k&&Object.assign(h.style,k),M&&e!=="select"?M.forEach(y=>{d.append(y,h)}):e==="select"&&t.options&&t.options.forEach((y,O)=>{const v=document.createElement("option");Object.assign(v,y),v.id=O,h.add(v)}),i&&d.append(h,i),h}static addAttributes(e,t){Object.keys(t).forEach(i=>{e.setAttribute(i,t[i])})}static addEvents(e,t){Object.keys(t).forEach(i=>{e.addEventListener(i,t[i])})}static addClasses(e,t){Array.isArray(t)?e.classList.add(...t):t&&e.classList.add(t)}static append(e,t){t?t.appendChild(e):d.body.appendChild(e)}static remove(e){e&&e.parentNode&&e.parentNode.removeChild(e)}static changeBgColorOpacity(e,t){const i=window.getComputedStyle(e).backgroundColor,s=i.match(/^rgba?\((\d+), (\d+), (\d+),? (\d?\.\d+)?\)$/);if(!s){console.error("Invalid background color format:",i);return}const r=`rgba(${s[1]}, ${s[2]}, ${s[3]}, ${t})`;e.style.backgroundColor=r}};m(d,"currentThemeLink",null);let l=d;class o extends EventTarget{constructor(e={}){const{tag:t="div",parent:i=void 0}=e;super(),this.config=e,this.tag=t,i&&(this.parent=i),this.e=l.element(t,e),this.DOM=l,this.mounted=!1,this.parent&&(this.mounted=!0)}static defaultOptions(){return{tag:"div",classes:[],events:{},styles:{},attributes:{}}}static initOptions(e={},t={}){return o.mergeOptions(o.defaultOptions(),e,t)}static mergeOptions(e={},t={},i={}){const s={...e,...t,...i};return s.styles={...e.styles||{},...t.styles||{},...i.styles||{}},s.attributes={...e.attributes||{},...t.attributes||{},...i.attributes||{}},s.events={...e.events||{},...t.events||{},...i.events||{}},s.classes=[...e.classes||[],...t.classes||[],...i.classes||[]],s}mount(e){return this.mounted&&this.unmount(),e&&(this.parent=e),this.parent?(l.append(this.e,this.e.parent),this.mounted=!0):(console.error(`Component.mount: ${typeof this}, failed to mount => no parent.`),this.mounted=!1),this.mounted}unmount(){l.remove(this.e),this.mounted=!1}show(e="d-block"){this.e.classList.remove("d-none","fade"),this.e.classList.add(e,"show")}loading(e="d-block"){this.e.classList.remove(e,"show"),this.e.classList.add("d-none")}toggle(e="d-block"){this.e.classList.contains("d-none")?this.show(e):this.loading(e)}fade(e="d-block",t=300){this.e.classList.contains("d-none")?(this.e.classList.remove("d-none"),this.e.classList.add(e,"show"),setTimeout(()=>{this.e.classList.add("fade")},10)):(this.e.classList.remove("fade"),setTimeout(()=>{this.e.classList.remove(e,"show"),this.e.classList.add("d-none")},t))}setText(e){this.e.textContent=e}setHTML(e){this.e.innerHTML=e}addClass(e){this.e.classList.add(...e.split(" "))}removeClass(e){this.e.classList.remove(...e.split(" "))}toggleClass(e){this.e.classList.toggle(e)}setAttribute(e,t){this.e.setAttribute(e,t)}removeAttribute(e){this.e.removeAttribute(e)}on(e,t){this.e.addEventListener(e,t)}off(e,t){this.e.removeEventListener(e,t)}trigger(e){const t=new Event(e);this.e.dispatchEvent(t)}updateAttributes(e){Object.entries(e).forEach(([t,i])=>{this.e.setAttribute(t,i)})}addChildren(e){e&&e.forEach(t=>{this.addChild(t)})}addChild(e){if(e instanceof o)this.e.appendChild(e.e),this.children.push(e);else if(e instanceof HTMLElement)this.e.appendChild(e);else throw new Error("Child must be a Component or HTMLElement")}removeChild(e){if(e instanceof o)this.e.removeChild(e.e),this.children=this.children.filter(t=>t!==e);else if(e instanceof HTMLElement)this.e.removeChild(e);else throw new Error("Child must be a Component or HTMLElement")}enable(){this.e.removeAttribute("disabled")}disable(){this.e.setAttribute("disabled",!0)}updateStyles(e){Object.assign(this.e.style,e)}popover(e){new bootstrap.Popover(this.e,e)}tooltip(e){new bootstrap.Tooltip(this.e,e)}collapseToggle(){bootstrap.Collapse.getOrCreateInstance(this.e).toggle()}scrollTo(e="smooth"){this.e.scrollIntoView({behavior:e})}}const g=class g extends o{constructor(e={}){const t=o.initOptions(e,{tag:"select",classes:["form-select","w-auto",...e.classes||[]],options:[...g.themes],events:{change:i=>{l.switchTheme(i.target.value||"darkly")}},attributes:{id:"theme-selector-internal-0000"}});super(t),this.default=t.default?t.default:"darkly",this.e.value=this.default,l.switchTheme(this.e.value)}};m(g,"themes",[{id:1,value:"cosmo",text:"Cosmo"},{id:2,value:"cyborg",text:"Cyborg"},{id:3,value:"darkly",text:"Darkly"},{id:4,value:"flatly",text:"Flatly"},{id:5,value:"lumen",text:"Lumen"},{id:6,value:"lux",text:"Lux"},{id:7,value:"materia",text:"Materia"},{id:8,value:"minty",text:"Minty"},{id:9,value:"pulse",text:"Pulse"},{id:10,value:"sandstone",text:"Sandstone"},{id:11,value:"simplex",text:"Simplex"},{id:12,value:"slate",text:"Slate"},{id:13,value:"spacelab",text:"Spacelab"},{id:14,value:"superhero",text:"Superhero"},{id:15,value:"united",text:"United"},{id:16,value:"yeti",text:"Yeti"}]);let w=g;class H extends o{constructor(e={}){const t=o.initOptions(e,{tag:"button",classes:["btn","btn-primary","text-center"]});super(t),this.build()}build(e){this.config=e,this.menuIcon=this.DOM.element("i",{parent:this.e,classes:["bi","bi-list"],id:"menuIcon-internal-0000"}),this.closeIcon=this.DOM.element("i",{parent:this.e,classes:["bi","bi-x-lg"],id:"closeIcon-internal-0000"}),this.menuIcon.style.display="block",this.closeIcon.style.display="none",this.e.addEventListener("click",()=>{this.menuIcon.style.display!=="none"?(this.menuIcon.style.display="none",this.closeIcon.style.display="block"):(this.menuIcon.style.display="block",this.closeIcon.style.display="none")})}}class P extends o{constructor(e={}){const t=e.id?e.id:"offcanvas-internal-"+(Math.floor(Math.random()*999999)+100),i=o.initOptions(e,{tag:"nav",classes:["offcanvas",(s=>`offcanvas-${s}`)(e.position||"start")],attributes:{id:t,"data-bs-scroll":!0,"data-bs-backdrop":!1,"aria-labelledby":`${t}Label`}});super(i),this.build()}build(){this.header=this.DOM.element("header",{parent:this.e,classes:["offcanvas-header",...this.config.headerClasses||[]]}),this.config.headerStyles&&Object.assign(this.header.style,this.config.headerStyles),this.DOM.element("span",{parent:this.header,id:`${this.config.id}Label`,classes:["offcanvas-title","h5"],attributes:{id:`${this.config.id}Label`},text:this.config.header}),this.closeButton=this.config.close?this.DOM.element("button",{parent:this.header,classes:["btn-close","text-reset"],attributes:{type:"button"}}):{},this.closeButton.attributes&&(this.closeButton.attributes["data-bs-dismiss"]="offcanvas",this.closeButton.attributes["aria-label"]="Close"),this.body=this.DOM.element("section",{parent:this.e,classes:["offcanvas-body",...this.config.bodyClasses||[]],text:this.config.bodyText||""}),this.config.headerStyles&&Object.assign(this.body.style,this.config.headerStyles)}addChild(e){if(e instanceof o)this.body.appendChild(e.e),this.children.push(e);else if(e instanceof HTMLElement)this.body.appendChild(e);else throw new Error("Child must be a Component or HTMLElement")}removeChild(e){if(e instanceof o)this.body.removeChild(e.e),this.children=this.children.filter(t=>t!==e);else if(e instanceof HTMLElement)this.body.removeChild(e);else throw new Error("Child must be a Component or HTMLElement")}}const R=["home","about","resume","projects"],z={home:{key:1,text:" Home ",href:"#home",name:"home",description:"",faIcon:"fas fa-house-return"},about:{key:2,text:" About ",href:"#about",name:"about",description:"",faIcon:""},resume:{key:3,text:" Resume ",href:"#resume",name:"resume",description:"",faIcon:""},projects:{key:4,text:" Projects ",href:"#projects",name:"projects",description:"",faIcon:""}},L={keys:R,sections:z};class B extends o{constructor(e={}){const t=(i=>{const s={...i};return s.tag="nav",s.classes=["position-fixed","d-flex","justify-content-end","align-items-start",...s.classes||[]],s.parent=s.parent?s.parent:l.body,s.events=s.events?s.events:{},s.styles=s.styles?s.styles:{"z-index":1046},s.attributes=s.attributes?s.attributes:{},s.styles.top="1vh",s.styles.right="1vh",s.styles.width="98vw",s})(e);super(t),this.build(t)}build(e){this.config=e,this.header=this.buildHeader(e),this.themeSwitcher=this.buildThemeSwitcher(e),this.toggleButton=this.buildToggleButton(e),this.offCanvas=this.buildOffCanvas(e)}buildHeader(e){return this.DOM.element("span",{parent:this.e,classes:["h4","me-auto","mt-auto"],text:"ZN: Code Monkey"})}buildToggleButton(e){return new H({parent:this.e,id:"sitenav",classes:["btn-primary"],styles:{"border-radius":"1em"},events:{},attributes:{id:"sitenavToggle","data-bs-toggle":"offcanvas","data-bs-target":"#sitenav","aria-controls":"sitenav"}})}buildThemeSwitcher(e){return new w({parent:this.e,classes:["me-1"],styles:{display:"none"},events:{},default:e.theme?e.theme:"mint"})}buildOffCanvas(e){const t=new P({parent:this.DOM.body,position:"end",id:"sitenav",classes:[],bodyClasses:[],headerClasses:[],attributes:{id:"sitenav"},styles:{width:"142px"},close:!1,header:" "}),i=this.DOM.element("nav",{parent:t.body,classes:[],attributes:{},styles:{"border-radius":"1em"}}),s=this.DOM.element("ul",{parent:i,classes:["nav","flex-column"],attributes:{id:"nav-menu"}});return this.navMenu=s,this.sections=L.sections,this.keys=L.keys,this.keys.map(r=>{const n=this.DOM.element("li",{parent:s,classes:["nav-item"],attributes:{}});this.DOM.element("a",{parent:n,classes:["nav-link"],attributes:{href:this.sections[r].href,id:this.sections[r].id+"-link",name:this.sections[r].name},text:this.sections[r].text})}),t}}class c extends o{constructor(e={}){const t=o.initOptions(e,{tag:"article",classes:["card"]});super(t),this.build()}build(){this.config.header&&(this.header=this.DOM.element("header",{parent:this.e,classes:["card-header"],text:this.config.header})),this.body=this.DOM.element("section",{parent:this.e,classes:["card-body"],text:this.config.bodyText||"",html:this.config.bodyHTML||""})}addChild(e){if(e instanceof o)this.body.appendChild(e.e),this.children.push(e);else if(e instanceof HTMLElement)this.body.appendChild(e);else throw new Error("Child must be a Component or HTMLElement")}removeChild(e){if(e instanceof o)this.body.removeChild(e.e),this.children=this.children.filter(t=>t!==e);else if(e instanceof HTMLElement)this.body.removeChild(e);else throw new Error("Child must be a Component or HTMLElement")}}class ${constructor(e,t,i,s){this.x=e,this.y=t,this.emoji=i,this.enableSwirl=s,this.swirlDirection=Math.random()>.5?1:-1,this.swirlSpeed=Math.random()*.2+.1,this.color="#"+Math.floor(Math.random()*16777215).toString(16),this.angle=Math.random()*Math.PI*360,this.radius=Math.random()*21+-11,this.scale=1,this.scaleDirection=1,this.scaleSpeed=.005}draw(e){e.save(),e.translate(this.x,this.y),e.rotate(this.angle),e.font=`${this.scale.toFixed(2)}em monospace`,e.textAlign="center",e.textBaseline="middle",e.fillStyle=this.color,e.fillText(this.emoji,0,0),e.restore()}update(){this.y+=Math.random()*2+.25,this.enableSwirl?(this.angle+=this.swirlSpeed*this.swirlDirection,this.x+=Math.cos(this.angle)*this.radius,this.y+=Math.sin(this.angle)*this.radius/2):this.x-=Math.random()*.7+.1,this.scale+=this.scaleSpeed*this.scaleDirection,(this.scale>1.5||this.scale<1)&&(this.scaleDirection*=-1),this.angle+=.05}isOffScreen(e){return this.y>e+20}}const p=class p{constructor(){if(p.instance)return p.instance;p.instance=this,this.emojis=["✧₊⁺","♡","❀","⟢","𖤓","๋࣭ ⭑⚝"]}getRandomEmoji(){const e=Math.floor(Math.random()*this.emojis.length);return this.emojis[e]}getRandomEmojis(e){const t=[];for(let i=0;i<e;i++)t.push(this.getRandomEmoji());return t}};m(p,"instance");let x=p;class W extends o{constructor(e){const t=(r=>{const n={...r};return n.tag="canvas",n.classes=["position-fixed",...n.classes||[]],n.styles=n.styles?n.styles:{},n.styles.top="0px",n.styles.left="0px",n.styles.zIndex="-1",n})(e);super(t),this.emojis=new x,this.ctx=this.e.getContext("2d"),this.rainDrops=[],this.emoji=e.emoji?e.emoji:this.emojis.getRandomEmoji(),this.enableSwirlToggle=e.swirl?e.swirl:Math.random()>.5,this.maxDrops=375;const i=()=>{this.e.width=window.innerWidth,this.e.height=window.innerHeight};i();const s=this;Array.from({length:155},()=>{setTimeout(()=>{s.createRainDrop(!0),s.updateRainDrops()},5)}),this.animate(),window.addEventListener("resize",i)}createRainDrop(e=!1){if(this.rainDrops.length>=this.maxDrops)return;const t=Math.floor(Math.random()*(this.e.width+300)),i=e?Math.floor(Math.random()*(this.e.height-40)):-20;this.enableSwirlToggle&&Math.random()>.5,this.rainDrops.push(new $(t,i,this.emojis.getRandomEmoji(),!0))}updateRainDrops(){for(let e=this.rainDrops.length-1;e>=0;e--){let t=this.rainDrops[e];t.update(),t.isOffScreen(this.e.height)&&(this.rainDrops.splice(e,1),this.createRainDrop(),t=void 0)}}drawRainDrops(){this.ctx.clearRect(0,0,this.e.width,this.e.height);for(const e of this.rainDrops)e.draw(this.ctx)}animate(e=void 0){const t=e||this;setTimeout(()=>{(i=>{i.updateRainDrops(),i.drawRainDrops(),Math.random()>.7&&i.createRainDrop();const s=i.animate;setTimeout(()=>window.requestAnimationFrame(()=>s(i)),1)})(t)},1)}}class F{constructor(e,t){this.elapsed=0,this.scale=11,this.speed=Math.random()*24+3,this.maxTrail=Math.floor(Math.random()*44+57),this.trail=[],this.text=this.randomChar(),this.textElapsed=0,this.textElapsedCheck=Math.random()*91+20,this.x=e,this.y=t;for(let i=0;i<this.maxTrail;i++)this.trail[i]={text:this.randomChar(),textElapsedCheck:Math.random()*55+20,textElapsed:0}}randomChar(){let e=Math.round(Math.random()*499+197);return String.fromCharCode(e)}draw(e){this.textElapsed++,this.textElapsed>=this.textElapsedCheck&&(this.text=this.randomChar());let t=100,i;e.font="1.2em monospace",e.textAlign="center",e.textBaseline="middle";for(let s=0;s<this.trail.length;s++){e.fillStyle="rgba(34,139,34,"+t.toString()+")",this.trail[s].textElapsed++,this.trail[s].textElapsed>this.trail[s].textElapsedCheck&&(this.trail[s].text=this.randomChar());let r=this.trail[s].text,n=this.y-this.scale*s+this.scale/8;e.fillText(r,this.x,n),i=n}return this.y+=this.speed,e.fillStyle="#c6c6c6",e.fillText(this.text,this.x,this.y),i-20>e.canvas.height}}class q extends o{constructor(e){const t=(r=>{const n={...r};return n.tag="canvas",n.classes=["position-fixed",...n.classes||[]],n.styles=n.styles?n.styles:{},n.styles.top="0px",n.styles.left="0px",n.styles.zIndex="-2",n})(e);super(t),this.ctx=this.e.getContext("2d"),this.characters=[],this.maxCharacters=31;const i=()=>{this.e.width=window.innerWidth,this.e.height=window.innerHeight};i();const s=this;Array.from({length:13},()=>{setTimeout(()=>{s.createCharacter(!0),s.drawCharacters()},5)}),this.animate(),window.addEventListener("resize",i)}createCharacter(e=!1){if(this.characters.length>=this.maxCharacters)return;const t=Math.floor(Math.random()*(this.e.width+20)),i=e?Math.floor(Math.random()*(this.e.height-40)):-20;this.characters.push(new F(t,i))}drawCharacters(){this.ctx.clearRect(0,0,this.e.width,this.e.height);for(let e=0;e<this.characters.length;e++)this.characters[e].draw(this.ctx)&&(this.characters.splice(e,1),this.createCharacter())}animate(e=void 0){(i=>{i.drawCharacters();const s=i.animate;window.requestAnimationFrame(()=>s(i))})(e||this)}}class E extends o{constructor(e={}){const t=o.initOptions(e,{tag:"div",classes:[],attributes:{id:e.id===void 0||e.id===""?"image-loader-id-"+Math.random()+9999:e.id},styles:{overflow:"hidden","overflow-x":"hidden","overflow-y":"hidden"}});super(t),this.build()}build(){this.spinnerId=this.id+"-spinner",this.spinner=this.DOM.element("div",{parent:this.e,classes:["fade","show"],attributes:{role:"status"},html:'<div class="spinner-border"><span class="visually-hidden">Loading...</span></div>',styles:{"z-index":"1",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}}),this.imageId=this.id+"-img",this.image=this.DOM.element("img",{parent:this.e,classes:["fade"],attributes:{id:this.imageId,src:this.config.src,alt:"Image"},styles:{"z-index":"0",top:"50%",left:"50%",transform:"translate(-50%, -50%)",position:"absolute","background-size":"auto"},events:{load:()=>{this.spinner.classList.remove("show"),this.image.classList.add("show")},error:()=>{console.error("Error loading image")}}}),this.config.aspectMode=="height"?this.image.classList.add("h-100"):this.config.aspectMode=="width"?this.image.classList.add("w-100"):this.config.aspectMode=="fit"&&(this.image.classList.add("h-100"),this.image.classList.add("w-100"))}loading(){this.spinner.classList.add("show"),this.image.classList.remove("show")}}class D extends o{constructor(e={}){const t=(i=>{const s={...i};return s.tag="section",s.classes=["d-block",...s.classes||[]],s.events=s.events?s.events:{},s.styles=s.styles?s.styles:{},s})(e);super(t),this.build(t)}build(e){this.config=e;const t=this.config.showHeader?["show"]:[];this.header=this.DOM.element("header",{parent:this.e,classes:["fade",...t],styles:{},attributes:{}}),this.navLink=this.DOM.element("a",{parent:this.header,attributes:{id:this.config.sectionId},text:this.config.header?this.config.header:""}),this.body=this.DOM.element("article",{parent:this.e,classes:[],text:this.config.bodyText||""})}addChild(e){if(e instanceof o)this.body.appendChild(e.e),this.children.push(e);else if(e instanceof HTMLElement)this.body.appendChild(e);else throw new Error("Child must be a Component or HTMLElement")}removeChild(e){if(e instanceof o)this.body.removeChild(e.e),this.children=this.children.filter(t=>t!==e);else if(e instanceof HTMLElement)this.body.removeChild(e);else throw new Error("Child must be a Component or HTMLElement")}}class T extends o{constructor(e={}){const t=o.initOptions(e,{tag:"div",classes:["animated-text"],text:e.text||"",font:e.font||"16pt monospace",duration:e.duration||550,factor:e.factor||25});super(t),this.text=this.config.text||"Test Message Please Ignore",this.build()}build(){this.e.innerHTML="",this.text.split("").forEach(e=>{this.DOM.element("span",{parent:this.e,text:e===" "?" ":e,styles:{opacity:0,transform:"scale(0) rotate(0deg)",display:"inline-block",font:this.config.font}})}),this.animateText()}animateText(){const e=this.e.querySelectorAll("span");anime.timeline({loop:!1}).add({targets:e,opacity:[-1,1],scale:[-1,1],rotate:[-360*4,0],duration:this.config.duration,easing:"easeOutExpo",delay:(t,i)=>this.config.factor*i})}updateText(e){this.text=e,this.build()}}class N extends o{constructor(e={}){const t=(i=>{const s={...i};return s.classes=[...s.classes||[]],s.events=s.events?s.events:{},s.styles=s.styles?s.styles:{},s.attributes=s.attributes?s.attributes:{},s.showHeader=!1,s.sectionId="home",s})(e);super(t),this.build()}build(){this.background=new E({parent:this.e,src:"/assets/backgrounds/new-bg-0010.png",styles:{width:"98vw",height:"90vh","z-index":"-1",position:"absolute",top:"0px",left:"0px"}}),this.section=new D({parent:this.e,id:"home-section",sectionId:"home",header:"home",styles:{width:"98vw",height:"90vh",position:"absolute",top:"0px",left:"0px"}}),this.center=this.DOM.element("div",{parent:this.section.body,classes:[],styles:{"z-index":"2",position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)"}}),setTimeout(()=>{this.text=new T({parent:this.center,text:"Zeke Naulty",font:"3.3em monospace"}),setTimeout(()=>{this.text=new T({parent:this.center,text:"Developer, Designer, Artist, Programmer",font:"0.8em monospace"})},100)},500)}}/*!
 * perfect-scrollbar v1.5.3
 * Copyright 2021 Hyunje Jun, MDBootstrap and Contributors
 * Licensed under MIT
 */var b=function(e){this.element=e,this.handlers={}},A={isEmpty:{configurable:!0}};b.prototype.bind=function(e,t){typeof this.handlers[e]>"u"&&(this.handlers[e]=[]),this.handlers[e].push(t),this.element.addEventListener(e,t,!1)};b.prototype.unbind=function(e,t){var i=this;this.handlers[e]=this.handlers[e].filter(function(s){return t&&s!==t?!0:(i.element.removeEventListener(e,s,!1),!1)})};b.prototype.unbindAll=function(){for(var e in this.handlers)this.unbind(e)};A.isEmpty.get=function(){var a=this;return Object.keys(this.handlers).every(function(e){return a.handlers[e].length===0})};Object.defineProperties(b.prototype,A);typeof document<"u"&&"WebkitAppearance"in document.documentElement.style,typeof window<"u"&&("ontouchstart"in window||"maxTouchPoints"in window.navigator&&window.navigator.maxTouchPoints>0||window.DocumentTouch&&document instanceof window.DocumentTouch),typeof navigator<"u"&&navigator.msMaxTouchPoints,typeof navigator<"u"&&/Chrome/i.test(navigator&&navigator.userAgent);class J extends o{constructor(e={}){const t=(i=>{const s={...i};return s.classes=[...s.classes||[]],s.events=s.events?s.events:{},s.styles=s.styles?s.styles:{},s.attributes=s.attributes?s.attributes:{},s.showHeader=!1,s.sectionId="about",s})(e);super(t),this.build()}build(){this.background=new E({parent:this.e,src:"/assets/backgrounds/new-bg-0008.png",styles:{width:"98vw",height:"90vh","z-index":"-1",position:"absolute",top:"0px",left:"0px"}}),this.section=new D({parent:this.e,id:"about-section",sectionId:"about",header:"about",styles:{width:"90vw",height:"90vh",position:"absolute",top:"0px",left:"1vw"}});const e={classes:["mt-1","me-4","ms-4","mb-3","bg-gradient","align-self-center"],styles:{"min-width":"320px","max-width":"960px"}};this.section.body.classList.add("d-flex"),this.section.body.classList.add("flex-wrap"),this.section.body.classList.add("justify-content-center"),this.section.body.style.position="relative",this.section.body.style["max-height"]="84vh",this.section.body.setAttribute("data-simplebar",""),new c({parent:this.section.body,...e,header:"My Career Journey",bodyHTML:`
      <p>My journey in software development began in the late 1990s, when I landed my first tech job at Litton Avondale Inc. Working on the cutting-edge LPD-17 project, I was tasked with writing 3D to 2D code transformations, deploying network applications, and building robust error-handling systems. This experience not only laid the foundation for my technical skills but also instilled in me a passion for innovation and collaboration.</p>
      <p>As I progressed in my career, I had the opportunity to work on a wide range of projects, from desktop development to web applications. I developed a strong foundation in programming languages, including C#, (link unavailable), and Java, and became proficient in various development frameworks and tools. My early experiences taught me the importance of adaptability, effective communication, and teamwork in a fast-paced environment.</p>
      <p>As I progressed in my career, I had the opportunity to work on a wide range of projects, from desktop development to web applications. I developed a strong foundation in programming languages, including C#, (link unavailable), and Java, and became proficient in various development frameworks and tools. My early experiences taught me the importance of adaptability, effective communication, and teamwork in a fast-paced environment.</p>
      `}),new c({parent:this.section.body,...e,header:"Early Development Experience",bodyHTML:`
        <p>My early development experience was marked by a series of challenging and rewarding projects. As an Engineering Application Developer at Litton Avondale Inc., I wrote 3D to 2D code transformations, managed network application deployment, and developed error reporting/logging databases and front-ends. One of my notable achievements was creating an Integrated Development Environment (IDE) for scripting 3D to 2D transformations. This experience not only deepened my understanding of software development but also instilled in me a passion for innovation and problem-solving.
        <p>At Hancock Whitney, I worked as a Programmer/Analyst I, where I was responsible for desktop development, accessing DB2 data sources, and implementing data applications with Argo Data. I designed reporting and data access front-ends, created data-driven ASP pages, and developed a strong foundation in database management. These experiences taught me the importance of attention to detail, data integrity, and effective data visualization.
        <p>Throughout these early experiences, I was fortunate to work with talented teams and mentors who guided me in my growth as a developer. I learned the value of collaboration, open communication, and continuous learning in delivering high-quality software solutions. These lessons have stayed with me throughout my career and continue to shape my approach to software development.
        <p>As a Design Consultant at Rainmaker Advertising & Design, I assisted in the design and implementation of IT systems, developed components and frontends using VB6, (link unavailable), ASP Classic, (link unavailable) Web Forms, Microsoft Access, Microsoft InterDev, and Microsoft SQL Server. This experience broadened my understanding of software development and taught me the importance of considering user experience and design principles in software development.
        `}),new c({parent:this.section.body,...e,header:"Expanding My Horizons",bodyHTML:`
        <p>As I progressed in my career, I had the opportunity to work on a wide range of projects and technologies. At Solid Earth Inc., I developed and maintained RETS client and server software powered by Oracle and C#. I also developed configurable (link unavailable) web applications for distinct MLS custom implementations and built a full statistics module with deep market analytics and reporting. This experience deepened my understanding of software development and instilled in me a passion for innovation and problem-solving.
        <p>As a Senior Software Developer at Rural Sourcing Inc., I provided mentoring, team management, and project management in relation to the Microsoft stack. I also performed recruiting and interviewing tasks, which helped me develop my leadership and communication skills. I worked with talented teams to deliver high-quality software solutions, and my experience in this role taught me the importance of effective collaboration, open communication, and continuous learning.
        <p>At PK Promotions, I developed web-based commodity production management systems, product evolution tracking systems, and sales/marketing systems. This experience broadened my understanding of software development and taught me the importance of considering user experience and design principles in software development. I also developed a strong foundation in web development, including HTML, CSS, JavaScript, and various frameworks and libraries.
        <p>Throughout these experiences, I continued to expand my skill set and knowledge of software development. I learned new programming languages, frameworks, and tools, and I developed a strong foundation in software engineering principles and best practices. I also learned the importance of staying up-to-date with industry trends and emerging technologies, and I continue to pursue ongoing learning and professional development in my career.
        `}),new c({parent:this.section.body,...e,header:"Leadership and Innovation",bodyHTML:`
        <p>As I continued to grow in my career, I had the opportunity to take on leadership roles and drive innovation in software development. At iAdvantage Software Inc., I served as a Lead Developer/Azure DevOps, where I empowered users with dynamic user-defined data models and custom reporting features. I worked with cutting-edge technologies, including WebForms/MVC/WebAPI, OData/SOAP APIs, and Angular/AngularJS. I also developed a strong foundation in cloud computing, including Azure and AWS.</p>
        <p>In this role, I led teams to deliver high-quality software solutions, and my experience taught me the importance of effective leadership, communication, and collaboration. I also developed a strong understanding of DevOps practices and tools, including continuous integration, continuous deployment, and continuous monitoring.</p>
        <p>At Storable, I worked as a Software Engineer II, where I developed and maintained .Net WinForms and web applications. I built backend services to support insurance auto-protect features using .Net Core, Hangfire, Postgres, SQL Server, and Entity Framework. I also established and taught patterns for unit testing in WinForms and contributed ideas and design concepts to several initiatives in the company's growing adoption of domain-driven design.</p>
        <p>Throughout these experiences, I continued to innovate and push the boundaries of software development. I learned new technologies, frameworks, and tools, and I developed a strong foundation in software architecture and design principles. I also learned the importance of staying adaptable and agile in a rapidly changing technology landscape.</p>
        `}),new c({parent:this.section.body,...e,header:"Passion Projects and Interests",bodyHTML:`
        <p>Outside of my professional work, I enjoy exploring various passion projects and interests that allow me to express my creativity and curiosity. I'm fascinated by the intersection of technology and art, and I've experimented with projects that blend logic and artistry.</p>
        <p>One of my current interests is AI integration and natural language processing. I've been exploring the possibilities of using machine learning and deep learning to create more intuitive and human-like interfaces. I've also been experimenting with 3D spatial reasoning and machine learning, and I'm excited about the potential applications of these technologies in fields such as robotics and computer vision.</p>
        <p>I'm also passionate about open-source communities and secure AI environments. I believe that open-source software has the power to drive innovation and collaboration, and I've contributed to several open-source projects in my free time. I'm also interested in exploring the possibilities of secure AI environments, where AI systems can be designed to be transparent, explainable, and fair.</p>
        <p>Throughout my career, I've found that pursuing passion projects and interests outside of work has helped me stay curious, motivated, and inspired. It's allowed me to explore new ideas, learn new skills, and connect with like-minded individuals who share my passions.</p>
        `}),new c({parent:this.section.body,...e,header:"Career Reflections and Future Directions",bodyHTML:`
        <p>As I reflect on my career journey, I'm proud of the progress I've made and the experiences I've had. I've had the opportunity to work on a wide range of projects, from desktop development to web applications, and I've developed a strong foundation in software engineering principles and best practices.</p>
        <p>Throughout my career, I've learned the importance of staying adaptable, curious, and open to new ideas. I've seen the technology landscape change rapidly, and I've had to adjust my skills and approach to stay ahead of the curve. I've also learned the value of collaboration, communication, and leadership in delivering high-quality software solutions.</p>
        <p>As I look to the future, I'm excited about the possibilities of emerging technologies such as AI, machine learning, and cloud computing. I believe that these technologies have the potential to drive significant innovation and transformation in industries such as healthcare, finance, and education.</p>
        <p>In the next chapter of my career, I'm looking to continue pushing the boundaries of software development and innovation. I'm interested in exploring new technologies, frameworks, and tools, and I'm excited about the opportunity to work with talented teams to deliver high-quality software solutions.</p>
        <p>Ultimately, my goal is to make a meaningful impact in the world through my work. I believe that software has the power to drive positive change, and I'm committed to using my skills and experience to make a difference.</p>
        `})}}const K={home:N,about:J},U={home:{classes:[],styles:{width:"98vw",height:"90vh",position:"relative"}},about:{classes:[],styles:{width:"98vw",height:"90vh",position:"relative"}}};new W({parent:l.body,styles:{opacity:"0.65"}});new q({parent:l.body,styles:{opacity:"0.60"}});const f=new B({parent:l.body,theme:"darkly",classes:["fade","d-none"]}),u=l.element("main",{parent:l.body,classes:["position-fixed","border-light","bg-secondary","fade","d-none"],styles:{"border-radius":"1em",top:"6.6vh",left:"1vw",width:"98vw",height:"90vh","z-index":"0",opacity:"0.75",position:"relative"},attributes:{"data-bs-spy":"spy","data-bs-target":f.navMenu.id,"data-bs-offset":"0","data-simplebar":""}});u.sections={};f.keys.map(a=>{const e=K[a],t=U[a]||{};e&&(u.sections[a]=new e({parent:u,...t}))});setTimeout(()=>{u.classList.add("show"),u.classList.remove("d-none"),setTimeout(()=>{f.e.classList.add("show"),f.e.classList.remove("d-none")},100)},500);