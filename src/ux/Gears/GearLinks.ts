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

        grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        grad.addColorStop(0.5, 'rgba(147, 147, 147, 0.85)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

        this.context!.fillStyle = grad;

        if (context) {
            for (let i = 0; i < this.links.length; i++) {
                let [a, b] = [this.gears[this.links[i][0]], this.gears[this.links[i][1]]];
                if (a && b) {
                    if (a.radius < b.radius) {
                        [a, b] = [this.gears[this.links[i][1]], this.gears[this.links[i][0]]];
                    }
                    let ar = a.holeRadius / 4;
                    let br = b.holeRadius / 4;

                    this.context!.lineWidth = 1;
                    this.context!.strokeStyle = a.lineStyle;
                    this.context!.beginPath();
                    this.context!.moveTo(a.x - ar, a.y - ar);
                    this.context!.lineTo(b.x - br, b.y - br);
                    this.context!.lineTo(b.x + br, b.y + br);
                    this.context!.lineTo(a.x + ar, a.y + ar);
                    this.context!.lineTo(a.x - ar, a.y - ar);
                    this.context!.closePath();
                    this.context!.fill();
                    this.context!.stroke();

                    this.context!.beginPath();
                    this.context!.arc(0 + a.x, 0 + a.y, a.holeRadius - 1, 0, Math.PI * 2);
                    this.context!.fill();
                    this.context!.fill();
                    this.context!.stroke();

                    this.context!.beginPath();
                    this.context!.arc(0 + b.x, 0 + b.y, b.holeRadius - 1, 0, Math.PI * 2);
                    this.context!.fill();
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
