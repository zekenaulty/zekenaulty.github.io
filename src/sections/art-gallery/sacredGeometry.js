
import { Component } from "../../bootstrap/component";
import { ImageCarousel } from "../../bootstrap/imageCarousel"
import imageData from './sacred-geometry.json';

export class SacredGeometry extends Component {
    constructor(options) {
        const o = Component.initOptions(options,{
            tag: 'section',
            classes: ['position-relative']
        });
        super(o); 
        this.buildCarousel();
        this.buildDropdown();
    }

    buildCarousel(){
        this.carousel = new ImageCarousel({
            parent: this.e,
            classes: [
                'position-absolute',
                'w-100',
                'h-100'
            ],
            attributes: {
            },
            styles: {
                top: '0px',
                right: '0px',
                'z-index': '0',
                //width: this.e.parentNode.style.width,
                //height: this.e.parentNode.style.height,
            },
        });
    }

    buildDropdown() {
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
                'z-index': '1039'
            },
            styles: {
                top: '6px',
                right: '8px'
            },

        });
/* 
        const header = this.DOM.element('span', {
            parent: div,
            classes: [
                'position-relative',
                'h5',
                'me-2',
                'mt-auto'
            ],
            text: 'Sacred Geometry '
        });
 */
        const select = this.DOM.element('select', {
            parent: div,
            classes: [
                'form-select', 
                'w-auto'
            ],
            events: {
                change: () => {
                    this.carousel.index = 0;
                    this.carousel.images = imageData[this.keys[select.selectedIndex]];
                    this.carousel.home();
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
        this.carousel.images = imageData[this.keys[0]];
        this.carousel.home();
    }
}