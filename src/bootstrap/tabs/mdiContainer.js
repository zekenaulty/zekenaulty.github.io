import { Component } from '../../component.js';

export class MDIContainer extends Component {
    constructor(options = {}) {
        super(options);
        this.tabs = DOM.element('ul', { classes: ['nav', 'nav-tabs'] });
        this.tabContent = DOM.element('div', { classes: ['tab-content'] });
        this.e.appendChild(this.tabs);
        this.e.appendChild(this.tabContent);
    }

    addMDIPanel(panel) {
        const tab = DOM.element('li', { classes: ['nav-item'] });
        const link = DOM.element('a', {
            classes: ['nav-link'],
            text: panel.title,
            attributes: { 'data-bs-toggle': 'tab', href: `#${panel.id}` }
        });

        tab.appendChild(link);
        this.tabs.appendChild(tab);
        this.addChild(panel);
    }
}

export class MDIPanel extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('tab-pane', 'fade');
        this.e.id = options.id || `tab-${Math.random().toString(36).substr(2, 9)}`;
        this.e.innerHTML = options.content || '';
    }
}
