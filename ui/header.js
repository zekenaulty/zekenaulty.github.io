import { DOM } from '../core/dom.js';

class Header extends HTMLElement {
  #sequence;

  static #count = 0;

  constructor() {
    super();

    let vm = this;

  }

  connectedCallback() {
    let vm = this;

    Header.#count++;
    vm.#sequence = Header.#count;
    vm.style.display = 'block';

    DOM.classes(vm, [
      'navbar',
      'navbar-expand-md',
      'navbar-dark'
      ]);

    vm.#build();
  }

  #build() {
    let vm = this;
    let root = DOM.div(vm, [
      'container-fluid'
      ]);

    vm.#addBrand(root, 'ZN', '/');
    let toggle = vm.#addToggle(root);

    let menuUrl = vm.getAttribute('data-menu-url');

    if (menuUrl) {
      fetch(menuUrl)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          vm.#addMenu(root, data);
          $router.hookAnchors();
        });
    }
  }

  #getId(prefix = 'toggleMenu') {
    let vm = this;
    return `${prefix}Header${vm.#sequence}`;
  }

  #addBrand(to, text, href) {
    let vm = this;
    let brand = DOM.a(text, to, [
      'navbar-brand'
      ]);

    brand.href = href;

    return brand;
  }

  #addToggle(to) {
    let vm = this;
    let toggle = DOM.button(
      undefined,
      to, [
        'navbar-toggler'
        ]);

    toggle.type = 'button';

    toggle.setAttribute('data-bs-toggle', 'collapse');
    toggle.setAttribute('data-bs-target', '#' + vm.#getId());
    toggle.setAttribute('aria-controls', vm.#getId());
    toggle.setAttribute('aria-expanded', false);
    toggle.setAttribute('aria-label', 'toggle navigation');

    DOM.span(
      undefined,
      toggle, [
        'navbar-toggler-icon'
        ]);

    return toggle;
  }

  #addMenu(to, items) {
    let vm = this;
    let root = DOM.div(to, [
      'collapse',
      'navbar-collapse',
      'header-menu',
      'bg-dark',
      'border',
      'border-light'
      ]);

    root.id = vm.#getId();
    let ul = DOM.ul(root, [
      'navbar-nav'
      ]);

    for (let i = 0; i < items.length; i++) {
      vm.#addMenuItem(ul, items[i]);
    }
  }

  #addMenuItem(ul, item) {
    let vm = this;
    let li = DOM.li(undefined, ul, [
        'nav-item'
        ]);
    let a = DOM.a(
      item.text,
      li, [
        'nav-link'
        ]);

    a.href = item.href;
    
    a.setAttribute('data-bs-toggle', 'collapse');
    a.setAttribute('data-bs-target', '#' + vm.#getId());


    if (item.items) {
      vm.#addDropdownMenu(li, item.items);
    }
  }

  #addDropdownMenu(li, items) {
    let vm = this;
    li.classList.add('dropdown');
    let a = li.firstChildElement;
    a.classList.add('dropdown-toggle');
    a.setAtteibute('role', 'button');
    a.setAtteibute('data-bs-toggle', 'dropdown');
    a.setAtteibute('aria-expanded', false);

    let ul = DOM.ul(li, []);

    for (let i = 0; i < items.length; i++) {
      vm.#addDropdownMenuItem(ul, items[i]);
    }
  }

  #addDropdownMenuItem(ul, item) {
    let vm = this;

  }

}

customElements.define('header-nav', Header);
