import { Component } from './component.js';

export class NavigationToggleButton extends Component {
  constructor(options = {}) {
    const o = Component.initOptions(options, {
      tag: 'button',
      classes: ['btn',  'text-center']
    });
    super(o);
    this.build();
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
