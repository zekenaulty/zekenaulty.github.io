import React from 'react';

interface ProjectProps {
  project: {
    title: string;
    description: string;
    githubRepo: string;
    liveUrl: string;
    technologies: string[];
  };
}

const Project: React.FC<ProjectProps> = ({ project }) => {
    /*
    <Card style={{ marginBottom: '1em' }}>
      <Card.Body>
        <Card.Title>{project.title}</Card.Title>
        <Card.Text>{project.description}</Card.Text>
        <div>
          <strong>Technologies: </strong>
          {project.technologies.join(', ')}
        </div>
        <div>
          <a href={project.githubRepo} target="_blank" rel="noopener noreferrer">GitHub Repo</a>
          {project.liveUrl && (
            <span>
              {' | '}
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>
            </span>
          )}
        </div>
      </Card.Body>
    </Card>
          */
  return (
    <></>
  );
};

export default Project;
