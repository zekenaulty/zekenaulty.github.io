// Section.tsx
import React from 'react';
import { Container } from 'react-bootstrap';
import BackgroundImage from './BackgroundImage';

interface SectionProps {
  backgroundImageUrl: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ backgroundImageUrl, children }) => {
  return (
    <>
      <BackgroundImage imageUrl={backgroundImageUrl} />
      <Container
        fluid
        as="div"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Container>
    </>
  );
};

export default Section;
