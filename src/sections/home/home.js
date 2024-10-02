import { Section } from "../section";
import { ImageLoader } from '../../bootstrap/imageLoader.js';
import { Component } from "../../bootstrap/component.js";
import { TextAnimatedSpinIn } from "../../bootstrap/textAnimatedSpinIn.js";

export class Home extends Component {
  constructor(options = {}) {
    const n = ((options) => {
      const o = { ...options };
      o.classes = [
        ...(o.classes || [])];
      o.events = o.events ? o.events : {};
      o.styles = o.styles ? o.styles : {};
      o.attributes = o.attributes ? o.attributes : {};
      o.showHeader = false;
      o.sectionId = "home";
      return o;
    })(options);
    super(n);
    this.build();
  }

  build() {
    this.background = new ImageLoader({
      parent: this.e,
      src: '/assets/backgrounds/new-bg-0010.png',
      styles: {
        width: '98vw',
        height: '90vh',
        'z-index': '-1',
        'position': 'absolute',
        'top': '0px',
        'left': '0px'
      }
    });
    this.section = new Section({
      parent: this.e,
      id: 'home-section',
      sectionId: 'home',
      header: 'home',
      styles: {
        width: '98vw',
        height: '90vh',
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
        font: '3.3em monospace'
      });
      setTimeout(() => {
        this.text = new TextAnimatedSpinIn({
          parent: this.center,
          text: 'Developer, Designer, Artist, Programmer',
          font: '0.8em monospace'
        });
      }, 100);
    }, 500);


  }
}