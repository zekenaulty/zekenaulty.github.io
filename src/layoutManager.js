// layoutManager.js
import { DOM } from './dom';
import { BaseComponent } from './baseComponent';

export class LayoutManager extends BaseComponent {
  constructor(parent, options = {}) {
    super(parent, options);
    this.sections = options.sections || [];
    this.activeSection = null;
    this.loader = null;
    this.buildLayout();
  }

  buildLayout() {
    // Main container for the sections
    this.stage = DOM.element('div', {
      parent: this.parent,
      classes: ['layout-stage'],
    });

    // Create a loader element for transitions
    this.loader = DOM.element('div', {
      classes: ['loader', 'spinner-border'],
      attributes: { role: 'status' },
      style: 'display: none;', // Initially hidden
    });

    DOM.element('span', {
      parent: this.loader,
      classes: ['visually-hidden'],
      text: 'Loading...',
    });

    DOM.append(this.loader, this.parent);

    // Initialize sections
    this.sections.forEach(section => {
      section.parent = this.stage;
      section.render();
      section.hide();
    });
  }

  // Method to handle showing the loader
  showLoader() {
    this.loader.style.display = 'block';
  }

  // Method to hide the loader
  hideLoader() {
    this.loader.style.display = 'none';
  }

  // Transition between sections with loader feedback
  transitionToSection(section) {
    if (this.activeSection) {
      this.activeSection.hide();
    }
    this.showLoader();
    setTimeout(() => {
      section.show();
      this.activeSection = section;
      this.hideLoader();
    }, 500); // Adjust timing for smoother transitions
  }
}
