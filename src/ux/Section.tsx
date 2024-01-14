
import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import BackgroundImage from './BackgroundImage';

interface SectionProps {
  backgroundImageUrl: string;
  jsonUri: string;
  componentName: string;
}

const Section: React.FC<SectionProps> = ({ backgroundImageUrl, jsonUri, componentName }) => {
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [DynamicComponent, setDynamicComponent] = useState<React.ComponentType<{ jsonData: Record<string, any> }> | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(jsonUri);
        const json = await response.json();
        setJsonData(json);

        // Dynamically import the specified component
        const dynamicImport = await import(`./${componentName}`);
        setDynamicComponent(() => dynamicImport.default);
      } catch (error) {
        console.error('Error fetching JSON data or importing component:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jsonUri, componentName]);

  return (
    <>
      <BackgroundImage imageUrl={backgroundImageUrl} />
      <Container
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
        {loading ? (
          <div>
            <p>Loading...</p>
            <div className="spinner"></div>
          </div>
        ) : (
          DynamicComponent && <DynamicComponent jsonData={jsonData || {}} />
        )}
      </Container>
    </>
  );
};

export default Section;
