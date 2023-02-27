import { DOM } from '../core/dom.js';

class Theme extends EventTarget {
  #theme;

  constructor() {
    super();
    
    let vm = this;

    vm.#findTheme();
    
    if($actions){
      $actions.add('set-theme', (t) => {
        vm.setTheme(t);
      });
    }
    
  }

  #findTheme() {
    let vm = this;
    vm.#theme = document.querySelector('#theme');
  }

  setTheme(theme) {
    let vm = this;
    $loadingScreen.open(`loading ${theme}`)
    vm.#theme.href = `./res/${theme}.css`;
    vm.dispatchEvent(
      new CustomEvent(
        'retheme',
        {
          detail: vm.#theme.href
        }));
    $loadingScreen.close(450);
  }

}

window.$theme = new Theme();
