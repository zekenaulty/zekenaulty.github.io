import { DOM } from './src/dom.js';
import { Navigation } from './src/navigation.js';
import { Card } from './src/bootstrap/card.js';
import { Rain } from './src/rain';

const topNav = new Navigation({
    parent: DOM.body
});

const rain = new Rain({
    parent: DOM.body
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
