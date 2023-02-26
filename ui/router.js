import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';


class Router {
  #routes = {};
  #current = '';
  #history = [];
  #index = -1;

  constructer() {
    let vm = this;

  }

  _initialize() {
    let vm = this;

    const hook = (n) => {
      window.addEventListener(n, (e) => {
        console.log('running router from event ' + n);
        vm.#resolve(e, n);
      });
    };

    hook('load');
    hook('popstate');
    hook('hashchange');

  }

  add() {
    let vm = this;
    for (let i = 0; i < arguments.length; i++) {
      let r = arguments[i];
      vm.#routes[r.route] = {
        path: `${window.location.origin}${r.route}`,
        tag: r.tag,
        title: r.title,
        resolve: r.resolve
      };
    }
  }

  remove(route) {
    let vm = this;
    delete vm.#routes[route];
  }

  go(route, n) {
    let vm = this;
    let info = vm.#routes[route];
    let view = vm.#findViewport(route);
    if (info && info.tag && view) {
      let component = document.createElement(info.tag);
      while (view._shadow.lastElementChild) {
        view._shadow.removeChild(view._shadow.lastElementChild);
      }
      view._shadow.appendChild(component);

      if (vm.#current == '') {
        vm.#history.push(route);
        window.history.replaceState(
          vm.#history.length - 1,
          info.title,
          info.path
        );
      } else {
        let isHistory = n && n == 'popstate';
        if (!isHistory) {
          vm.#history.push(route);
          window.history.pushState(
            vm.#history.length - 1,
            info.title,
            info.path
          );
        }
      }
      vm.#current = route;
      document.querySelector('title').innerText = info.title;
    }
  }

  #update(n) {
    let vm = this;
    let route = window.location.hash.slice(1) || '/';
    if (vm.#current !== route) {
      vm.go(route, n);
    }
  }

  #findViewport(route) {
    let root = document.querySelector('router-viewport');
    /* 
    
      don't need deep nested views yet, 
      but basically you can use the number 
      of forward slashes to determine depth 
    
    */
    return root;
  }

  #resolve(e, n) {
    let vm = this;
    if(window.location.search != '') {
      alert(window.location.search);
    }
    let route = window.location.hash.slice(1) || '/';
    if (vm.#routes[route]) {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.returnValue = '';
      }
      vm.#update(n);
    }
  }
}

class RouterViewport extends HTMLElement {

  #shadows;

  constructor() {
    super();

    let vm = this;
    vm.#shadows = new Shadows(vm);

  }

  connectedCallback() {
    let vm = this;
    vm.style.display = 'block';
    vm.style.overflowX = 'auto';
    vm.style.overflowY = 'auto';
  }

}

window.$router = new Router();
$router._initialize();
customElements.define('router-viewport', RouterViewport);