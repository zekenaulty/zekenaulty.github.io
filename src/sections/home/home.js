import { Section } from "../section";
import { ImageLoader } from '../../bootstrap/imageLoader.js';
import { Component } from "../../bootstrap/component.js";
import { TextAnimatedSpinIn } from "../../bootstrap/textAnimatedSpinIn.js";

export class Home extends Component {
  constructor(options = {}) {
    const o = Component.initOptions(options,{
        sectionId: 'home'
    });
    super(o); 
    this.build();
  }

  build() {
    this.background = new ImageLoader({
      parent: this.e,
      src: '/assets/backgrounds/new-bg-0028.png',
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
      id: 'home-section',
      sectionId: 'home',
      header: 'home',
      styles: {
        width: '100vw',
        height: '100vh',
        'position': 'absolute',
        'top': '0px',
        'left': '0px'
      }
    });

    this.center = this.DOM.element('div', {
      parent: this.section.body,
      classes: [],
      styles: {
        'z-index': '2',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    });

    setTimeout(() => {
      this.text = new TextAnimatedSpinIn({
        parent: this.center,
        text: 'Zeke Naulty',
        font: '2.3em monospace'
      });
      setTimeout(() => {
        this.text = new TextAnimatedSpinIn({
          parent: this.center,
          text: 'Developer, Designer, Artist, Programmer',
          font: '0.65em monospace'
        });
      }, 100);
    }, 500);


  }
}