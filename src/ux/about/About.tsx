import React, { useEffect, useState } from 'react';
import './About.css';
import BackgroundImage from '../BackgroundImage';

interface AboutData {
  header: string;
  paragraphs: string[];
}

const About: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/about.json'); // Adjust the path accordingly
        const data = await response.json();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchData();
  }, []);

  if (!aboutData) {
    return <div>Loading...</div>;
  }

  return (
    <section className="fill-vp overlay-root">
      <div className="overlay-bg"><BackgroundImage imageUrl='/images/backgrounds/formula.jpg'></BackgroundImage></div>
      <div className="fill-vp overlay-content">
        <section className="about">
          <header className="header">{aboutData.header}</header>
          <section className="about-content">
            {aboutData.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </section>
        </section>
      </div>
    </section>
  );
};

export default About;
