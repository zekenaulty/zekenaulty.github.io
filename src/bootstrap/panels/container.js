import { Component } from '../../component.js';

export class Container extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('container-fluid');
        this.children = []; // To manage child components
    }

    addPanel(panel, position = 'center') {
        panel.setPosition(position);
        this.children.push(panel);
        this.renderPanels();
    }

    renderPanels() {
        this.e.innerHTML = ''; // Clear container
        this.children.forEach(panel => this.addChild(panel));
    }

    dockTop(panel) {
        panel.setPosition('top');
        this.addPanel(panel);
    }

    dockLeft(panel) {
        panel.setPosition('left');
        this.addPanel(panel);
    }

    // Tab management
    addTabPanel(panel) {
        // Use Bootstrap's nav-tab to support MDI tabbed interface
        const tabs = this.e.querySelector('.nav-tabs') || this.createTabs();
        tabs.appendChild(panel.getTab());
        this.addChild(panel);
    }
}
