import { Component } from '../bootstrap/component.js';
import { Switch } from '../bootstrap/switch.js';
import { Matrix } from './matrix.js';

export class MatrixSwitch extends Component {
    constructor(options = {}) {
        super(Component.initOptions(options, {
            tag: 'section',
            classes: [
                'd-flex',
                'flex-nowrap',
            ]
        }));
        this.build();
    }

    build() {
        
        this.matrix = undefined;
        this.DOM.element('span', {
            parent: this.e,
            html: 'Matrix&nbsp;&nbsp;',
            classes: [],
            styles: {
                'line-height': 1.2
            }
        });
        this.matrixSwitch = new Switch({
            parent: this.e,
        });
        this.matrixSwitch.addEventListener('change', ()=>{
            if(!this.matrix){
                this.matrix = new Matrix({
                    parent: this.DOM.body,
                });
            } else {
                this.matrix.unmount();
                this.matrix = undefined;
            }
        });
    }
}