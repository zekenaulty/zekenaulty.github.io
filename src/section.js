// section.js
import { DOM } from './dom';
import { BaseComponent } from './baseComponent';

export class Section extends BaseComponent {
  constructor(parent, options = {}) {
    super(parent, options);
    this.id = options.id || '';
    this.content = options.content || '';
    this.buildSection();
  }

  buildSection() {
    this.element = DOM.element('div', {
      classes: ['section'],
      attributes: { id: this.id },
      html: this.content,
      style: 'display: none;', // Initially hidden
    });

    DOM.append(this.element, this.parent);
  }

  show() {
    this.element.style.display = 'block';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
