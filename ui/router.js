import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';


class Router {
  #routes = {};
  #current = '';

  constructer() {
    let vm = this;

    let router = (e) => {
      vm.resolve(e);
    };

    /* 
      putting a pin in this, 
      spck not helping me here 
    */
    //window.addEventListener('load', router);
    //window.addEventListener('popstate', router);
    //window.addEventListener('hashchange', router);
  }

  add() {
    let vm = this;
    for (let i = 0; i < arguments.length; i++) {
      let r = arguments[i];
      vm.#routes[r.route] = r.tag;
    }
  }

  remove(route) {
    let vm = this;
    delete vm.#routes[route];
  }

  go(route) {
    let vm = this;
    let tag = vm.#routes[route];
    let view = vm.#findViewport(route);
    if (tag && view) {
      let component = document.createElement(tag);
      while (view._shadow.lastElementChild) {
        view._shadow.removeChild(view._shadow.lastElementChild);
      }
      view._shadow.appendChild(component);
      console.log(`loaded route ${route}`);
    }
  }

  update() {
    let vm = this;
    let route = window.location.hash.slice(1) || '/';
    console.log(`router update found ${route} route, current routes is ${vm.#current}`);
    if (vm.#current !== route) {
      vm.go(route);
      vm.#current = route;
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

  #resolve(e) {
    let vm = this;
    let route = window.location.hash.slice(1) || '/';
    e = e || window.event;
    console.log(e);
    console.log(route);
    if (vm.#routes[route] && e) {
      e.preventDefault();
      e.returnValue = '';
      /* this needs to be moved to go to handle direct calls to go*/
      window.history.pushState({}, '', event.target.href);
      vm.update();
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
customElements.define('router-viewport', RouterViewport);
