import { DOM } from '../core/dom.js';

class Resume extends HTMLElement {

  constructor(){
    super();
    
    let vm = this;
    
    DOM.p('my resume', vm._shadow, 'h2');
  }
}

$router.add({
  route: '/resume',
  tag: 'reaume-view',
  title: 'ZN - resume',
  resolve: () => {}
});

customElements.define('resume-view', Resume);

