// main.js
import { OffCanvas } from './src/offCanvas';

const sections = [
    { id: 'section1', title: 'Section 1', content: '<p>Content for Section 1</p>' },
    { id: 'section2', title: 'Section 2', content: '<p>Content for Section 2</p>' },
    { id: 'section3', title: 'Section 3', content: '<p>Content for Section 3</p>' },
];
const offCanvas = new OffCanvas(document.body, {
    title: 'Scroll Spy Navigation',
    sections: sections,
});
offCanvas.render();

document.getElementById('openOffCanvas').addEventListener('click', () => {

});
