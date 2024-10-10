import { Component } from './component.js';
import { DOM } from '../dom.js';
import { ImageLoader } from './imageLoader.js';

export class ImageCarousel extends Component {
    constructor(options = {}) {
        const o = Component.initOptions(options,{
            tag: 'div',
            attributes: {
                id: options.id == undefined || options.id == '' ? 'image-carousel-internal-id-' + Math.random() + 9999 : options.id
            }
        });
        super(o);
        this.images = options.images || [];
        this.id = o.attributes.id;
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

        this.imageLoader = new ImageLoader({
            parent: inner,
            aspectMode: 'height'
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
        this.imageLoader.image.src = this.images[this.index];
    }

    back(){
        this.loading();
        if (this.index > 0 && this.images.length > 0) {
            this.index--;
        } else {
            this.index = this.images.length - 1;
        }
        this.imageLoader.image.src = this.images[this.index];
    }

    home() {
        this.loading();
        this.index = 0;
        this.imageLoader.image.src = this.images[this.index];
    }

    loading() {
        this.imageLoader.loading();
    }
}
