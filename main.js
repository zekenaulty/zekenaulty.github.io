import { DOM } from './src/dom.js';
import { Navigation } from './src/navigation.js';
import { Card } from './src/bootstrap/card.js';
import { Rain } from './src/rain';
import { Matrix } from './src/matrix';
import { SacredGeometry } from './src/sections/art-gallery/sacredGeometry.js';
import './src/scroll/scroll.css';
import './src/scroll/scroll.js';

import { Home } from './src/sections/home/index.js';

const components = {
    home: Home
};
const componentProperties = {
    home: {
        classes: [
            'w-100',
            'h-100'
        ],
        styles: {}
    }
};

const rain = new Rain({
    parent: DOM.body,
    styles: {
        opacity: '0.65'
    }
});

const matrix = new Matrix({
    parent: DOM.body,
    styles: {
        opacity: '0.60'
    }
});

const topNav = new Navigation({
    parent: DOM.body,
    theme: 'darkly'
});

const main = DOM.element('main', {
    parent: DOM.body,
    classes: [
        'position-fixed',
        'border-light',
        'bg-secondary',
    ],
    styles: {
        'border-radius': '1em',
        top: '6.6vh',
        left: '1vw',
        width: '98vw',
        height: '90vh',
        'z-index': '0',
        opacity: '0.75',
        'position': 'relative',
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
    },
    attributes: {
        'data-bs-spy': 'spy',
        'data-bs-target': topNav.navMenu.id,
        'data-bs-offset': '0'
    }
});

/* */
main.sections = {};
topNav.keys.map((key) => {
    const section = components[key];
    /*
    const ops = componentProperties[key] || {};
    if (section) {
        main.sections[key] = new section({
            parent: main,
            ...ops
        });
    }
        */
}); 

const images = new SacredGeometry({
    parent: main,
    styles: {
        width: '98vw',
        height: '90vh',
    }
});


/*
let last = DOM.body;
for(let i = 0; i < 19; i++){
    const c = new Card({
        parent: last,
        header: `Header: ${i}`,
        bodyText: `Card body text: ${i}`,
        styles: {
            opacity: 0.9
        }
    });
    last = c.body;
}
*/
