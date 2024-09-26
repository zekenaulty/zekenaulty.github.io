import { Component } from './bootstrap/component.js';
import { DOM } from './dom.js';

export class ImageCarousel extends Component {
    constructor(options = {}) {
        const n = ((options) => {
            const o = { ...options };
            o.tag = 'div';
            o.classes = [...(o.classes || [])];
            o.parent = o.parent ? o.parent : DOM.body;
            o.events = o.events ? o.events : {};
            o.styles = o.styles ? o.styles : {};
            o.attributes = o.attributes ? o.attributes : {};

            return o;
        })(options);
        super(n);
        this.images = options.images || [];
        this.buildCarousel();
        this.id = this.id || 'image-carousel-internal-id-' + Math.random() + 9999;
        this.innerId = this.id + '-inner-id-0000';
    }

    buildCarousel() {
        // Create carousel container
        const carousel = DOM.element('div', {
            parent: this.e,
            id: this.innerId,
            classes: [
                'carousel',
                //'slide',
                'h-100'
            ],
            attributes: {
                'data-bs-ride': 'carousel'
            }
        });

        // Create inner container for slides
        const inner = DOM.element('div', {
            parent: carousel,
            classes: [
                'carousel-inner',
                'h-100'
            ]
        });

        // Add slides
        this.images.forEach((imageUrl, index) => {
                console.info(imageUrl);
                const itemClasses = [
                    'carousel-item',
                    'h-100',
                    'd-flex',
                    'align-items-center',
                    'justify-content-center'
                ];
                const item = DOM.element('div', {
                    parent: inner,
                    classes: [
                        ...itemClasses,
                        ...(index === 0 ? ['active'] : [])
                    ]
                });
                DOM.element('img', {
                    parent: item,
                    classes: [
                        'd-block', 
                        'h-100',
                    ],
                    attributes: {
                        src: imageUrl,
                        alt: 'Image'
                    }
                });
        });

        // Carousel controls (optional)
        DOM.element('button', {
            parent: carousel,
            classes: ['carousel-control-prev'],
            attributes: { type: 'button', 'data-bs-target': '#' + this.innerId, 'data-bs-slide': 'prev' },
            html: '<span class="carousel-control-prev-icon"></span><span class="visually-hidden">Previous</span>'
        });

        DOM.element('button', {
            parent: carousel,
            classes: ['carousel-control-next'],
            attributes: { type: 'button', 'data-bs-target': '#' + this.innerId, 'data-bs-slide': 'next' },
            html: '<span class="carousel-control-next-icon"></span><span class="visually-hidden">Next</span>'
        });
    }
}

// Initialize the gallery with the imported image data
/*
const gallery = new ImageCarousel({ images: imageData['your-category'] }); // Load a specific category
gallery.mount(DOM.body);
*/

