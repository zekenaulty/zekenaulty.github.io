import { Section } from "../section.js";
import { SectionBaseComponent } from "../sectionBaseComponent.js";
import { SacredGeometry } from "./sacredGeometry.js";

export class ArtGallery extends SectionBaseComponent {
  constructor(options = {}) {
    const o = SectionBaseComponent.initOptions(options,{
        sectionId: 'gallery'
    });
    super(o); 
    this.build();
  }

  build() {
    this.section = new Section({
      parent: this.e,
      id: 'art-gallery-section',
      sectionId: 'gallery',
      header: 'gallery',
      styles: {
        width: '88vw',
      }
    });

    this.images = new SacredGeometry({
      parent: this.section.body,
      styles: {
          width: '100%',
          height: '90vh',
      }
  });


  }
}