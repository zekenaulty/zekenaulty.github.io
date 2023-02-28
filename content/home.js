import { DOM } from '../core/dom.js';

class Home extends HTMLElement {

  constructor(){
    super();
    
  }
  
  connectedCallback() {
    let vm = this;
    
    DOM.p(`hi, I'm Zeke Naulty, welcome (hello world!)`, vm, 'h2');
    
    
    DOM.p(`
      I've been working on computers and 
      writing code since ~1996 (${new Date().getFullYear() - 1996} years).
      In that time I've done a lot of things both professionally 
      and as a hobby 🤔 let's list a few ❔️
    `, vm);
    
    DOM.ulist(vm, [
      `just wrote a DOM method to make a <ul />`,
      `wrote bots to play games for me`,
      `written software for law enforcement, military, farmers, scientest, restraunts, and stores of all kinds`,
      `been infamous on several old forums 🤗`,
      `written millions of lines of VB code, javascript, c#, and a few other languages I pretend to not know`,
      `written code to write code, that writes code 😆`,
      `read literally 1000+ programming books`,
      `once, someone even said to me "Let me shake those millon dollar hands" among other hype`,
      `once I even dated a German, hacker, gamer girl, and we had lots of fun`,
      `In 1999 I got free MSDN by registering my product code 111-111111`,
      ]);
    
    
    DOM.p(`
      It seems like that list leaned more towards hobby... what can I say, I love this stuff
    `, vm);
    
    
    DOM.p(`
      This site is here because I wanted to play 
      with building web components, shadow DOM, and 
      aparently a component router. It is also 
      here to provide some insight into my mixed 
      bag of web skills. I've never gotten to do 
      the kind of deep web dev I've wanted, and every
      now and then, I like to jump in the sandbox, but 
      I didn't feel like using any frameworks.
      Don't look directly at the bootstrap 🙉🙈🙊
    `, vm);
    
    
    DOM.p(`
      Anyway, as you can tell, this isn't a super 
      serious project, but for me it has value.
    `, vm);
    
    
    DOM.p(`
      If we deliver value, we've done our jobs. May the force be with you.
    `, vm);
    
    DOM.p(`
      This site is has security holes in the code! Not for reuse!
    `, vm);
    
    /*
    DOM.p(`
      
    `, vm);
    */
    
    /*
    DOM.p($li.sentence(1, 3),vm, 'h3');
    for(let i = 0; i < 199; i++) {
      if(i % 3 == 0) {
        DOM.p($li.sentence(1, 3), vm, 'h3');
      }
      DOM.p($li.paragraph(), vm);
    }
    */
  }
}

$router.add({
  route: '/',
  tag: 'home-view',
  title: 'ZN',
  resolve: () => {}
});

customElements.define('home-view', Home);
