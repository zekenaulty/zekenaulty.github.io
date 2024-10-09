import { Section } from "../section";
import { SectionBaseComponent } from "../sectionBaseComponent.js";
import { HomeText } from "./homeText.js";

export class Home extends SectionBaseComponent {
  constructor(options = {}) {
    const o = SectionBaseComponent.initOptions(options,{
        sectionId: 'home'
    });
    super(o); 
    this.build();
  }

  
  defaultOptions = {
    classes: [
    ],
    styles: {
        width: '86vw',
        height: '98vh',
        position: 'relative'
    }
};

  build() {
    this.section = new Section({
      parent: this.e,
      id: 'home-section',
      sectionId: 'home',
      header: 'home',
      styles: {
        width: '86vw',
        height: '100vh',
        position: 'relative'
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
    this.animeText = new HomeText({
      parent: this.center
    });
    this.animeText.start();

  }
}