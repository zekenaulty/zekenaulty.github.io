import { Component } from "../bootstrap/component.js";
import { Character } from './character.js';

export class Matrix extends Component {
    constructor(options) {
        const n = ((options) => {
            const o = { ...options };
            o.tag = 'canvas';

            o.classes = [
                'position-fixed',
                ...(o.classes || [])];
            o.styles = o.styles ? o.styles : {};
            o.styles.top = '0px';
            o.styles.left = '0px';
            o.styles.zIndex = '-20';
            return o;
        })(options);
        super(n);

        this.ctx = this.e.getContext('2d');
        this.characters = [];
        this.maxCharacters = 31;

        const resizeHandler = () => {
            this.e.width = window.innerWidth;
            this.e.height = window.innerHeight;
        };
        resizeHandler();
        const self = this;
        Array.from({
            length: 13
        }, () => {
            setTimeout(() => {
                self.createCharacter(true);
                self.drawCharacters();
            }, 5);
        });
        this.animate();

        window.addEventListener('resize', resizeHandler);
    }

    createCharacter(scatterY = false) {
        if(this.characters.length >= this.maxCharacters) return;
        const x = Math.floor(Math.random() * (this.e.width + 20));
        const y = scatterY ? Math.floor(Math.random() * (this.e.height -40)) : -20; // Start from the top
        this.characters.push(new Character(x, y));
    }

    drawCharacters() {
        this.ctx.clearRect(0, 0, this.e.width, this.e.height);
        for (let i = 0;i<this.characters.length;i++) {
            const char = this.characters[i];
            if(char.draw(this.ctx)){
                this.characters.splice(i,1);
                this.createCharacter();
            }
        }
    }

    animate(self = undefined) {
        const r = self ? self : this;
        ((x)=>{
            x.drawCharacters();
            const ani = x.animate;
            window.requestAnimationFrame(() => ani(x));
        })(r);
    }
}
