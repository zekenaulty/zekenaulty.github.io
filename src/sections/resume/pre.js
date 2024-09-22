import { Resume } from './data/index.js';
const resume = DOM.element('pre', {
    parent: null,
    text: JSON.stringify(Resume, null, 4),
    classes: ['w-100', 'h-100', 'overflow-auto']
});