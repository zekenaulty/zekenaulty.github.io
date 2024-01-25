import React from 'react';
import './Home.css';
import BackgroundImage from '../BackgroundImage';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <motion.section className="fill-vp overlay-root">
      <motion.div className="overlay-bg"><BackgroundImage imageUrl='/images/backgrounds/insight.jpg'></BackgroundImage></motion.div>
      <motion.div className="fill-vp overlay-content d-flex flex-column justify-content-center align-items-center">
        <motion.a id="home" href="/" style={{
          position: 'relative',
          top: '0px',
          left: '0px',
          visibility: 'hidden'
        }}>Home</motion.a>
        <h2 className="text-center">Zeke Naulty</h2>
      </motion.div>
    </motion.section>
  );
};

export default Home;
