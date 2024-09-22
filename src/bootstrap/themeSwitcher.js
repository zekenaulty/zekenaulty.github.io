import { DOM } from '../dom.js';
import { Component } from './component.js';

export class ThemeSwitcher extends Component {
    constructor(options = {}) {
        const o = { ...options };
        const f = (() => {
            o.tag = 'nav';
            o.classes = [...(o.classes || [])];
            o.parent ? o.parent : DOM.body;
        })();
        super(o);
        const flex = DOM.element('span', {
            parent: this.e,
            classes: []
        });
        this.themes = [
            { id: 1, value: 'cosmo', text: 'Cosmo' },
            { id: 2, value: 'cyborg', text: 'Cyborg' },
            { id: 3, value: 'darkly', text: 'Darkly' },
            { id: 4, value: 'flatly', text: 'Flatly' },
            { id: 5, value: 'lumen', text: 'Lumen' },
            { id: 6, value: 'lux', text: 'Lux' },
            { id: 7, value: 'materia', text: 'Materia' },
            { id: 8, value: 'minty', text: 'Minty' },
            { id: 9, value: 'pulse', text: 'Pulse' },
            { id: 10, value: 'sandstone', text: 'Sandstone' },
            { id: 11, value: 'simplex', text: 'Simplex' },
            { id: 12, value: 'slate', text: 'Slate' },
            { id: 13, value: 'spacelab', text: 'Spacelab' },
            { id: 14, value: 'superhero', text: 'Superhero' },
            { id: 15, value: 'united', text: 'United' },
            { id: 16, value: 'yeti', text: 'Yeti' },
        ];
        const list = DOM.element('select', {
            parent: flex,
            id: 'theme-selector',
            classes: ['form-select', 'w-auto'],
            options: [...this.themes],
            events: {
                change: (e) => {
                    DOM.switchTheme(e.target.value || 'darkly');
                  }
                }
        });
        this.dropdown = list;
        this.dropdown.value='darkly';
        DOM.switchTheme(this.dropdown.value);
    }
}