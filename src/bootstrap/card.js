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