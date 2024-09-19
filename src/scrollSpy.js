// scrollSpy.js
import { DOM } from './dom';
import { BaseComponent } from './baseComponent';

export class ScrollSpy extends BaseComponent {
  constructor(parent, options = {}) {
    super(parent, options);
    this.sections = options.sections || []; // Array of sections to spy on
    this.activeSection = null;
    this.loader = null;
    this.buildScrollSpy();
  }

  buildScrollSpy() {
    // Create navigation container
    this.nav = DOM.element('nav', {
      classes: ['scrollspy-nav'],
    });

    // Create each navigation link for the sections
    this.sections.forEach((section, index) => {
      const link = DOM.element('a', {
        parent: this.nav,
        classes: ['nav-link'],
        text: section.title,
        attributes: { href: `#${section.id}`, 'data-index': index },
        events: { click: (e) => this.handleNavClick(e, section) },
      });
    });

    // Create a loader element for transitions
    this.loader = DOM.element('div', {
      classes: ['loader', 'spinner-border'],
      attributes: { role: 'status', 'aria-hidden': 'true' },
      style: 'display: none;', // Initially hidden
    });

    DOM.element('span', {
      parent: this.loader,
      classes: ['visually-hidden'],
      text: 'Loading...',
    });

    // Append nav and loader to the parent element
    DOM.append(this.nav, this.parent);
    DOM.append(this.loader, this.parent);
  }

  // Handle navigation clicks with a dynamic loader
  handleNavClick(event, section) {
    event.preventDefault();
    this.showLoader();
    this.transitionToSection(section);
  }

  // Show the loading spinner
  showLoader() {
    this.loader.style.display = 'block';
  }

  // Hide the loading spinner
  hideLoader() {
    this.loader.style.display = 'none';
  }

  // Transition to the target section with a smooth effect
  transitionToSection(section) {
    if (this.activeSection) {
      this.activeSection.hide(); // Hide the currently active section
    }
    setTimeout(() => {
      section.show(); // Show the target section
      this.activeSection = section;
      this.hideLoader();
    }, 500); // Simulate loading time
  }
}
