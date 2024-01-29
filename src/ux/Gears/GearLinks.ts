import { Gear } from './Gear';
import { GearsWorking } from './GearsWorking';

class GearLinks {
    private gears: Gear[];
    private links: number[][];
    private canvas: HTMLCanvasElement | undefined;
    private context: CanvasRenderingContext2D | null | undefined;

    constructor(gears: Gear[], links: number[][]) {
        this.gears = gears;
        this.links = links;
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext('2d');
    }

    f = true;
    draw = (ani: GearsWorking) => {
        const context = ani.getContext();
        var grad = context.createRadialGradient(
            this.gears[0].size / 4,
            this.gears[0].size / 4,
            Math.PI * 100,
            this.gears[0].size * 2,
            this.gears[0].size * 2,
            Math.PI * 2);

        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.5, 'rgba(147, 147, 147, 1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 1)');

        this.context!.fillStyle = grad;
        this.context!.lineWidth = 1;
        this.context!.strokeStyle = this.gears[0].lineStyle;

        if (context) {
            for (let i = 0; i < this.links.length; i++) {
                let [a, b] = [this.gears[this.links[i][0]], this.gears[this.links[i][1]]];
                if (a && b) {
                    if (a.radius < b.radius) {
                        [a, b] = [this.gears[this.links[i][1]], this.gears[this.links[i][0]]];
                    }

                    let ar = a.holeRadius * 0.55;
                    let br = b.holeRadius * 0.35;

                    let p = [
                        { x: b.x - br, y: b.y - br },
                        { x: b.x + br, y: b.y + br },
                        { x: a.x + ar, y: a.y + ar },
                        { x: a.x - ar, y: a.y - ar },
                    ];
                    this.context!.beginPath();
                    this.context!.moveTo(p[0].x, p[0].y);
                    p.forEach((v, i) => {
                        if (i > 0) {
                            this.context!.lineTo(v.x, v.y);
                        }
                    });
                    this.context!.lineTo(p[0].x, p[0].y);
                    this.context!.closePath();
                    this.context!.fill();
                    this.context!.stroke();
                    
                    this.context!.beginPath();
                    this.context!.arc(0 + a.x, 0 + a.y, a.holeRadius - 1, 0, Math.PI * 2);
                    this.context!.closePath();
                    this.context!.fill();
                    this.context!.stroke();

                    this.context!.beginPath();
                    this.context!.arc(0 + b.x, 0 + b.y, b.holeRadius - 1, 0, Math.PI * 2);
                    this.context!.closePath();
                    this.context!.fill();
                    this.context!.stroke();
                }
            }
            context.drawImage(this.canvas as HTMLCanvasElement, 0, 0);
        }
        this.f = false;
    }
}

export { GearLinks };

/* 
                    this.context!.save();
                    this.context!.globalCompositeOperation = 'destination-out';
                    
                    p = [
                        { x: b.x - br + 3, y: b.y - br + 3 },
                        { x: b.x + br - 3, y: b.y + br - 3 },
                        { x: a.x + ar - 3, y: a.y + ar - 3 },
                        { x: a.x - ar + 3, y: a.y - ar + 3 },
                    ];
                    this.context!.beginPath();
                    this.context!.moveTo(p[0].x, p[0].y);
                    p.forEach((v, i) => {
                        if (i > 0) {
                            this.context!.lineTo(v.x, v.y);
                        }
                    });
                    this.context!.lineTo(p[0].x, p[0].y);
                    this.context!.closePath();
                    this.context!.fill();

                    this.context!.restore();
                    this.context!.globalCompositeOperation = 'source-over';
                    p = [
                        { x: b.x - br + 2, y: b.y - br + 2 },
                        { x: b.x + br - 2, y: b.y + br - 2 },
                        { x: a.x + ar - 2, y: a.y + ar - 2 },
                        { x: a.x - ar + 2, y: a.y - ar + 2 },
                    ];
                    this.context!.beginPath();
                    this.context!.moveTo(p[0].x, p[0].y);
                    p.forEach((v, i) => {
                        if (i > 0) {
                            this.context!.lineTo(v.x, v.y);
                        }
                    });
                    this.context!.lineTo(p[0].x, p[0].y);
                    this.context!.closePath();
                    this.context!.stroke();
 */

                    