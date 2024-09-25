export class Character {
    constructor(x, y) {
        this.elapsed = 0;
        this.scale = 11;
        this.speed = Math.random() * (26 - 3 + 1) + 3;
        this.maxTrail = Math.floor(Math.random() * (100 - 57 + 1) + 57);
        this.trail = [];
        this.text = this.randomChar();
        this.textElapsed = 0;
        this.textElapsedCheck = Math.random() * (111 - 20) + 20;
        this.x = x;
        this.y = y;

        for (let j = 0; j < this.maxTrail; j++) {
            this.trail[j] = {
                text: this.randomChar(),
                textElapsedCheck: Math.random() * (75 - 20) + 20,
                textElapsed: 0
            };
        }
    }

    randomChar() {
        let c = Math.round(Math.random() * (500 - 1) + 197);
        return String.fromCharCode(c);
    }

    draw(ctx) {
        this.textElapsed++;
        if (this.textElapsed >= this.textElapsedCheck) {
            this.text = this.randomChar();
        }
        let alpha = 100;
        let last = undefined;
        // Apply scaling and other styles
        ctx.font = `1.2em monospace`;  // Apply scaling to font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let n = 0; n < this.trail.length; n++) {
            ctx.fillStyle = "rgba(34,139,34," + alpha.toString() + ")";
            this.trail[n].textElapsed++;
            if (this.trail[n].textElapsed > this.trail[n].textElapsedCheck) {
                this.trail[n].text = this.randomChar();
            }
            let c = this.trail[n].text;
            let y = this.y - (this.scale * n) + (this.scale / 8);
            ctx.fillText(c, this.x, y);
            last = y;
        }
        this.y += this.speed;
        ctx.fillStyle = "#c6c6c6";
        ctx.fillText(this.text, this.x, this.y);
        if(last - 20 > ctx.canvas.height) {
          return true;
        }
        return false;
    }

}