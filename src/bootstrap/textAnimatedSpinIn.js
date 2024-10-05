import { Component } from './component.js';

export class TextAnimatedSpinIn extends Component {
    constructor(options = {}) {
        const o = Component.initOptions(options, {
            tag: 'div',
            classes: ['animated-text', 'text-nowrap'],
            text: options.text || '',
            font: options.font || '16pt monospace',
            duration: options.duration || 550,
            factor: options.factor || 25
        });
        super(o);
        this.text = this.config.text || 'Test Message Please Ignore';
        this.build();
    }

    build() {
        this.e.innerHTML = '';
        this.text.split('').forEach((char) => {
            const span = this.DOM.element('span', {
                parent: this.e,
                text: char === ' ' ? '\u00A0' : char,
                styles: {
                    opacity: 0,
                    transform: 'scale(0) rotate(0deg)',
                    display: 'inline-block',
                    font: this.config.font
                },
            });
        });
        this.animateText();
    }

    animateText() {
        const spans = this.e.querySelectorAll('span');

        anime.timeline({
            loop: false,
        }).add({
            targets: spans,
            opacity: [-1, 1],
            scale: [-1, 1],
            rotate: [-360 * 4, 0],
            duration: this.config.duration,
            easing: 'easeOutExpo',
            delay: (el, i) => this.config.factor * i
        });
    }

    updateText(newText) {
        this.text = newText;
        this.build();
    }
}
