import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Project from './Project';

interface ProjectsData {
  projects: {
    title: string;
    description: string;
    githubRepo: string;
    liveUrl: string;
    technologies: string[];
  }[];
}

const Projects: React.FC = () => {
  const [projectsData, setProjectsData] = useState<ProjectsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/projects.json'); // Adjust the path accordingly
        const data = await response.json();
        setProjectsData(data);
      } catch (error) {
        console.error('Error fetching projects data:', error);
      }
    };

    fetchData();
  }, []);

  if (!projectsData) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="">
      {projectsData.projects.map((project, index) => (
        <Project key={index} project={project} />
      ))}
    </Container>
  );
};

export default Projects;
