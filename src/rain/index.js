import { Component } from "../bootstrap/component";
import { RainDrop } from './raindrop.js';
import { Emoji } from './emoji.js';

export class Rain extends Component {
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
            o.styles.zIndex = '-1';
            return o;
        })(options);
        super(n);
        this.emojis = new Emoji();
        this.ctx = this.e.getContext('2d');
        this.rainDrops = [];
        this.emoji = options.emoji ? options.emoji : this.emojis.getRandomEmoji(); //'☔️';
        this.enableSwirlToggle = options.swirl ? options.swirl : Math.random() > 0.5;
        this.maxDrops = 375;
        const resizeHandler = () => {
            this.e.width = window.innerWidth;
            this.e.height = window.innerHeight;
        };
        resizeHandler();
        const self = this;
        Array.from({
            length: 155
        }, () => {
            setTimeout(() => {
                self.createRainDrop(true);
                self.updateRainDrops();
            }, 5);
        });
        this.animate();

        window.addEventListener('resize', resizeHandler);
    }

    createRainDrop(scatterY = false) {
        if(this.rainDrops.length >= this.maxDrops) return;
        const x = Math.floor(Math.random() * (this.e.width + 300));
        const y = scatterY ? Math.floor(Math.random() * (this.e.height - 40)) : -20; // Start from the top
        const enableSwirl = this.enableSwirlToggle && Math.random() > 0.5; // Randomly enable swirl effect
        this.rainDrops.push(new RainDrop(x, y, this.emojis.getRandomEmoji(), true/* enableSwirl */));
    }

    updateRainDrops() {
        for (let i = this.rainDrops.length - 1; i >= 0; i--) {
            let rainDrop = this.rainDrops[i];
            rainDrop.update();
            if (rainDrop.isOffScreen(this.e.height)) {
                this.rainDrops.splice(i, 1);
                this.createRainDrop();
                rainDrop = undefined;
            }
        }
    }

    drawRainDrops() {
        this.ctx.clearRect(0, 0, this.e.width, this.e.height);
        for (const rainDrop of this.rainDrops) {
            rainDrop.draw(this.ctx);
        }
    }

    animate(self = undefined) {
        const r = self ? self : this;
        setTimeout(() => {
            ((x) => {
                x.updateRainDrops();
                x.drawRainDrops();
                if (Math.random() > 0.7) {
                    x.createRainDrop();
                }
                const ani = x.animate;
                setTimeout(() => window.requestAnimationFrame(() => ani(x)), 1);
            })(r);
        }, 1);
    }
}
