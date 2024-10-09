import { DOM } from './src/dom.js';
import { Navigation } from './src/navigation.js';
import { Sections } from './src/sections/sections.js';

import { ImageLoader } from './src/bootstrap/imageLoader.js';

const background = new ImageLoader({
    parent: DOM.body,
    src: '/assets/backgrounds/new-bg-0028.png',
    styles: {
        width: '100vw',
        height: '100vh',
        'z-index': '-1',
        'position': 'fixed',
        'top': '0px',
        'left': '0px',
        'opacity': '0.5'
    }
});

const topNav = new Navigation({
    parent: DOM.body,
    theme: 'darkly',
    classes: ['fade', 'd-none']
});

const sections = new Sections();

setTimeout(() => {
    topNav.e.classList.add('show');
    topNav.e.classList.remove('d-none');
}, 100);