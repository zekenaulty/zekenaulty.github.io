import { Component } from "../bootstrap/component";

export class Section extends Component {

    constructor(options = {}) {
        const n = ((options) => {
            const o = { ...options };
            o.tag = 'section';
            o.classes = [
                //'',
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
        const headerShow = this.config.showHeader ? ['show'] : [];
        this.header = this.DOM.element('header', {
            parent: this.e,
            classes: [
                'fade',
                ...headerShow
            ],
            styles: {},
            attributes: {}
        });

        this.navLink = this.DOM.element('a', {
            parent: this.header,
            attributes: {
                id: this.config.sectionId
            },
            text: this.config.header ? this.config.header : ''
        });

        this.body = this.DOM.element('article', {
            parent: this.e,
            classes: [

            ],
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