import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';

class Home extends HTMLElement {
  #shadows;
  constructor(){
    super();
    
    let vm = this;
    
    vm.#shadows = new Shadows(vm);
    
    DOM.p('welcome 😁', vm._shadow, 'h4');
    
    DOM.p(`This site is a work in progress, I am building it to brush up on my javascript, html, and css skills. I'm also developing it completly on my phone to help build skills for editing code on go 😆. Below you'll see some latin generated for filler and testing.`, vm._shadow);
    
    DOM.p($li.sentence(1, 3),vm._shadow, 'h4');
    for(let i = 0; i < 199; i++) {
      if(i % 3 == 0) {
        DOM.p($li.sentence(1, 3), vm._shadow, 'h4');
      }
      DOM.p($li.paragraph(), vm._shadow);
    }
  }
}

$router.add({
  route: '/',
  tag: 'home-view'
});

customElements.define('home-view', Home);
