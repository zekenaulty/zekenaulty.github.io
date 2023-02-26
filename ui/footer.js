import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';

class Footer extends HTMLElement {
  #shadows;
  constructor(){
    super();
    
    let vm = this;
    
    vm.#shadows = new Shadows(vm);
    
  }
}


customElements.define('footer-nav', Footer);
