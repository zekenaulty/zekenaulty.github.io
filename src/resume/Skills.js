import React from 'react';

const Skills = ({ skills }) => {
  return (
    <div className="skills">
      <h2>Skills</h2>
      <div>
        {skills.map((skill, index) => (
          <span className="badge badge-secondary" key={index}>{skill}</span>
        ))}
      </div>
    </div>
  );
};

export default Skills;
