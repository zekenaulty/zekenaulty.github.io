
import './App.css';
import { motion } from 'framer-motion';
import { Gears } from './ux/Gears/Gears';

function App() {

  const updateViewportHeight = () => {
    document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    document.documentElement.style.setProperty('--viewport-width-max', `${window.screen.width}px`);
    document.documentElement.style.setProperty('--viewport-height-max', `${window.screen.height}px`);
  };

  // Update on window resize
  window.addEventListener('resize', updateViewportHeight);
  document.body.style.setProperty('--overflow-type', 'hidden');

  // Initial update
  updateViewportHeight();

  return (
    <>
      <motion.div className="pax0y0 fill-vp bg-layer-0">
        <Gears></Gears>
      </motion.div>
    </>
  );

}

export default App;
