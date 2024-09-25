import { DOM } from './dom.js';
import { ThemeSwitcher } from './bootstrap/themeSwitcher.js';
import { NavigationToggleButton } from './bootstrap/navigationToggleButton.js';
import { Component } from './bootstrap/component.js';
import { OffCanvas } from './bootstrap/offCanvas.js';
import * as sitemap from './sitemap.json';

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
            o.styles = o.styles ? o.styles : {
                'z-index': 1030
            };
            o.attributes = o.attributes ? o.attributes : {};

            o.styles.top = '1vh';
            o.styles.right = '1vh';
            o.styles.width = '98vw';

            return o;
        })(options);
        super(n);
        this.build(n);
    }

    build(options) {
        this.config = options;
        this.header = this.buildHeader(options);
        this.themeSwitcher = this.buildThemeSwitcher(options);
        this.toggleButton = this.buildToggleButton(options);
        this.offCanvas = this.buildOffCanvas(options);
    }

    buildHeader(options) {
        return this.DOM.element('span', {
            parent: this.e,
            classes: [
                'h6',
                'me-auto',
                'mt-auto'
            ],
            text: 'ZN: Code Monkey'
        });
    }

    buildToggleButton(options){
        return new NavigationToggleButton({
            parent: this.e,
            id: `sitenav`,
            classes: [
                'btn-primary',
            ],
            styles: {
                'border-radius': '1em'
            },
            events: {},
            attributes: {
                id: `sitenavToggle`,
                'data-bs-toggle': 'offcanvas',
                'data-bs-target': '#sitenav',
                'aria-controls': 'sitenav',
            }
        });
    }

    buildThemeSwitcher(options) {
        return new ThemeSwitcher({
            parent: this.e,
            classes: ['me-1'],
            styles: {
                display: 'none'
            },
            events: {},
            default: options.theme ? options.theme : 'mint'
        });
    }

    buildOffCanvas(options) {
        const c = new OffCanvas({
            parent: this.DOM.body,
            id: `sitenav`,
            attributes: {
                id: `sitenav`
            },
            styles: {
                width: '111px'
            },
            close: false,
            header: `ZN`
        });

        const ul = this.DOM.element('ul', {
            parent: c.body,
            classes: [
                'nav',
                'flex-column'
            ],
            attributes: {}
        });
        const sections = sitemap.default.sections;
        sitemap.default.keys.map((e) => {
            
            const li = this.DOM.element('li', {
                parent: ul,
                classes: [
                    'nav-item'
                ],
                attributes: {}
            });
            const item = this.DOM.element('a', {
                parent: li,
                classes: [
                    'nav-link'
                ],
                attributes: {
                    href: sections[e].href,
                    id: sections[e].id,
                    name: sections[e].name,
                },
                text: sections[e].text
            });
        });

        return c;
    }
}

