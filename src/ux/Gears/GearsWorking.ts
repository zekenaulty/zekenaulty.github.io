
class GearsWorking {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private t: number;
    private timeInterval: number;
    private startTime: number;
    private lastTime: number;
    private frame: number;
    private animating: boolean;
    drawStage?: () => void;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.t = this.timeInterval = this.startTime = this.lastTime = this.frame = 0;
        this.animating = false;
    }

    getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setDrawStage = (func: () => void): void => {
        this.drawStage = func;
    };

    isAnimating = (): boolean => this.animating;

    getFrame = (): number => this.frame;

    start = (): void => {
        this.animating = true;
        const date = new Date();
        this.startTime = date.getTime();
        this.lastTime = this.startTime;

        this.drawStage && this.drawStage();

        this.animationLoop();
    };

    stop = (): void => {
        this.animating = false;
    };

    getTimeInterval = (): number => this.timeInterval;

    getTime = (): number => this.t;

    getFps = (): number => (this.timeInterval > 0 ? 1000 / this.timeInterval : 0);

    private animationLoop = (): void => {
        this.frame++;
        const date = new Date();
        const thisTime = date.getTime();
        this.timeInterval = thisTime - this.lastTime;
        this.t += this.timeInterval;
        this.lastTime = thisTime;

        this.drawStage && this.drawStage();

        if (this.animating) {
            requestAnimationFrame(() => this.animationLoop());
        }
    };
}

export { GearsWorking };