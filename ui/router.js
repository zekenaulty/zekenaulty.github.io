import { DOM } from '../core/dom.js';
import { Shadows } from '../core/shadows.js';

class Router {
  #routes = {};
  #current = '';

  constructer() {
    let vm = this;
  }

  _initialize() {
    let vm = this;

    const hook = (n) => {
      window.addEventListener(n, (e) => {
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
    route = vm.parseRoute(route);
    let info = vm.#routes[route];
    let view = vm.#findViewport(route);
    if (info && info.tag && view) {
      let component = document.createElement(info.tag);
      while (view._shadow.lastElementChild) {
        view._shadow.removeChild(view._shadow.lastElementChild);
      }
      view._shadow.appendChild(component);
      let isHistory = window.history.state && window.history.state == info.path;
      if (vm.#current == '') {
        window.history.replaceState(
          info.path,
          info.title,
          info.path
        );
      } else if (!isHistory && vm.#current != info.path) {
        window.history.pushState(
          info.path,
          info.title,
          info.path
        );
      }
      vm.#current = info.path;
      document.querySelector('title').innerHTML = info.title;
    }
  }

  #update(n) {
    let vm = this;
    let route = $router.parseRoute(window.location.href);
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
    let route = vm.parseRoute(window.location.href);
    if (vm.#routes[route]) {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.returnValue = '';
      }
      vm.#update(n);
    }
  }
/*
  anchor(e) {
    let vm = this;
    let a = e.target;
    if (a.target) {
      return true;
    }
    let route = $router.parseRoute(a.href);
    if (vm.#routes[route]) {
      e.preventDefault();
      vm.go(route);
    }
    return false;
  }
*/
  isRoute(route) {
    let vm = this;
    return vm.#routes[route] ? true : false;
  }

  hookAnchors() {
    $(document).on('click', 'a', function(e) {
      let a = e.target;
      
      let action = a.getAttribute('data-site-action');
      if(action && $actions) {
        let params = a.getAttribute('data-site-action-' + action);
        $actions.run(action, params);
        return;
      }
      
      if (!a.target) {
        let route = $router.parseRoute(a.href);
        if ($router.isRoute(route)) {
          e.preventDefault();
          $router.go(route);
          return;
        }
      } else {
        window.open(a.href, a.target);
      }
    });
  }

  parseRoute(href) {
    if (!href) {
      return;
    }
    let vm = this;
    href = href.replace('index.html', '');
    
    let route = href;
    let search = route.indexOf('?');
    if (search > -1) {
      route = route.substring(search + 1);
      if (route[0] != '/') {
        route = '/' + route;
      }
    } else {
      try {
        let url = new URL(href);
        route = url.pathname;
      } catch {
        route = href;
      }
    }
    return route;
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

    $router.hookAnchors();
  }

}

window.$router = new Router();
$router._initialize();

customElements.define('router-viewport', RouterViewport);
