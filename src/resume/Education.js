import React from 'react';
import { Container } from 'react-bootstrap';

const Education = ({ education }) => {
  return (
    <Container>
      <h2>Education</h2>
      <p>{education}</p>
    </Container>
  );
};

export default Education;
