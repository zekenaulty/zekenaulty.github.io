import { GearsWorking } from "./GearsWorking";

class Gear {
    x: number = 0;
    y: number = 0;
    outerRadius: number = 25;
    innerRadius: number = 15;
    holeRadius: number = 6;
    numTeeth: number = 12;
    theta: number = 0.5;
    thetaSpeed: number = 0.01;
    clockwise: boolean = true;
    midRadius: number = 1;

    constructor(config: { x: number; y: number; outerRadius: number; innerRadius: number; holeRadius: number; numTeeth: number; theta: number; thetaSpeed: number; clockwise: boolean }) {
        Object.assign(this, config, { midRadius: config.outerRadius - 10 });
    }

    drawGear(ani: GearsWorking, scale: number = 1, style: string = 'silver', join: CanvasLineJoin = "bevel"): void {

        const context = ani.getContext();
        context.save();

        context.lineJoin = join;
        context.fillStyle = style;
        context.strokeStyle = style;
        context.scale(scale, scale);
        context.beginPath();
        const numPoints = this.numTeeth * 2;
        for (let n = 0; n < numPoints; n++) {
            const radius = n % 3 === 0 ? this.outerRadius : this.innerRadius;
            const theta = ((Math.PI * 2) / numPoints) * (n + 1);
            const [x, y] = [radius * Math.sin(theta), radius * Math.cos(theta)];
            n === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.fill();
        context.globalCompositeOperation = 'destination-out';

        // Draw a circle in the center using holeRadius
        context.beginPath();
        context.arc(0, 0, this.holeRadius, 0, Math.PI * 2);
        context.fillStyle = 'black';
        context.fill();

        // Create a new path for the central circle and draw it again without affecting transparency
        context.beginPath();
        context.arc(0, 0, this.holeRadius, 0, Math.PI * 2);
        context.closePath();
        context.fill();

        // Draw small circles at the corners of the central circle
        const outsideCC = this.holeRadius + (this.holeRadius * 0.35);
        const cornerRadius = outsideCC * 0.15; // Adjust the size of the small circles
        const cornerPoints = [
            [0, -outsideCC], // Top
            [outsideCC, 0],  // Right
            [0, outsideCC],  // Bottom
            [-outsideCC, 0], // Left
        ];

        cornerPoints.forEach(([cx, cy]) => {
            context.beginPath();
            context.arc(cx, cy, cornerRadius, 0, Math.PI * 2);
            context.fill();
        });

        context.restore();
    }

    draw(ani: GearsWorking): void {
        const context = ani.getContext();
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.theta);
        this.drawGear(ani);
        context.restore();
    }
}

export { Gear };