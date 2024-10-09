import { DOM } from '../dom.js';
import { Home } from './home/home.js';
import { About } from './about/about.js';
import { Resume } from './resume/resume.js';
import { ArtGallery } from './art-gallery/artGallery.js';

import * as sitemap from '../sitemap.json';

const components = {
    home: Home,
    about: About,
    resume: Resume,
    gallery: ArtGallery
};

export class Sections {
    constructor(options = {}) {
        this.parent = options.parent || document.body;
        this.sections = sitemap.default.sections;
        this.keys = sitemap.default.keys;
        this.build();
    }

    build() {
        this.container = DOM.element('section', {
            parent: this.parent,
            id: 'section-boss-internal-0000',
            classes: [
                'position-relative',
                'border-light',
                'border-start',
                'border-end',
                'bg-dark'
            ],
            styles: {
                top: 'vh',
                left: '5vw',
                width: '90vw',
                'max-height': '100vh',
                opacity: 0.75
            },
            attributes: {
                id: 'section-boss-internal-0000'
            }
        });
        this.container.setAttribute('data-simplebar', '');

        this.components = {};
        this.keys.map((key) => {
            const section = components[key];
            if (section) {
                const ops = section.defaultOps || {};
                if (section) {
                    this.components[key] = new section({
                        parent: this.container,
                        ...ops
                    });
                }
            }
        });
    }
}
