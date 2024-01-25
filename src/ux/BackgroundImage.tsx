
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { BarLoader } from 'react-spinners';

interface BackgroundImageProps {
    imageUrl: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ imageUrl }) => {
    const [loading, setLoading] = useState(true);

    const CenteredSpinner = styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    `;

    const StyledImage = styled.img`
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        z-index: -1;
        background-size: cover;
        display: block;
        margin: 0 auto;
    `;

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

export default BackgroundImage;
