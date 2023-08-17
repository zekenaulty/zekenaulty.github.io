import { DOM } from '../core/dom.js';

class Resume extends HTMLElement {

  constructor() {
    super();


  }

  connectedCallback() {
    let vm = this;

    DOM.p('my resume', vm, 'h2');

    let resumeUrl = vm.getAttribute('data-resume');

    if (resumeUel) {
      fetch(resumeUrl)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          vm.#addResume(data);
        });
    }
  }
  
  #addResume(data) {
    
  }
}

$router.add({
  route: '/resume',
  tag: 'reaume-view',
  title: 'ZN - resume',
  resolve: () => {}
});

customElements.define('resume-view', Resume);