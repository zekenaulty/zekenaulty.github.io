import { ImageCarousel } from "../../bootstrap/imageCarousel"
import imageData from './sacred-geometry.json';

export class SacredGeometry extends ImageCarousel {
    constructor(options) {
        super(options);
        this.addDropdown();
    }

    addDropdown() {
        const div = this.DOM.element('div', {
            parent: this.e,
            classes: [
                'position-absolute',
                'w-100',
                'd-flex',
                'justify-content-end',
                'align-items-start'

            ],
            attributes: {
                'z-index': '1030'
            },
            styles: {
                top: '6px',
                right: '8px'
            },

        });

        const header = this.DOM.element('span', {
            parent: div,
            classes: [
                'h5',
                'me-2',
                'mt-auto'
            ],
            text: 'Sacred Geometry '
        });

        const select = this.DOM.element('select', {
            parent: div,
            classes: [
                'form-select', 
                'w-auto'
            ],
            events: {
                change: () => {
                    this.index = 0;
                    this.images = imageData[this.keys[select.selectedIndex]];
                    this.home();
                }
            }
        });

        this.keys = [];
        for (const key in imageData) {
            const op = document.createElement("option");
            op.text = key;
            op.value = key;
            select.add(op);
            this.keys.push(key);
        }
        select.selectedIndex = 0;
        this.images = imageData[this.keys[0]];
        this.home();
    }
}