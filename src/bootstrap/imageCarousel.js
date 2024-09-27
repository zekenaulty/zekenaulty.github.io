import { Component } from './component.js';
import { DOM } from '../dom.js';

export class ImageCarousel extends Component {
    constructor(options = {}) {
        const n = ((options) => {
            const o = { ...options };
            const id = o.id == undefined || o.id == '' ? 'image-carousel-internal-id-' + Math.random() + 9999 : o.id;
            o.tag = 'div';
            o.classes = [...(o.classes || [])];
            o.parent = o.parent ? o.parent : DOM.body;
            o.events = o.events ? o.events : {};
            o.styles = o.styles ? o.styles : {};
            o.attributes = o.attributes ? o.attributes : {

            };
            o.attributes.id = id;
            return o;
        })(options);
        super(n);
        this.images = options.images || [];
        this.id = n.attributes.id;
        this.innerId = this.id + '-inner-id-0000';
        this.index = 0;
        this.buildCarousel();
    }

    buildCarousel() {
        const carousel = DOM.element('div', {
            parent: this.e,
            classes: [
                'carousel',
                'h-100'
            ],
            attributes: {
                id: this.innerId,
            },
            styles: {
                'z-index': "0"
            }
        });

        const inner = DOM.element('div', {
            parent: carousel,
            classes: [
                'carousel-inner',
                'h-100'
            ]
        });

        const item = DOM.element('div', {
            parent: inner,
            classes: [
                'carousel-item',
                'h-100',
                'd-flex',
                'align-items-center',
                'justify-content-center',
                'active'
            ]
        });

        this.spinnerId = inner.id + '-spinner';
        this.spinner = DOM.element('div', {
            parent: inner,
            classes: [
                'position-fixed',
                'spinner-border',
                'fade',
                'show',
            ],
            attributes: { role: 'status' },
            html: `<span class="visually-hidden">Loading...</span>`,
            styles: {
                'z-index': '1',
                top: '49.5vh',
                left: '49.5vw'
            }
        });

        this.slideId = inner.id + '-slide';
        this.slide = DOM.element('img', {
            parent: item,
            classes: [
                'd-block',
                'h-100',
                'fade'
            ],
            attributes: {
                id: this.slideId,
                src: this.images[0] ? this.images[0] : '',
                alt: 'Image'
            },
            styles: {
                'z-index': '0'
            },
            events: {
                load: () => {
                    this.spinner.classList.remove('show');
                    this.slide.classList.add('show');
                },
                error: () => {
                    console.error('Error loading image');
                }
            }
        });

        DOM.element('button', {
            parent: carousel,
            classes: ['carousel-control-prev'],
            attributes: { type: 'button', 'data-bs-slide': 'prev' },
            html: '<span class="carousel-control-prev-icon"></span><span class="visually-hidden">Previous</span>',
            events: {
                click: () => {
                    this.back();
                }
            }
        });

        DOM.element('button', {
            parent: carousel,
            classes: ['carousel-control-next'],
            attributes: { type: 'button', 'data-bs-slide': 'next' },
            html: '<span class="carousel-control-next-icon"></span><span class="visually-hidden">Next</span>',
            events: {
                click: () => {
                    this.forward();
                }
            }
        });
    }

    forward(){
        this.loading();
        if (this.index < (this.images.length - 1) && this.images.length > 0) {
            this.index++;
        } else {
            this.index = 0;
        }
        this.slide.src = this.images[this.index];
    }

    back(){
        this.loading();
        if (this.index > 0 && this.images.length > 0) {
            this.index--;
        } else {
            this.index = this.images.length - 1;
        }
        this.slide.src = this.images[this.index];
    }

    home() {
        this.loading();
        this.index = 0;
        this.slide.src = this.images[this.index];
    }

    loading() {
        this.spinner.classList.add('show');
        this.slide.classList.remove('show');
    }
}
