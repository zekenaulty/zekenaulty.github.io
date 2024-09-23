import { Component } from './component.js';

export class Card extends Component {
    constructor(options = {}) {
        const n = ((options) => {
            const o = { ...options };
            o.tag = 'article';
            o.classes = [
                'card',
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
        if (this.config.header) {
            this.header = this.DOM.element('header', {
                parent: this.e,
                classes: ['card-header'],
                text: this.config.header
            });
        }

        this.body = this.DOM.element('section', {
            parent: this.e,
            classes: ['card-body'],
            text: this.config.bodyText || ''
        });
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