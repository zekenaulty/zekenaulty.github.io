import React, { useState, useEffect } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Experience from './Experience';
import Skills from './Skills';
import BackgroundImage from '../BackgroundImage';

const Resume: React.FC = () => {
  const [resumeData, setResumeData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/resume.json');
        const data = await response.json();
        setResumeData(data);
      } catch (error) {
        console.error('Error fetching resume data:', error);
      }
    };

    fetchData();
  }, []);

  const { name, title, summary, skills, experience } = resumeData;
/*
  console.log(name);
  console.log(title);
  console.log(summary);
  console.log(skills);
  console.log(experience);
*/
  return (
    <div className="overlay-root">
      <div className="overlay-bg"><BackgroundImage imageUrl='/images/backgrounds/formula.jpg'></BackgroundImage></div>
      <div className="overlay-content">

        <Container fluid className="">
          <Row>
            <Col md="4">
            {name && <h1>{name}</h1>}
              {title && <p>{title}</p>}
              {summary && <p>{summary}</p>}
              {skills && <Skills skills={skills} />}
            </Col>
            <Col>
              {experience && <Experience experience={experience} />}
            </Col>
          </Row>
        </Container>
      </div>

    </div>
  );
};

/*
      <BackgroundImage imageUrl='/images/backgrounds/formula.jpg'></BackgroundImage>
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
*/

export default Resume;
