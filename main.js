import { DOM } from './src/dom.js';
import { TopNav } from './src//topNav.js';

DOM.switchTheme();
const topNav = new TopNav({
    parent: DOM.body
});

const main = DOM.element('main', {
    parent: DOM.body,
    classes: ['w-100', 'h-100', 'container'],

});

