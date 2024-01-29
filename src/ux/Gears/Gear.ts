import _default from "react-bootstrap/esm/Accordion";
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

    private offscreenCanvas: HTMLCanvasElement | null = null;

    private static _default: GearConfig = {
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

    constructor(config: GearConfig = Gear._default) {
        Object.assign(this, Gear._default);
        Object.assign(this, config, { midRadius: config.outerRadius ? config.outerRadius - 10 : Gear._default.outerRadius! - 10 });
        this.createOffscreenCanvas();
    }

    private createOffscreenCanvas() {
        this.offscreenCanvas = document.createElement('canvas');
        const size = Math.max(this.outerRadius, this.innerRadius) * 2;
        this.offscreenCanvas.width = size;
        this.offscreenCanvas.height = size;
    }

    private drawGearToContext(context: CanvasRenderingContext2D) {
        const size = Math.max(this.outerRadius, this.innerRadius) * 2;
        const offset = size / 2

        context.save();
        context.clearRect(-1, -1, size + 1, size + 1);

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
            const [nx, ny] = [x + offset, y + offset];

            if (n === 0) {
                context.moveTo(nx, ny);
                fx = nx;
                fy = ny;
            } else {
                context.lineTo(nx, ny);
            }
        }
        context.lineTo(fx, fy);
        context.fill();
        context.stroke();

        const outsideCC = this.holeRadius + (this.holeRadius * 0.35);
        const cornerRadius = outsideCC * 0.15;
        const cornerPoints = [
            [0 + offset, -outsideCC + offset],
            [outsideCC + offset, 0 + offset],
            [0 + offset, outsideCC + offset],
            [-outsideCC + offset, 0 + offset],
        ];

        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(0 + offset, 0 + offset, this.holeRadius - 1, 0, Math.PI * 2);
        context.fill();

        cornerPoints.forEach(([cx, cy]) => {
            context.beginPath();
            context.arc(cx, cy, cornerRadius - 1, 0, Math.PI * 2);
            context.fill();
        });
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.arc(0 + offset, 0 + offset, this.holeRadius, 0, Math.PI * 2);
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
        //context.scale(2, 2);
        context.translate(this.x, this.y);
        context.rotate(this.theta);

        // Draw from the offscreen canvas
        if (this.offscreenCanvas) {
            const offscreenContext = this.offscreenCanvas.getContext('2d');
            if (offscreenContext) {
                this.drawGearToContext(offscreenContext);
            }

            //context.drawImage(this.offscreenCanvas, 0, 0);
            context.drawImage(
                this.offscreenCanvas,
                -this.offscreenCanvas.width / 2,
                -this.offscreenCanvas.height / 2);

        }

        //context.scale(1, 1);
        context.restore();
    }
}

export { Gear };