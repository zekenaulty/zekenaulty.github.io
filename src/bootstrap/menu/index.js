import { Component } from '../../component.js';

export class Menu extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('dropdown');
    }

    addMenuItem(menuItem) {
        this.addChild(menuItem);
    }
}

export class MenuItem extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('dropdown-item');
        if (options.submenu) {
            this.submenu = new Menu();
            this.addChild(this.submenu);
        }
    }
}
