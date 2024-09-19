// scrollSpy.js
import { DOM } from './dom';
import { BaseComponent } from './baseComponent';

export class ScrollSpy extends BaseComponent {
  constructor(parent, layoutManager, options = {}) {
    super(parent, options);
    this.layoutManager = layoutManager;
    this.sections = options.sections || [];
    this.buildScrollSpy();
  }

  buildScrollSpy() {
    this.nav = DOM.element('nav', {
      classes: ['scrollspy-nav'],
    });

    this.sections.forEach((section, index) => {
      const link = DOM.element('a', {
        parent: this.nav,
        classes: ['nav-link'],
        text: section.title,
        attributes: { href: `#${section.id}`, 'data-index': index },
        events: { click: (e) => this.handleNavClick(e, section) },
      });
    });

    DOM.append(this.nav, this.parent);
  }

  handleNavClick(event, section) {
    event.preventDefault();
    this.layoutManager.transitionToSection(section);
  }
}
