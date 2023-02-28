import { DOM } from '../core/dom.js';

class Footer extends HTMLElement {
  constructor(){
    super();
    
  }
  
  connectedCallback() {
    let vm = this;
    vm.style.display = 'block';
    
    let nav = DOM.nav(vm, [
      'navbar',
      'navbar-expand-md',
      'navbar-dark', 
      'bg-dark'
      ]);

    let root = DOM.div(nav, [
      'container-fluid'
      ]);
    
    let linkedIn = DOM.a('',root, ['mr-1']);
    linkedIn.href = 'https://www.linkedin.com/mwlite/in/zekenaulty';
    linkedIn.target = 'blank';
    
    DOM.element('i', linkedIn, ['fab', 'fa-linkedin']);
    
    let github = DOM.a('',root, ['mr-1']);
    github.href = 'https://www.github.com/zekenaulty';
    github.target = 'blank';
    
    DOM.element('i', github, ['fab', 'fa-github']);
    
  }
}


customElements.define('footer-nav', Footer);
