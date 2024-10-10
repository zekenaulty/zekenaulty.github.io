import { Component } from '../bootstrap/component.js';
import { Switch } from '../bootstrap/switch.js';
import { Rain } from './rain.js';

export class RainSwitch extends Component {
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
        
        this.rain = undefined;
        this.DOM.element('span', {
            parent: this.e,
            html: 'Paisley&nbsp;&nbsp;',
            classes: [],
            styles: {
                'line-height': 1.2
            }
        });
        this.rainSwitch = new Switch({
            parent: this.e,
        });
        this.rainSwitch.addEventListener('change', ()=>{
            if(!this.rain){
                this.rain = new Rain({
                    parent: this.DOM.body,
                });
            } else {
                this.rain.unmount();
                this.rain = undefined;
            }
        });
    }
}