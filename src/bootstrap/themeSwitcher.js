import { DOM } from '../dom.js';
import { Component } from '../component.js';

export class ThemeSwitcher extends Component {
    constructor(options = {}) {
        super(options);
        this.container = DOM.container({parent: parent});
        this.options.parent = null;
    }
}
/*

    <!-- Theme Selector -->
    <div class="container">
        <div class="d-flex justify-content-end">
        <select id="theme-selector" class="form-select w-auto">
            <option value="darkly">Darkly</option>
            <option value="flatly">Flatly</option>
            <option value="cerulean">Cerulean</option>
            <!-- Add more themes as desired -->
        </select>
        </div>
    </div>
    // Switch to the 'cerulean' theme
    DOM.switchTheme('cerulean');

    // Later, switch to the 'darkly' theme
    DOM.switchTheme('darkly');

*/