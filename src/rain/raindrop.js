export class RainDrop {
    constructor(x, y, emoji, enableSwirl) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.enableSwirl = enableSwirl;
        this.swirlDirection = Math.random() > 0.5 ? 1 : -1;
        this.swirlSpeed = Math.random() * 0.2;
        this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
    }

    draw(ctx) {
        ctx.font = `1.25em monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color; //'blue';
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.y += (Math.random() * 2) + 0.25;
        this.x -= (Math.random() * 0.7) + 0.1;
        
        if (this.enableSwirl) {
            
            if (Math.random() > 0.9) {
                const iid = setInterval(()=>{
                    this.x -= this.swirlSpeed * this.swirlDirection;
                    setTimeout(()=>clearInterval(iid), 1000);
                }, 25);
                this.swirlDirection *= -1;
            }

            if (Math.random() > 0.9) {
                const iid = setInterval(()=>{
                    this.y -= this.swirlSpeed * this.swirlDirection;
                    setTimeout(()=>clearInterval(iid), 1000);
                }, 25);
                this.swirlDirection *= -1;
            }
        } 
        
    }

    isOffScreen(height) {
        return this.y > height + 20;
    }
}