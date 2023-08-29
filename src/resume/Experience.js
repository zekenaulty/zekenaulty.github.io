import React from 'react';
import { Container, Card } from 'react-bootstrap';

const Experience = ({ experience }) => {
  return (
    <div className="experience">
      <h2>Experience</h2>
      <Container fluid>
        {experience.map((job, index) => (
          <Card key={index} style={{ marginBottom: '1em' }}>
            <Card.Body>
              <Card.Title>{job.title}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{job.company}</Card.Subtitle>
              <Card.Subtitle className="mb-2 text-muted">{job.dates}</Card.Subtitle>
              <Card.Subtitle className="mb-2 text-muted">{job.location}</Card.Subtitle>
              <ul>
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        ))}
      </Container>
    </div>
  );
};

export default Experience;
