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
                //'d-none',
                //'d-sm-block'
            ]
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