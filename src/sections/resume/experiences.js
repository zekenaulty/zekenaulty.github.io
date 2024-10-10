import { Component } from "../../bootstrap/component";
import { Experience } from "./experience";

export class Experiences extends Component{
    constructor(options = { experiences: [] }) {
        if(!options.experiences){
            options.experiences = [];
        }
        super(Component.initOptions(options, {
            tag: 'section',
            classes: [
                'd-flex',
                'flex-wrap',
                'justify-content-center'
            ],
        }));
        this.build();
    }

    build() {
        this.config.experiences.forEach(e => {
            new Experience({
                parent: this.e,
                experience: e
            });
        });
    }
}