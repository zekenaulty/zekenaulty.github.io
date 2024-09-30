import { Component } from './component.js';

export class ImageLoader extends Component {
  constructor(options = {}) {
    const o = Component.initOptions(options,{
      tag: 'div',
      attributes: {
          id: options.id == undefined || options.id == '' ? 'image-loader-id-' + Math.random() + 9999 : options.id
      },
      styles: {
        'min-width': '100vw',
        'min-height': '100vh'
      }
  });
  super(o);
    this.build();
  }

  build() {

    this.spinnerId = this.id + '-spinner';
    this.spinner = DOM.element('div', {
      parent: this.e,
      classes: [
        'position-relative',
        'spinner-border',
        'fade',
        'show',
      ],
      attributes: { role: 'status' },
      html: `<span class="visually-hidden">Loading...</span>`,
      styles: {
        'z-index': '1',
        //top: '49.5vh',
        //left: '49.5vw',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    });

    this.imageId = this.id + '-img';
    this.image = DOM.element('img', {
      parent: this.e,
      classes: [
        'd-block',
        'h-100',
        'fade'
      ],
      attributes: {
        id: this.imageId,
        src: this.config.src,
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

  }
}
