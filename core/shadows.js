import { DOM } from './dom.js';

/* 

  this is needed primarily to support 
  shadow dom theme changes...
  
  more helpers likely to follow

*/

export class Shadows {
  #theme;

  constructor(vm) {
    let r = this;
    
    vm._shadow = vm.attachShadow({ mode: 'open' });
    r.#addStyles(vm);
  }

  #addStyles(vm) {
    let r = this;
    let shadow = vm._shadow;
    let styles;

    r.#theme = DOM.stylesheet('./res/darkly.css');
    DOM.append(r.#theme, shadow);

    if ($theme) {
      $theme.addEventListener('retheme', (e) => {
        r.#changeTheme(e);
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
