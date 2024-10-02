import { Component } from './component.js';

export class ImageLoader extends Component {
  constructor(options = {}) {
    const o = Component.initOptions(options, {
      tag: 'div',
      classes: [],
      attributes: {
        id: options.id === undefined || options.id === '' ? 'image-loader-id-' + Math.random() + 9999 : options.id
      },
      styles: {
        'overflow': 'hidden',
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
      }
    });
    super(o);
    this.build();
  }

  build() {

    this.spinnerId = this.id + '-spinner';
    this.spinner = this.DOM.element('div', {
      parent: this.e,
      classes: [
        'fade',
        'show',
      ],
      attributes: { role: 'status' },
      html: `<div class="spinner-border"><span class="visually-hidden">Loading...</span></div>`,
      styles: {
        'z-index': '1',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    });

    this.imageId = this.id + '-img';
    this.image = this.DOM.element('img', {
      parent: this.e,
      classes: [
        'fade'
      ],
      attributes: {
        id: this.imageId,
        src: this.config.src,
        alt: 'Image'
      },
      styles: {
        'z-index': '0',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        'background-size': 'auto'
      },
      events: {
        load: () => {
          this.spinner.classList.remove('show');
          this.image.classList.add('show');
        },
        error: () => {
          console.error('Error loading image');
        }
      }
    });

    if(this.config.aspectMode == 'height'){
      this.image.classList.add('h-100');
    } else if(this.config.aspectMode == 'width'){
      this.image.classList.add('w-100');
    } else if(this.config.aspectMode == 'fit'){
      this.image.classList.add('h-100');
      this.image.classList.add('w-100');
    }
  }


  loading() {
    this.spinner.classList.add('show');
    this.image.classList.remove('show');
  }

}
