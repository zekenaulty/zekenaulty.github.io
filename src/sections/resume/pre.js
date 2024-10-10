import { ResumeData } from './data/index.js';
const resume = DOM.element('pre', {
    parent: null,
    text: JSON.stringify(ResumeData, null, 4),
    classes: ['w-100', 'h-100', 'overflow-auto']
});