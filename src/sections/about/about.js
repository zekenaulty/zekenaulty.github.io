import { Section } from "../section";
import { ImageLoader } from '../../bootstrap/imageLoader.js';
import { Component } from "../../bootstrap/component.js";

import * as $about from '../resume/data/aboutMe.json';

export class About extends Component {
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
      src: '/assets/backgrounds/new-bg-0006.png',
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
      id: 'about-section',
      sectionId: 'about',
      header: 'about',
      styles: {
        width: '98vw',
        height: '90vh',
        'position': 'absolute',
        'top': '0px',
        'left': '0px'
      }
    });

    this.section.body.innerHTML = $about.default.join(' ');


  }
}