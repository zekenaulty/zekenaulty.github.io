import { Component } from './component.js';

export class OffCanvas extends Component {
    constructor(options = {}) {
        const id = options.id ? options.id : 'offcanvas-internal-' + (Math.floor(Math.random() * 999999) + 100);
        const o = Component.initOptions(options, {
            tag: 'nav',
            classes: [
                'offcanvas',
                ((p) => `offcanvas-${p}`)(options.position || 'start'),
            ],
            attributes: {
                id: id,
                'data-bs-scroll': true,
                'data-bs-backdrop': false,
                'aria-labelledby': `${id}Label`
            }
        });
        super(o);
        this.build();
    }

    build() {
        this.header = this.DOM.element('header', {
            parent: this.e,
            classes: [
                'offcanvas-header',
                ...(this.config.headerClasses || [])
            ]
        });
        if (this.config.headerStyles) {
            Object.assign(this.header.style, this.config.headerStyles);
        }

        this.DOM.element('span', {
            parent: this.header,
            id: `${this.config.id}Label`,
            classes: [
                'offcanvas-title',
                'h5'
            ],
            attributes: {
                id: `${this.config.id}Label`
            },
            text: this.config.header
        });

        this.closeButton = this.config.close ? this.DOM.element('button', {
            parent: this.header,
            classes: [
                'btn-close',
                'text-reset'
            ],
            attributes: {
                type: 'button'
            }
        }) : {};
        if (this.closeButton.attributes) {
            this.closeButton.attributes['data-bs-dismiss'] = 'offcanvas';
            this.closeButton.attributes['aria-label'] = 'Close';
        }

        this.body = this.DOM.element('section', {
            parent: this.e,
            classes: [
                'offcanvas-body',
                ...(this.config.bodyClasses || [])
            ],
            text: this.config.bodyText || ''
        });
        if (this.config.headerStyles) {
            Object.assign(this.body.style, this.config.headerStyles);
        }
    }

    addChild(child) {
        if (child instanceof Component) {
            this.body.appendChild(child.e);
            this.children.push(child);
        } else if (child instanceof HTMLElement) {
            this.body.appendChild(child);
        } else {
            throw new Error("Child must be a Component or HTMLElement");
        }
    }

    removeChild(child) {
        if (child instanceof Component) {
            this.body.removeChild(child.e);
            this.children = this.children.filter(c => c !== child);
        } else if (child instanceof HTMLElement) {
            this.body.removeChild(child);
        } else {
            throw new Error("Child must be a Component or HTMLElement");
        }
    }

}
/*
<div class="card">
  <h5 class="card-header">Featured</h5>
  <div class="card-body">
    <h5 class="card-title">Special title treatment</h5>
    <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
*/