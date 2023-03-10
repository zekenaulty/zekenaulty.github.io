import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';

class About extends HTMLElement {
  #shadows;
  constructor(){
    super();
    
    let vm = this;
    
    vm.#shadows = new Shadows(vm);
    
    DOM.p('about this site', vm._shadow, 'h3');
  }
}

$router.add({
  route: '/about',
  tag: 'about-view',
  title: 'ZN - about',
  resolve: () => {}
});

customElements.define('about-view', About);
