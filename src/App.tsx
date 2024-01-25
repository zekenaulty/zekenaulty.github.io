
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/dist/darkly/bootstrap.min.css';
import Sidebar from './ux/sidebar/Sidebar';
import Home from './ux/home/Home';
import About from './ux/about/About';
import Resume from './ux/resume/Resume';
import Projects from './ux/projects/Projects';
import { motion } from 'framer-motion';

function App() {

  const updateViewportHeight = () => {
    document.documentElement.style.setProperty('--viewport-width', `${window.innerWidth}px`);
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    document.documentElement.style.setProperty('--viewport-width-max', `${window.screen.width}px`);
    document.documentElement.style.setProperty('--viewport-height-max', `${window.screen.height}px`);
  };

  // Update on window resize
  window.addEventListener('resize', updateViewportHeight);

  // Initial update
  updateViewportHeight();

  return (
    <>
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: 1 
        }}
        transition={{
          duration: 1
        }}
        animate={{
          opacity: 1, 
          scale: 1
        }}
      >
        <Home></Home>
      </motion.div>
    </>
  );

}

export default App;
