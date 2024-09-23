import { DOM } from './dom.js';
import { ThemeSwitcher } from './bootstrap/themeSwitcher.js';
import { NavigationToggleButton } from './bootstrap/navigationToggleButton.js';
import { Component } from './bootstrap/component.js';

export class Navigation extends Component {
    constructor(options = {}) {
        const n = ((options) => {
            const o = { ...options };
            o.tag = 'nav';
            o.classes = [
                'position-fixed',
                'd-flex',
                'justify-content-end',
                'align-items-start',
                ...(o.classes || [])];
            o.parent = o.parent ? o.parent : DOM.body;
            o.events = o.events ? o.events : {};
            o.styles = o.styles ? o.styles : {};
            o.styles.top = '8px';
            o.styles.right = '8px';
            return o;
        })(options);
        super(n);
        this.build(n);
    }

    build(options) {
        this.config = options;
        this.themeSwitcher = this.buildThemeSwitcher(options);
        this.toggleButton = this.buildToggleButton(options);
    }

    buildToggleButton(options){
        return new NavigationToggleButton({
            parent: this.e,
            classes: [
                'border-light',
                'btn-primary',
                'hover-secondary',
            ],
            styles: {},
            events: {
                click: (e) => {
                    console.debug('toggle top navigation; off canvas');
                    this.e.dispatchEvent(new CustomEvent('toggle'));
                }
            }
        });
    }

    buildThemeSwitcher(options) {
        return new ThemeSwitcher({
            parent: this.e,
            classes: ['me-1'],
            styles: {},
            events: {}
        });
    }
}

