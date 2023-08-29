import React from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Experience from './Experience';
import Skills from './Skills';
import resumeData from './resumeData.json';

const Resume = () => {

  const {
    name,
    title,
    summary,
    skills,
    experience,
  } = resumeData;

  return (
    <Container fluid className="">
      <Row>
        <Col md="4">
          <h1>{name}</h1>
          <p>{title}</p>
          <p>{summary}</p>
          <Skills skills={skills} />
        </Col>
        <Col>
          <Experience experience={experience} />
        </Col>
      </Row>
    </Container>
  );
};

export default Resume;
