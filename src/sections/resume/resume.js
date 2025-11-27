import { Section } from "../section";
import { SectionBaseComponent } from "../sectionBaseComponent.js";
import { ResumeData } from './data/index.js';
import { Experiences } from "./experiences.js";
import { Skills } from "./skills.js";

export class Resume extends SectionBaseComponent {
  constructor(options = {}) {
    const o = SectionBaseComponent.initOptions(options, {
      sectionId: 'resume'
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

    this.container = this.DOM.element('div', {
      parent: this.section.body,
      classes: ['d-flex', 'flex-column', 'align-items-center', 'w-100']
    });

    this.buildProfileSelector();
    this.buildSummary();
    this.buildExperience();
    this.buildSkills();
    this.renderProfile(ResumeData.profiles.defaultProfileId);
  }

  buildProfileSelector() {
    const wrapper = this.DOM.element('div', {
      parent: this.container,
      classes: ['d-flex', 'justify-content-between', 'align-items-center', 'mb-2', 'flex-wrap'],
      styles: {
        width: '100%',
        'max-width': '1080px',
        padding: '0 1rem'
      }
    });

    this.DOM.element('header', {
      parent: wrapper,
      html: 'Experience',
      classes: ['h5', 'm-0']
    });

    const selectLabel = this.DOM.element('label', {
      parent: wrapper,
      classes: ['form-label', 'me-2', 'text-light', 'mb-0', 'mt-2', 'mt-sm-0'],
      text: 'Profile:'
    });

    this.profileSelector = this.DOM.element('select', {
      parent: wrapper,
      classes: ['form-select', 'form-select-sm', 'w-auto', 'bg-dark', 'text-light', 'border-secondary', 'ms-auto'],
      events: {
        change: (e) => this.renderProfile(e.target.value)
      }
    });

    ResumeData.profiles.all.forEach((p) => {
      this.DOM.element('option', {
        parent: this.profileSelector,
        text: p.label,
        attributes: { value: p.id }
      });
    });

    selectLabel.htmlFor = this.profileSelector.id = 'profile-selector';
  }

  buildSummary() {
    this.headline = this.DOM.element('header', {
      parent: this.container,
      classes: ['h6', 'text-center', 'mt-2'],
      styles: {
        width: '100%',
        'max-width': '1080px',
        padding: '0 1rem'
      }
    });

    this.aboutContainer = this.DOM.element('div', {
      parent: this.container,
      classes: ['mb-3'],
      styles: {
        width: '100%',
        'max-width': '1080px',
        padding: '0 1rem'
      }
    });
  }

  buildExperience() {
    this.experienceWrapper = this.DOM.element('div', {
      parent: this.container,
      styles: {
        width: '100%',
        'max-width': '1080px',
        padding: '0 1rem'
      }
    });
  }

  buildSkills() {
    this.DOM.element('header', {
      parent: this.container,
      html: 'Skills',
      classes: ['h5', 'text-center', 'mt-3']
    });

    this.skillsWrapper = this.DOM.element('div', {
      parent: this.container,
      styles: {
        width: '100%',
        'max-width': '1080px',
        padding: '0 1rem'
      }
    });
  }

  renderProfile(profileId) {
    const view = this.deriveProfileView(profileId);
    const profile = view.profile;

    this.profileSelector.value = profile.id;
    this.headline.textContent = profile.headline || profile.label;

    this.aboutContainer.innerHTML = '';
    view.aboutParagraphs.forEach((p) => {
      this.DOM.element('p', {
        parent: this.aboutContainer,
        text: p,
        classes: ['mb-2']
      });
    });

    this.experienceWrapper.innerHTML = '';
    this.experience = new Experiences({
      parent: this.experienceWrapper,
      experiences: view.experiences
    });

    this.skillsWrapper.innerHTML = '';
    const orderedSkills = [...view.skillsPrimary, ...view.skillsSecondary, ...view.skillsOther];
    this.skills = new Skills({
      parent: this.skillsWrapper,
      skills: orderedSkills
    });
  }

  deriveProfileView(profileId) {
    const defaultId = ResumeData.profiles.defaultProfileId;
    const profile = ResumeData.profiles.byId[profileId] || ResumeData.profiles.byId[defaultId];
    const about = ResumeData.aboutVariants[profile.aboutKey] || ResumeData.aboutVariants.master || { paragraphs: [] };

    const experienceMap = new Map();
    ResumeData.experience.forEach((exp) => {
      const job = Array.isArray(exp) ? exp : [exp];
      job.forEach((e) => experienceMap.set(e.id, e));
    });

    const orderedExperiences = [];
    (profile.experienceOrder || []).forEach((id) => {
      const base = experienceMap.get(id);
      if (!base) return;
      const override = (profile.experienceOverrides || {})[id];
      const merged = { ...base };
      if (override) {
        if (override.title) merged.title = override.title;
        if (override.description) merged.description = override.description;
      }
      orderedExperiences.push(merged);
    });

    const skillMap = new Map();
    (ResumeData.skills || []).forEach((s) => skillMap.set(s.name, s));
    const primaryNames = profile.skillsPrimary || [];
    const secondaryNames = profile.skillsSecondary || [];
    const primarySet = new Set(primaryNames);
    const secondarySet = new Set(secondaryNames);

    const skillsPrimary = primaryNames.map((name) => skillMap.get(name)).filter(Boolean);
    const skillsSecondary = secondaryNames.map((name) => skillMap.get(name)).filter(Boolean);
    const skillsOther = (ResumeData.skills || []).filter((s) => !primarySet.has(s.name) && !secondarySet.has(s.name));

    return {
      profile,
      headline: profile.headline,
      aboutParagraphs: about.paragraphs || [],
      experiences: orderedExperiences,
      skillsPrimary,
      skillsSecondary,
      skillsOther
    };
  }
}
