import { DOM } from './dom';

export class BaseComponent {
    constructor(parent, options = {}) {
    this.parent = parent;
      this.options = options;
      this.element = null;
    }
  
    // Method to render the component
    render() {
      if (this.element) {
        DOM.append(this.element, this.parent);
      }
    }
  
    // Method to remove the component
    remove() {
      if (this.element) {
        DOM.remove(this.element);
      }
    }
  }
  