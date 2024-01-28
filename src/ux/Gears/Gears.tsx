import React, { useEffect, useRef } from 'react';
import { GearsWorking } from './GearsWorking';
import { Gear } from './Gear';


const Gears: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ani = new GearsWorking('myCanvas');
        const gears = [
            new Gear({ x: 10, y: 10, outerRadius: 30, innerRadius: 45, holeRadius: 12, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: false }),
            //new Gear({ x: 10, y: 10, outerRadius: 15, innerRadius: 23, holeRadius: 6, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: true }),
            new Gear({ x: 10, y: 103, outerRadius: 30, innerRadius: 45, holeRadius: 12, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: false }),
            //new Gear({ x: 10, y: 103, outerRadius: 15, innerRadius: 23, holeRadius: 6, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: true }),
            
            
            //new Gear({ x: 372, y: 190, outerRadius: 25, innerRadius: 50, holeRadius: 10, numTeeth: 12, theta: 0.14, thetaSpeed: 2 / 1000, clockwise: true }),
        ];

        ani.setDrawStage(() => {
            gears.forEach((gear) => {
                const thetaIncrement = gear.thetaSpeed * ani.getTimeInterval();
                gear.theta += gear.clockwise ? thetaIncrement : -1 * thetaIncrement;
            });

            ani.clear();

            gears.forEach((gear) => gear.draw(ani));
        });

        ani.start();

        return () => {
            ani.stop();
        };
    }, []);

    return <canvas id="myCanvas" width={window.innerWidth} height={window.innerHeight} style={{ border: '1px solid black' }} ref={canvasRef}></canvas>;
};

export { Gears };
