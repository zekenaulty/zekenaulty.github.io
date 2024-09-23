import { Component } from './component.js';

export class NavigationToggleButton extends Component {
  constructor(options = {}) {
    const n = ((options) => {
      const o = { ...options };
      o.tag = 'button';
      o.classes = [
        'btn',
        'text-center',
        ...(o.classes || [])];
      o.events = o.events ? o.events : {};
      o.styles = o.styles ? o.styles : {};
      return o;
    })(options);
    super(n);
    this.build(n);
  }

  build(options) {
    this.config = options;
    this.menuIcon = this.DOM.element('i', {
      parent: this.e,
      classes: ['bi', 'bi-list'],
      id: 'menuIcon-internal-0000'
    });

    this.closeIcon = this.DOM.element('i', {
      parent: this.e,
      classes: ['bi', 'bi-x-lg'],
      id: 'closeIcon-internal-0000'
    });

    this.menuIcon.style.display = 'block';
    this.closeIcon.style.display = 'none';

    this.e.addEventListener('click', () => {
      if (this.menuIcon.style.display !== 'none') {
        this.menuIcon.style.display = 'none';
        this.closeIcon.style.display = 'block';
      } else {
        this.menuIcon.style.display = 'block';
        this.closeIcon.style.display = 'none';
      }
    });

  }
}
