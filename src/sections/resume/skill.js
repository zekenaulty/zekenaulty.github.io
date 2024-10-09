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
                'm-2',
                'p-2'
            ],
            text: options.skill.name,
            attributes: {
                title: options.skill.description
            },
            styles: {
                'max-width': '30vw'
            }
        }));
    }
}