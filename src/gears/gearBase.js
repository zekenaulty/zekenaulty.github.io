export class GearBase extends EventTarget {
    constructor(){
        this.x = number;
        this.y = number;
        this.outerRadius = 25;
        this.innerRadius = 15;
        this.holeRadius = 6;
        this.numTeeth = 12;
        this.theta = 0.5;
        this.thetaSpeed = 0.01;
        this.clockwise = true;
        this.midRadius = 1;
        this.fillStyle = 'silver';
        this.lineStyle = 'black';
        this.size;
        this.radius;
        this.offset;
    }
}