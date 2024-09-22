import { DOM } from './dom.js';
import { ThemeSwitcher } from './bootstrap/themeSwitcher.js';
import { ToggleButton } from './bootstrap/toggleButton.js';
import { Component } from './bootstrap/component.js';
import { OffCanvas } from './bootstrap/offCanvas/index.js';

export class TopNav extends Component {
    constructor(options = {}){
        const o = { ...options };
        const f = (() => {
            o.tag = 'nav';
            o.classes = [
                'position-fixed',
                 ...(o.classes || [])];
            o.parent ? o.parent : DOM.body;
            o.events = o.events ? o.events : {};
            o.styles = o.styles ? o.styles : {};
            o.styles.top = '8px';
            o.styles.right = '8px';
        })();
        super(o);
        const topControls = DOM.element('div', {
            parent: this.e,
            classes: [
                'd-flex',
                'justify-content-end',
                'align-items-start',
            ]
        });
        const themes = new ThemeSwitcher({
            parent: topControls,
            classes: ['pe-1'],
            styles: {}
        });
        const navCanvasToggle = new ToggleButton({
            parent: topControls,
            classes: [
                'border-light',
                'btn-primary',
                'hover-secondary',
            ],
            styles: {},
            events: {
                click: (e) => {
                    
                    this.e.dispatchEvent(new CustomEvent('toggle'));
                }
            }
        });

        const off = new OffCanvas({});
        off.initialize();
    }
}

