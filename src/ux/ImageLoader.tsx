import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { BarLoader } from 'react-spinners';

interface ImageLoaderProps {
  imageUrl: string;
}

const CenteredSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  display: block;
  margin: 0 auto;
`;

const ImageLoader: React.FC<ImageLoaderProps> = ({ imageUrl }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      setLoading(false);
    };

    image.src = imageUrl;

    return () => {
      image.onload = null;
    };
  }, [imageUrl]);

  return (
    <div>
      {loading ? (
        <CenteredSpinner>
          <BarLoader color="#36D7B7" />
        </CenteredSpinner>
      ) : (
        <StyledImage src={imageUrl} alt="Loaded Image" />
      )}
    </div>
  );
};

export default ImageLoader;
