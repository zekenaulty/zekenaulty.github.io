

class SiteActions {
  #actions = {};
  
  constructor() {
    
  }

  #camel(s) {
    return s.replace(
      /-([a-z])/g, (g) => {
        return g[1].toUpperCase();
      });
  }
  
  add(name, action) {
    let vm = this;
    let k = vm.#camel(name);
    vm.#actions[k] = action;
  }
  
  remove(name) {
    let vm = this;
    let k = vm.#camel(name);
    delete vm.#actions[k];
  }
  
  run(name, params) {
    let vm = this;
    let k = vm.#camel(name);
    
    if(vm.#actions && vm.#actions[k]) {
      vm.#actions[k](params);
    }
  }
}

window.$actions = new SiteActions();
