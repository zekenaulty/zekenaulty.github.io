import React, { useEffect, useRef } from 'react';
import { GearsWorking } from './GearsWorking';
import { Gear } from './Gear';


const Gears: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvas = canvasRef.current;
    useEffect(() => {
        if (!canvas) return;
        let gears: Gear[] = [];
        const getGears = () => {
            const newGears = [...leftTop(), ...leftBottom(), ...rightTop(), ...rightBottom()];
            const oldGears = [...gears];
            oldGears.forEach((g, i) => {
                newGears[i].theta = g.theta;
            });
            return newGears;
        }

        const ani = new GearsWorking(canvas);
        const leftTop = () => [
            new Gear({ x: 0, y: 0, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: false }),
            //new Gear({ x: 0, y: 90, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: false }),

            //linking gear
            new Gear({ x: 45, y: 45, outerRadius: 15, innerRadius: 23, holeRadius: 7, numTeeth: 12, theta: 0, thetaSpeed: 2 / 1000, clockwise: true }),

            //gears going right
            new Gear({ x: 70, y: 20, outerRadius: 8, innerRadius: 12, holeRadius: 5, numTeeth: 9, theta: 0, thetaSpeed: 3.5 / 1000, clockwise: false }),
            new Gear({ x: 95, y: 45, outerRadius: 15, innerRadius: 23, holeRadius: 7, numTeeth: 12, theta: 0, thetaSpeed: 4 / 1000, clockwise: true }),
            new Gear({ x: 145, y: 0, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 2.5 / 1000, clockwise: false }),

            //gears going down
            new Gear({ x: 20, y: 70, outerRadius: 8, innerRadius: 12, holeRadius: 5, numTeeth: 9, theta: 0, thetaSpeed: 3.5 / 1000, clockwise: false }),
            new Gear({ x: 45, y: 95, outerRadius: 15, innerRadius: 23, holeRadius: 7, numTeeth: 12, theta: 0, thetaSpeed: 4 / 1000, clockwise: true }),
            new Gear({ x: 0, y: 145, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 2.5 / 1000, clockwise: false }),

        ];

        const leftBottom = () => [
            new Gear({ x: 0, y: window.innerHeight, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: true }),
            new Gear({ x: 0, y: window.innerHeight - 90, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: true }),
            new Gear({ x: 45, y: window.innerHeight - 45, outerRadius: 15, innerRadius: 23, holeRadius: 7, numTeeth: 12, theta: 0, thetaSpeed: 2 / 1000, clockwise: false }),
        ];

        const rightTop = () => [
            new Gear({ x: window.innerWidth, y: 0, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: false }),
            new Gear({ x: window.innerWidth, y: 90, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: false }),
            new Gear({ x: window.innerWidth - 45, y: 45, outerRadius: 15, innerRadius: 23, holeRadius: 7, numTeeth: 12, theta: 0, thetaSpeed: 2 / 1000, clockwise: true }),
        ];

        const rightBottom = () => [
            new Gear({ x: window.innerWidth, y: window.innerHeight, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: true }),
            new Gear({ x: window.innerWidth, y: window.innerHeight - 90, outerRadius: 30, innerRadius: 45, holeRadius: 11, numTeeth: 12, theta: 0, thetaSpeed: 1 / 1000, clockwise: true }),
            new Gear({ x: window.innerWidth - 45, y: window.innerHeight - 45, outerRadius: 15, innerRadius: 23, holeRadius: 7, numTeeth: 12, theta: 0, thetaSpeed: 2 / 1000, clockwise: false }),
        ];

        const resizeHandler = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            gears = getGears() as Gear[];
        };

        window.addEventListener('resize', resizeHandler);
        resizeHandler();

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
            window.removeEventListener('resize', resizeHandler);
            ani.stop();
        };
    }, [canvas]);

    return <canvas ref={canvasRef}></canvas>;
};

export { Gears };

