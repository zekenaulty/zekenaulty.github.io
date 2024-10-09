import { Section } from "../section";
import { SectionBaseComponent } from "../sectionBaseComponent.js";
import { ResumeData } from './data/index.js';
import { Experiences } from "./experiences.js";
import { Skills } from "./skills.js";

export class Resume extends SectionBaseComponent {
  constructor(options = {}) {
    const o = SectionBaseComponent.initOptions(options, {
      sectionId: 'home'
    });
    super(o);
    this.build();
  }

  build() {
    this.section = new Section({
      parent: this.e,
      id: 'resume-section',
      sectionId: 'resume',
      header: 'resume',
      styles: {
        width: '86vw',
      }
    });

    this.experience = new Experiences({
      parent: this.section.body,
      experiences: ResumeData.experience.reverse()
    });

    this.skills = new Skills({
      parent: this.section.body,
      skills: ResumeData.skills
    });
  }
}