import { Component } from "../bootstrap/component";

export class SectionBaseComponent extends Component {
    constructor(options = {}){
        super(options)
    }

    defaultOptions = {
        classes: [
        ],
        styles: {
            width: '86vw',
            //position: 'relative'
        }
    };
}