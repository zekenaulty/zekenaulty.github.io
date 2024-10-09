import { TextAnimatedSpinIn } from "../../animejs/textAnimatedSpinIn";

export class HomeText {
    constructor(options = {}){
        this.delay = 750;
        this.next = options.next || (() => {}); //nop
        this.parent = options.parent || document.body;
    }

    start() {
    setTimeout(() => {
        this.text = new TextAnimatedSpinIn({
          parent: this.parent,
          text: 'Zeke Naulty',
          font: '2.3em monospace'
        });
  
        setTimeout(() => {
          this.text = new TextAnimatedSpinIn({
            parent: this.parent,
            text: 'Developer, Designer, Artist, Programmer',
            font: '0.65em monospace'
          });
        }, 100);
      }, 500);
    }
}