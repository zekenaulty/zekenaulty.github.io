import { DOM } from './dom.js';

/* 

  this is needed primarily to support 
  shadow dom theme changes...
  
  more helpers likely to follow

*/

export class Component extends HTMLElement {
  _shadow;
  #theme;

  constructor() {
    super();

    let vm = this;
    vm._shadow = vm.attachShadow({ mode: 'open' });
    vm.#addStyles();
  }

  #addStyles() {
    let vm = this;
    let shadow = vm._shadow;
    let styles;

    vm.#theme = DOM.stylesheet('./res/darkly.css');
    DOM.append(vm.#theme, shadow);

    if ($theme) {
      $theme.addEventListener('retheme', (e) => {
        vm.#changeTheme(e);
      });
    }

    styles = DOM.stylesheet('./res/fa/all.min.css');
    DOM.append(styles, shadow);

    styles = DOM.stylesheet('./res/animate.css');
    DOM.append(styles, shadow);

    styles = DOM.stylesheet('./styles.css');
    DOM.append(styles, shadow);

  }

  #changeTheme(e) {
    let vm = this;
    vm.#theme.href = e.detail;
  }
}
