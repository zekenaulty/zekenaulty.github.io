import { Component } from "../../bootstrap/component";


export class Skill extends Component {
    constructor(options = { skill: { name: '', description: '' } }) {
        if(!options.skill){
            options.skill = { name: '', description: '' };
        }
        super(Component.initOptions(options, {
            tag: 'span',
            classes: [
                'card',
                'p-1',
                'border',
                'border-light',
                'text-center'
            ],
            text: options.skill.name,
            attributes: {
                title: options.skill.description
            },
            styles: {
                'flex': '0 0 auto',
                'min-width': '120px',
                'max-width': '220px',
                'font-size': '0.75em',
                'white-space': 'normal'
            }
        }));
    }
}
