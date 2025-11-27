import { Component } from "../../bootstrap/component";
import { Skill } from "./skill";

export class Skills extends Component{
    constructor(options = { skills: [] }) {
        if(!options.skills){
            options.skills = [];
        }
        super(Component.initOptions(options, {
            tag: 'section',
            classes: [
                'd-flex',
                'flex-wrap',
                'justify-content-center',
                'gap-2',
                'w-100'
            ],
            styles: {
                width: '86vw',
                'max-width': '900px',
                'min-width': '320px',
                margin: '0 auto'
            }
        }));
        this.build();
    }

    build() {
        this.config.skills.forEach(s => {
            new Skill({
                parent: this.e,
                skill: s
            });
        });
    }
}
