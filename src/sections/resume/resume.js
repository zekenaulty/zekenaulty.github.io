import { Section } from "../section";
import { ImageLoader } from '../../bootstrap/imageLoader.js';
import { Component } from "../../bootstrap/component.js";
import { ResumeData } from './data/index.js';

export class Resume extends Component {
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
      src: '/assets/backgrounds/new-bg-0024.png',
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
      id: 'resume-section',
      sectionId: 'resume',
      header: 'resume',
      styles: {
        width: '100vw',
        height: '100vh',
        'position': 'absolute',
        'top': '0px',
        'left': '0px'
      }
    });

    this.skills = this.DOM.element('section', {
        parent: this.section.body,
        classes: ['d-flex'],
        styles: {
            'max-width': '30vw',
            'position': 'absolute',
            'top': '0px',
            'left': '0px',
            'height': '88vh'
        }
    });
    this.skills.setAttribute('data-simplebar', '');

    ResumeData.skills.forEach(s => {
        const span = this.DOM.element('span', {
            parent: this.skills,
            text: s.name,
            classes: ['alert', 'alert-secondary'],
            attributes: {
                title: s.description
            },
            styles: {
                font: '0.65em monospace'
            }
        });
    });


    this.experience = this.DOM.element('section', {
        parent: this.section.body,
        styles: {
            'max-width': '70vw',
            'position': 'absolute',
            'top': '0px',
            'left': '30vw',
            'max-height': '88vh'
        }
    });
    this.experience.setAttribute('data-simplebar', '');

  }
}