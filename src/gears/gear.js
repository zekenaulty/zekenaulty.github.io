import { GearBase } from "./gearBase";
import { DOM } from '../dom';

export class Gear extends GearBase {
    static DEFAULT = {
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

    constructor(config = {}) {
        super();

        Object.assign(this, Gear.DEFAULT);
        Object.assign(
            this,
            config, {
            midRadius: config.outerRadius ? config.outerRadius - 10 : Gear.DEFAULT.outerRadius - 10
        });
        
        this.size = Math.max(this.outerRadius, this.innerRadius) * 2;
        this.offset = this.size / 2;
        this.radius = this.size / 2;
        this.canvas = DOM.element('canvas', {
            parent: undefined,
        });
        this.canvas.width = this.size;
        this.canvas.height = this.size;
    }

    drawGearToContext(ctx) {
        ctx.save();
        ctx.clearRect(-1, -1, this.size + 1, this.size + 1);

        ctx.lineJoin = 'bevel';
        ctx.lineWidth = 1;
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.lineStyle;
        const numPoints = this.numTeeth * 2;

        let [fx, fy] = [0, 0];

        ctx.beginPath();
        for (let n = 0; n < numPoints; n++) {
            const radius = n % 3 === 0 ? this.outerRadius : this.innerRadius;
            const theta = ((Math.PI * 2) / numPoints) * (n + 1);
            const [x, y] = [radius * Math.sin(theta), radius * Math.cos(theta)];
            const [nx, ny] = [x + this.offset, y + this.offset];

            if (n === 0) {
                ctx.moveTo(nx, ny);
                fx = nx;
                fy = ny;
            } else {
                ctx.lineTo(nx, ny);
            }
        }
        ctx.lineTo(fx, fy);

        var grad = ctx.createRadialGradient(this.size / 4, this.size / 4, Math.PI * 100, this.size * 2, this.size * 2, Math.PI * 2);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        grad.addColorStop(0.5, 'rgba(147, 147, 147, 0.85)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

        ctx.fillStyle = grad;
        ctx.fill();

        ctx.fillStyle = this.fillStyle;

        ctx.stroke();

        const outsideCC = this.holeRadius + (this.holeRadius * 0.35);
        const cornerRadius = outsideCC * 0.15;
        const cornerPoints = [
            [0 + this.offset, -outsideCC + this.offset],
            [outsideCC + this.offset, 0 + this.offset],
            [0 + this.offset, outsideCC + this.offset],
            [-outsideCC + this.offset, 0 + this.offset],
        ];

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(0 + this.offset, 0 + this.offset, this.holeRadius - 1, 0, Math.PI * 2);
        ctx.fill();

        cornerPoints.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, cornerRadius - 1, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(0 + this.offset, 0 + this.offset, this.holeRadius, 0, Math.PI * 2);
        ctx.stroke();

        cornerPoints.forEach(([cx, cy]) => {
            ctx.beginPath();
            ctx.arc(cx, cy, cornerRadius - 0.5, 0, Math.PI * 2);
            ctx.stroke();
        });

        ctx.restore();
    }

    draw(ani) {
        const ctx = ani.getContext();
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.theta);
        if (this.canvas) {
            const offscreenContext = this.canvas.getContext('2d');
            if (offscreenContext) {
                this.drawGearToContext(offscreenContext);
            }
            ctx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);
        }
        ctx.restore();;
    }

}