import { Component } from "../../bootstrap/component";

const def = { title: '', company: '', location: '', dates: { start: '', end: '' }, description: [] };
export class Experience extends Component {
    constructor(options = { experience: def }) {
        if (!options.experience) {
            options.experience = def;
        }
        super(Component.initOptions(options, {
            tag: 'span',
            classes: [
                'card',
                'm-2',
                'p-2',
                'border',
                'border-light'
            ],
            styles: {
                'max-width': '30vw'
            }
        }));
        this.build();
    }

    build(){
        const e = this.config.experience;
        this.title = this.DOM.element('header',{
            parent: this.e,
            text: `${e.company}: ${e.title}`,
            classes: ['h4']
        });

        this.period = this.DOM.element('header',{
            parent: this.e,
            text: `${e.location}: ${e.dates.start} - ${e.dates.end}`,
            classes: ['h5']
        });

        this.list = this.DOM.element('ul',{
            parent: this.e
        });

        e.description.forEach(i => {
            this.DOM.element('li', {
                parent: this.list,
                text: i
            });
        });
    }
}