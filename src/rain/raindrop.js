export class RainDrop {
    constructor(x, y, emoji, enableSwirl) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.enableSwirl = enableSwirl;
        this.swirlDirection = Math.random() > 0.5 ? 1 : -1;
        this.swirlSpeed = Math.random() * 0.2 + 0.1;  // Slightly faster swirl
        this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
        
        // For spiraling motion
        this.angle = Math.random() * Math.PI * 360; // Starting angle in radians
        this.radius = Math.random() * 21 + -11; // Radius of the spiral motion

        // For scaling the size of the raindrop
        this.scale = 1;
        this.scaleDirection = 1;  // Controls whether we are upscaling or downscaling
        this.scaleSpeed = 0.005;  // Speed at which the raindrop scales
    }

    /*
    draw(ctx) {
        ctx.save();
        ctx.font = `${this.scale.toFixed(4)}em monospace`;  // Apply scaling to font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color;
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.restore();
    }
    */

    draw(ctx) {
        ctx.save();  // Save the canvas state
    
        // Translate the canvas to the raindrop's position
        ctx.translate(this.x, this.y);
    
        // Apply rotation (in radians) - this.angle controls the rotation
        ctx.rotate(this.angle);
    
        // Apply scaling and other styles
        ctx.font = `${this.scale.toFixed(2)}em monospace`;  // Apply scaling to font size
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color;
    
        // Draw the emoji at the origin (0,0) since we have already translated to (x, y)
        ctx.fillText(this.emoji, 0, 0);
    
        ctx.restore();  // Restore the canvas state to avoid affecting other drawings
    }
    
    /*
    update() {
        // Update the vertical position (falling)
        this.y += (Math.random() * 2) + 0.25;

        // Swirling/spiraling motion using sine and cosine for smooth arcs
        if (this.enableSwirl) {
            this.angle += this.swirlSpeed * this.swirlDirection; // Increment angle for swirling motion
            this.x += Math.cos(this.angle) * this.radius;
            this.y += Math.sin(this.angle) * this.radius / 2;  // Make vertical movement smaller for better effect
        } else {
            this.x -= (Math.random() * 0.7) + 0.1;
        }

        // Scaling effect - oscillate between 1 and 1.5 in size
        this.scale += this.scaleSpeed * this.scaleDirection;
        if (this.scale > 1.5 || this.scale < 1) {
            this.scaleDirection *= -1;  // Reverse scaling direction when limits are hit
        }

    }
    */
    update() {
        // Update the vertical position (falling)
        this.y += (Math.random() * 2) + 0.25;
    
        // Swirling/spiraling motion using sine and cosine for smooth arcs
        if (this.enableSwirl) {
            this.angle += this.swirlSpeed * this.swirlDirection; // Increment angle for swirling motion
            this.x += Math.cos(this.angle) * this.radius;
            this.y += Math.sin(this.angle) * this.radius / 2;  // Make vertical movement smaller for better effect
        } else {
            this.x -= (Math.random() * 0.7) + 0.1;
        }
    
        // Scaling effect - oscillate between 1 and 1.5 in size
        this.scale += this.scaleSpeed * this.scaleDirection;
        if (this.scale > 1.5 || this.scale < 1) {
            this.scaleDirection *= -1;  // Reverse scaling direction when limits are hit
        }
    
        // Spin the raindrop clockwise as it falls
        this.angle += 0.05;  // Control the speed of the spin (adjust as needed)
    }
    

    isOffScreen(height) {
        return this.y > height + 20;
    }
}
