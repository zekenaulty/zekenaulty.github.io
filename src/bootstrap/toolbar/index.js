import { Component } from '../../component.js';

export class Toolbar extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('btn-group');
    }

    addToolbarItem(item) {
        this.addChild(item);
    }
}

export class ToolbarItem extends Component {
    constructor(options = {}) {
        super(options);
        this.e.classList.add('btn', 'btn-primary');
    }
}
