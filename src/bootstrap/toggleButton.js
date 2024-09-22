import { DOM } from '../dom.js';
import { Component } from './component.js';

export class ToggleButton extends Component {
    constructor(options = {}){
        const o = { ...options };
        const f = (() => {
            o.tag = 'button';
            o.classes = [
                'btn', 
                'text-center',
                 ...(o.classes || [])];
            o.parent ? o.parent : DOM.body;
            Object.assign(o.events, o.events || {});
        })();
        super(o);

        const menuIcon = DOM.element('i', {
            parent: this.e,
            classes: ['bi', 'bi-list'],
            id: 'menuIcon-internal-0000'
        });

        const closeIcon = DOM.element('i', {
            parent: this.e,
            classes: ['bi', 'bi-x-lg'],
            id: 'closeIcon-internal-0000'
        });

        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';   

        this.e.addEventListener('click', () => {
            if (menuIcon.style.display !== 'none') {
              menuIcon.style.display = 'none';
              closeIcon.style.display = 'block';
            } else {
              menuIcon.style.display = 'block';
              closeIcon.style.display = 'none';   
            }
          });
    }
}
/*
<button type="button" class="btn btn-primary" id="myButton">
  <i class="bi bi-list" id="menuIcon"></i>
  <i class="bi bi-x-lg" id="closeIcon" style="display: none;"></i>
</button>
*/