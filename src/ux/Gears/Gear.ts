import { GearsWorking } from "./GearsWorking";

interface GearConfig {
    x: number;
    y: number;
    outerRadius?: number;
    innerRadius?: number;
    holeRadius?: number;
    numTeeth?: number;
    theta?: number;
    thetaSpeed?: number;
    clockwise?: boolean;
    midRadius?: number;
    fillStyle?: string;
    lineStyle?: string;
}

class Gear implements GearConfig {
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
    fillStyle: string = "silver";
    lineStyle: string = "black";
    size: number;
    radius: number;
    offset: number;

    private canvas: HTMLCanvasElement | null = null;

    private static DEFAULT: GearConfig = {
        x: 0,
        y: 0,
        outerRadius: 45,
        innerRadius: 30,
        holeRadius: 10,
        numTeeth: 12,
        theta: 0,
        thetaSpeed: 0.01,
        clockwise: false,
        fillStyle: 'black',
        lineStyle: 'silver',
        midRadius: 35
    };

    constructor(config: GearConfig = Gear.DEFAULT) {
        Object.assign(this, Gear.DEFAULT);
        Object.assign(this, config, { midRadius: config.outerRadius ? config.outerRadius - 10 : Gear.DEFAULT.outerRadius! - 10 });
        this.size = Math.max(this.outerRadius, this.innerRadius) * 2;
        this.offset = this.size / 2;
        this.radius = this.size / 2;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
    }

    private drawGearToContext(context: CanvasRenderingContext2D) {
        context.save();
        context.clearRect(-1, -1, this.size + 1, this.size + 1);

        context.lineJoin = 'bevel';
        context.lineWidth = 1;
        context.fillStyle = this.fillStyle;
        context.strokeStyle = this.lineStyle;
        const numPoints = this.numTeeth * 2;
        let [fx, fy] = [0, 0];
        context.beginPath();
        for (let n = 0; n < numPoints; n++) {
            const radius = n % 3 === 0 ? this.outerRadius : this.innerRadius;
            const theta = ((Math.PI * 2) / numPoints) * (n + 1);
            const [x, y] = [radius * Math.sin(theta), radius * Math.cos(theta)];
            const [nx, ny] = [x + this.offset, y + this.offset];

            if (n === 0) {
                context.moveTo(nx, ny);
                fx = nx;
                fy = ny;
            } else {
                context.lineTo(nx, ny);
            }
        }
        context.lineTo(fx, fy);

        var grad = context.createRadialGradient(this.size / 4, this.size / 4, Math.PI * 100, this.size * 2, this.size * 2, Math.PI * 2);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        grad.addColorStop(0.5, 'rgba(147, 147, 147, 0.85)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

        context.fillStyle = grad;
        context.fill();

        context.fillStyle = this.fillStyle;

        context.stroke();

        const outsideCC = this.holeRadius + (this.holeRadius * 0.35);
        const cornerRadius = outsideCC * 0.15;
        const cornerPoints = [
            [0 + this.offset, -outsideCC + this.offset],
            [outsideCC + this.offset, 0 + this.offset],
            [0 + this.offset, outsideCC + this.offset],
            [-outsideCC + this.offset, 0 + this.offset],
        ];

        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(0 + this.offset, 0 + this.offset, this.holeRadius - 1, 0, Math.PI * 2);
        context.fill();

        cornerPoints.forEach(([cx, cy]) => {
            context.beginPath();
            context.arc(cx, cy, cornerRadius - 1, 0, Math.PI * 2);
            context.fill();
        });

        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.arc(0 + this.offset, 0 + this.offset, this.holeRadius, 0, Math.PI * 2);
        context.stroke();

        cornerPoints.forEach(([cx, cy]) => {
            context.beginPath();
            context.arc(cx, cy, cornerRadius - 0.5, 0, Math.PI * 2);
            context.stroke();
        });

        context.restore();
    }

    draw(ani: GearsWorking): void {
        const context = ani.getContext();
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.theta);

        // Draw from the offscreen canvas
        if (this.canvas) {
            const offscreenContext = this.canvas.getContext('2d');
            if (offscreenContext) {
                this.drawGearToContext(offscreenContext);
            }

            context.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);

        }

        context.restore();;
    }
}

export { Gear };