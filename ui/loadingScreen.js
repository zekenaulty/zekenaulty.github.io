import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';

class LoadingScreen extends HTMLElement {
  #shadows;
  
  static #shadow;
  static #loaderBg;
  static #loaderText;
  static #text;
  static #open = false;

  constructor() {
    super();

    if (LoadingScreen.#shadow) {
      throw new Error('The loading screen element may only be defined once.')
    }

    let vm = this;
    
    vm.#shadows = new Shadows(vm);

    LoadingScreen.#shadow = vm._shadow;
    LoadingScreen.#build();
  }

  static get isOpen() {
    return LoadingScreen.#open;
  }

  static #build() {
    let vm = LoadingScreen;
    let target = vm.#shadow;
    let bg = vm.#loaderBg;
    let text = vm.#loaderText;

    if (!bg) {
      bg = DOM.div(target, [
        'bg-secondary',
        'position-fixed',
        'top-0',
        'left-0',
        'vw-100',
        'vh-100',
        'd-flex',
        'flex-row',
        'align-items-center',
        'justify-content-center',
        'd-none'
      ]);

      bg.style.zIndex = 5000;

      let spinner = DOM.div(bg, [
        'spinner-border',
        'text-info',
        ]);

      spinner.style.width = '11rem';
      spinner.style.height = '11rem';
      spinner.style.borderWidth = '6px';
      spinner.style.borderStyle = 'solid';

      vm.#loaderBg = bg;
    }

    if (!text) {
      text = DOM.div(target, [
        'text-light',
        'position-fixed',
        'top-0',
        'left-0',
        'vw-100',
        'vh-100',
        'd-flex',
        'flex-row',
        'align-items-center',
        'justify-content-center',
        'd-none'
      ]);

      text.style.zIndex = 5001;
      vm.#text = DOM.div(text, [
        'fw-bold',
        'animate__animated',
        'animate__pulse',
        'animate__infinite'
        ]);

      vm.#text.innerText = 'loading';
      vm.#loaderText = text;
    }
  }

  static open(msg = 'loading') {
    let vm = LoadingScreen;

    if (vm.#open) {
      vm.#text.innerText = msg;
      return true;
    }

    vm.#open = true;

    vm.#text.innerText = msg;
    vm.#loaderText.classList.remove('d-none');
    vm.#loaderBg.classList.remove('d-none');

    DOM.body.classList.add('loading-screen-open');

    return true;
  }

  static close(delay = 0) {
    let vm = LoadingScreen;

    if (!vm.#open) {
      return false;
    }

    setTimeout(() => {
      vm.#loaderBg.classList.add('d-none');
      vm.#loaderText.classList.add('d-none');

      DOM.body.classList.remove('loading-screen-open');

      vm.#open = false;
    }, delay);

    return true;
  }

}

window.$loadingScreen = LoadingScreen;
customElements.define('loading-screen', LoadingScreen);
