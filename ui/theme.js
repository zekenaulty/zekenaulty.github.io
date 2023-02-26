import { DOM } from '../core/dom.js';

class Theme extends EventTarget {
  #theme;

  constructor() {
    super();
    
    let vm = this;

    vm.#findTheme();
  }

  #findTheme() {
    let vm = this;
    vm.#theme = document.querySelector('#theme');
  }

  setTheme(theme) {
    let vm = this;
    vm.#theme.href = `./res/${theme}.css`;
    vm.dispatchEvent(
      new CustomEvent(
        'retheme',
        {
          detail: vm.#theme.href
        }));
  }

}

window.$theme = new Theme();
