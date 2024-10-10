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
                'm-1',
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
                'max-width': '30vw',
                'min-width': '100px',
                'font-size': '0.65em'
            }
        }));
    }
}