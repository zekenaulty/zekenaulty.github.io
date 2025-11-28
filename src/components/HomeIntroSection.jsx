import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import anime from 'animejs';

function animateSpinIn(el, text, fontSize = '2.3em', delayFactor = 25, duration = 550, sub = false) {
  if (!el) return;
  el.innerHTML = '';
  text.split('').forEach((char) => {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'scale(0) rotate(0deg)';
    span.style.fontFamily = '"Fira Code", "Consolas", "monospace"';
    span.style.fontSize = sub ? '0.8em' : fontSize;
    span.textContent = char === ' ' ? '\u00A0' : char;
    el.appendChild(span);
  });

  const spans = el.querySelectorAll('span');
  anime.timeline({ loop: false }).add({
    targets: spans,
    opacity: [-1, 1],
    scale: [-1, 1],
    rotate: [-360 * 4, 0],
    duration,
    easing: 'easeOutExpo',
    delay: (_el, i) => delayFactor * i,
  });
}

function HomeIntroSection() {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    animateSpinIn(titleRef.current, 'Zeke Naulty', '2.8em', 25, 650, false);
    animateSpinIn(subtitleRef.current, 'Developer, Designer, Artist, Programmer', '1em', 20, 700, true);
  }, []);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          p: 2,
          pointerEvents: 'auto',
        }}
      >
        <Box ref={titleRef} sx={{ lineHeight: 1.2, color: '#e6f0ff' }} />
        <Box ref={subtitleRef} sx={{ mt: 1, color: '#a8b3cc' }} />
      </Box>
    </Box>
  );
}

export default HomeIntroSection;
