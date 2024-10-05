import { Section } from "../section.js";
import { ImageLoader } from '../../bootstrap/imageLoader.js';
import { Component } from "../../bootstrap/component.js";
import { TextAnimatedSpinIn } from "../../bootstrap/textAnimatedSpinIn.js";

export class ArtGallery extends Component {
  constructor(options = {}) {
    const o = Component.initOptions(options,{
        sectionId: 'gallery'
    });
    super(o); 
    this.build();
  }

  build() {
    this.background = new ImageLoader({
      parent: this.e,
      src: '/assets/backgrounds/new-bg-0019.png',
      styles: {
        width: '100vw',
        height: '100vh',
        'z-index': '-1',
        'position': 'absolute',
        'top': '0px',
        'left': '0px',
        'opacity': '0.5'
      }
    });
    this.section = new Section({
      parent: this.e,
      id: 'art-gallery-section',
      sectionId: 'gallery',
      header: 'gallery',
      styles: {
        width: '100vw',
        height: '100vh',
        'position': 'absolute',
        'top': '0px',
        'left': '0px'
      }
    });

    this.images = new SacredGeometry({
      parent: this.section.body,
      styles: {
          width: '100vw',
          height: '90vh',
      }
  });


  }
}