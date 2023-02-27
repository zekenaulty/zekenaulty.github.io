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
      'header',
      'border',
      'border-light',
      'border-top-0',
      'border-start-0',
      'border-end-0'
      ]);

    vm.#build();
  }

  #build() {
    let vm = this;
    let nav = DOM.nav(vm, [
      'navbar',
      'navbar-expand-md',
      'navbar-dark'
      ]);

    let root = DOM.div(nav, [
      'container-fluid'
      ]);

    vm.#addBrand(root, 'ZN', '/');
    let toggle = vm.#addToggle(root);

    let menuUrl = vm.getAttribute('data-menu');

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
    let li = DOM.li(undefined, ul, ['nav-item']);
    let a = DOM.a(undefined, li, ['nav-link']);

    if (item.icon) {
      DOM.element('i', a, item.icon.split(' '));
    }
    
    DOM.text(item.text, a);

    if (item.target) {
      a.setAttribute('target', item.target);
    }

    if (item.title) {
      a.setAttribute('title', item.title);
    }

    a.href = item.href;
    a.setAttribute('data-bs-toggle', 'collapse');
    a.setAttribute('data-bs-target', '#' + vm.#getId());

    if (item.items) {
      vm.#addDropdownMenu(li, a, item.items);
    }
  }

  #addDropdownMenu(li, a, items) {
    let vm = this;
    li.classList.add('dropdown');
    a.setAttribute('target', undefined);
    a.href = 'javascript:void(0);';
    a.classList.add('dropdown-toggle');
    a.setAttribute('role', 'button');
    a.setAttribute('data-bs-toggle', 'dropdown');
    a.setAttribute('aria-expanded', false);

    let ul = DOM.ul(li, ['dropdown-menu']);

    for (let i = 0; i < items.length; i++) {
      vm.#addDropdownMenuItem(ul, items[i]);
    }
  }

  #addDropdownMenuItem(ul, item) {
    let vm = this;
    let li = DOM.li(undefined, ul, []);
    let a = DOM.a(undefined, li, ['dropdown-item']);

    if (item.icon) {
      DOM.element('i', a, item.icon.split(' '));
    }
    
    DOM.text(item.text, a);

    if (item.target) {
      a.setAttribute('target', item.target);
    }

    if (item.title) {
      a.setAttribute('title', item.title);
    }

    a.href = item.href;
    a.setAttribute('data-bs-toggle', 'collapse');
    a.setAttribute('data-bs-target', '#' + vm.#getId());
  }

}

customElements.define('header-nav', Header);
