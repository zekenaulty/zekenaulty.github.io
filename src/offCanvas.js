import { DOM } from './dom';
import { BaseComponent } from './baseComponent';

export class OffCanvas extends BaseComponent {
    constructor(parent = document.body, options = {}) {
      super(parent, options);
      this.id = options.id || 'offcanvasExample';
      this.title = options.title || 'Menu';
      this.content = options.content || '';
      this.position = options.position || 'start'; // Options: start, end, top, bottom
      this.backdrop = options.backdrop || true; // Show backdrop
      this.keyboard = options.keyboard || true; // Close with ESC
      this.scroll = options.scroll || false; // Allow scrolling
      this.buildOffCanvas();
    }
  
    // Method to build the off-canvas component
    buildOffCanvas() {
      this.element = DOM.element('div', {
        classes: ['offcanvas', `offcanvas-${this.position}`],
        attributes: {
          tabindex: '-1',
          id: this.id,
          'aria-labelledby': `${this.id}Label`,
          'data-bs-backdrop': this.backdrop,
          'data-bs-keyboard': this.keyboard,
          'data-bs-scroll': this.scroll,
        },
      });
  
      // Header with close button
      const header = DOM.element('div', {
        parent: this.element,
        classes: ['offcanvas-header'],
      });
  
      DOM.element('h5', {
        parent: header,
        classes: ['offcanvas-title'],
        text: this.title,
        attributes: { id: `${this.id}Label` },
      });
  
      DOM.element('button', {
        parent: header,
        classes: ['btn-close', 'text-reset'],
        attributes: { type: 'button', 'data-bs-dismiss': 'offcanvas', 'aria-label': 'Close' },
      });
  
      // Body of the off-canvas
      DOM.element('div', {
        parent: this.element,
        classes: ['offcanvas-body'],
        html: this.content,
      });
    }
  
    // Method to initialize the component
    initialize() {
      // Initialize offcanvas using Bootstrap's JavaScript API
      const offcanvasElement = new bootstrap.Offcanvas(this.element);
      offcanvasElement.show();
    }
  
    // Overriding render to include initialization
    render() {
      super.render();
      this.initialize();
    }
  }
  