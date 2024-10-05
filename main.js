import { DOM } from './src/dom.js';
import { Navigation } from './src/navigation.js';
import { Rain } from './src/rain/rain.js';
import { Home } from './src/sections/home/home.js';
import { About } from './src/sections/about/about.js';
import { Resume } from './src/sections/resume/resume.js';
import { ArtGallery } from './src/sections/art-gallery/artGallery.js';

const components = {
    home: Home,
    about: About,
    resume: Resume,
    gallery: ArtGallery
};

const defaultOps = {
    classes: [
    ],
    styles: {
        width: '100vw',
        height: '100vh',
        position: 'relative'
    }
};

const componentProperties = {
    home: {...defaultOps},
    about: {...defaultOps},
    resume: {...defaultOps},
    gallery: {...defaultOps}
};

/* const rain = new Rain({
    parent: DOM.body,
    styles: {
        opacity: '0.65'
    }
}); */

const topNav = new Navigation({
    parent: DOM.body,
    theme: 'darkly',
    classes: ['fade', 'd-none']
});

const main = DOM.element('main', {
    parent: DOM.body,
    classes: [],
    styles: {
        'border-radius': '1em',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        'z-index': '0',
        opacity: '0.75',
        'position': 'relative',
    },
    attributes: {
        'data-bs-spy': 'spy',
        'data-bs-target': topNav.navMenu.id,
        'data-bs-offset': '0',
        'data-simplebar': ''
    }
});

main.sections = {};
let top = 0;
topNav.keys.map((key) => {
    const section = components[key];
    const ops = componentProperties[key] || {};
    if (section) {
        main.sections[key] = new section({
            parent: main,
            ...ops
        });
    }
});

setTimeout(() => {
    topNav.e.classList.add('show');
    topNav.e.classList.remove('d-none');
}, 100)