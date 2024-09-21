import { Component } from '../../component.js';

export class Panel extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('panel', 'card'); // Use Bootstrap card component
        this.setupHeader();
        this.setupBody();
    }

    setupHeader() {
        this.header = DOM.element('div', { classes: ['card-header'] });
        this.e.appendChild(this.header);
    }

    setupBody() {
        this.body = DOM.element('div', { classes: ['card-body', 'collapse', 'show'] });
        this.e.appendChild(this.body);
    }

    setPosition(position) {
        this.e.classList.add(`dock-${position}`);
    }
}
