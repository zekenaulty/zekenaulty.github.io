import { useEffect, useRef } from 'react';

function randomChar() {
  const c = Math.round(Math.random() * (500 - 1) + 197);
  return String.fromCharCode(c);
}

function createCharacter(width, height) {
  const maxTrail = Math.floor(Math.random() * (64 - 40 + 1) + 40);
  return {
    x: Math.floor(Math.random() * (width + 20)),
    y: Math.floor(Math.random() * (height - 40)),
    speed: Math.random() * (20 - 4 + 1) + 4,
    trail: Array.from({ length: maxTrail }, () => ({
      text: randomChar(),
      elapsed: 0,
      changeAfter: Math.random() * (75 - 20) + 20,
    })),
    head: randomChar(),
    headElapsed: 0,
    headChangeAfter: Math.random() * (111 - 20) + 20,
    scale: 11,
  };
}

function MatrixCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const characters = [];
    const maxCharacters = 32;
    let rafId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => {
      if (characters.length >= maxCharacters) return;
      characters.push(createCharacter(canvas.width, canvas.height));
    };

    for (let i = 0; i < 14; i += 1) {
      spawn();
    }

    const drawCharacter = (char) => {
      char.headElapsed += 1;
      if (char.headElapsed >= char.headChangeAfter) {
        char.head = randomChar();
        char.headElapsed = 0;
      }

      const maxTrail = char.trail.length;
      ctx.font = '1.1em monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let n = 0; n < maxTrail; n += 1) {
        const trail = char.trail[n];
        trail.elapsed += 1;
        if (trail.elapsed >= trail.changeAfter) {
          trail.text = randomChar();
          trail.elapsed = 0;
        }
        const y = char.y - char.scale * n + char.scale / 8;
        const opacity = Math.max(0, 1 - n / maxTrail) * 0.55;
        ctx.fillStyle = `rgba(120,170,255,${opacity.toFixed(2)})`;
        ctx.fillText(trail.text, char.x, y);
      }

      const headOpacity = 0.9;
      ctx.fillStyle = `rgba(200,220,255,${headOpacity})`;
      ctx.fillText(char.head, char.x, char.y);
      char.y += char.speed;

      if (char.y - char.scale * maxTrail > canvas.height + 40) {
        char.y = -20;
        char.x = Math.floor(Math.random() * (canvas.width + 20));
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      characters.forEach(drawCharacter);
      spawn();
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: 0.5,
      }}
    />
  );
}

export default MatrixCanvas;
