import { Component } from "./component";

export class Switch extends Component {
    constructor(options) {
        super(Component.initOptions(options, {
            classes: [
                'form-check',
                'form-switch'
            ]
        }));
        this.build();
    }

    build() {
        if (!this.config.switchId) {
            this.config.switchId = `internal-switch-id-${Math.floor(Math.random() * 99999)}`;
        }
        this.checkbox = this.DOM.element('input', {
            parent: this.e,
            attributes: {
                type: 'checkbox',
                id: this.config.switchId
            },
            events: {
                change: () => this.dispatchEvent(new InputEvent('change'))
            },
            classes: ['form-check-input']
        });
        this.DOM.element('label', {
            parent: this.e,
            attributes: {
                classes: ['form-check-label'],
                for: this.config.switchId,
                text: this.labelText || ``
            }
        });
    }


    onChange = () => { };

}