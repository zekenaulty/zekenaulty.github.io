import { Section } from "../section";
import { ImageLoader } from '../../bootstrap/imageLoader.js';
import { Component } from "../../bootstrap/component.js";
import { Card } from "../../bootstrap/card.js";

import PerfectScrollbar from 'perfect-scrollbar';

export class About extends Component {
  constructor(options = {}) {
    const n = ((options) => {
      const o = { ...options };
      o.classes = [
        ...(o.classes || [])];
      o.events = o.events ? o.events : {};
      o.styles = o.styles ? o.styles : {};
      o.attributes = o.attributes ? o.attributes : {};
      o.showHeader = false;
      o.sectionId = "about";
      return o;
    })(options);
    super(n);
    this.build();
  }

  build() {
    this.background = new ImageLoader({
      parent: this.e,
      src: '/assets/backgrounds/new-bg-0008.png',
      styles: {
        width: '98vw',
        height: '90vh',
        'z-index': '-1',
        'position': 'absolute',
        'top': '0px',
        'left': '0px'
      }
    });

    this.section = new Section({
      parent: this.e,
      id: 'about-section',
      sectionId: 'about',
      header: 'about',
      styles: {
        width: '90vw',
        height: '90vh',
        //'max-width': '970px',
        'position': 'absolute',
        'top': '0px',
        'left': '1vw'
      }
    });

    const cardOptions = {
      classes: [
        'mt-1',
        'me-4',
        'ms-4',
        'mb-3',
        'bg-gradient',
        'align-self-center'
      ],
      styles: {
        'min-width': '320px',
        'max-width': '960px'
      }
    };

    this.section.body.classList.add('d-flex');
    this.section.body.classList.add('flex-wrap');
    this.section.body.classList.add('justify-content-center');
    this.section.body.style['position'] = 'relative';
    this.section.body.style['max-height'] = '84vh';
    this.section.body.setAttribute('data-simplebar', '');
    this.section.body.innerHTML = `
    <article class="container p-2">
      <style>
        .about {
        margin-top: 1em;
        margin-left: 2em;
        margin-right: 4em;
        margin-bottom: 1em;
        }
      </style>
      <header class="h4">My Career Journey</header>
      <section class="about">My journey in software development began in the late 1990s, when I landed my first tech job at Litton Avondale Inc. 
      Working on the cutting-edge LPD-17 project, I was tasked with writing 3D to 2D code transformations, deploying network applications, 
      and building robust error-handling systems. This experience not only laid the foundation for my technical skills but also instilled 
      in me a passion for innovation and collaboration.</section>

      <section class="about">As I progressed in my career, I had the opportunity to work on a wide range of projects, from desktop development to web applications. 
      I developed a strong foundation in programming languages, including C#, (link unavailable), and Java, and became proficient in various development 
      frameworks and tools. My early experiences taught me the importance of adaptability, effective communication, and teamwork in a fast-paced environment.</section>

      <header class="h4">Early Development Experience</header>
      <section class="about">My early development experience was marked by a series of challenging and rewarding projects. As an Engineering Application Developer at 
      Litton Avondale Inc., I wrote 3D to 2D code transformations, managed network application deployment, and developed error reporting/logging databases 
      and front-ends. One of my notable achievements was creating an Integrated Development Environment (IDE) for scripting 3D to 2D transformations. 
      This experience not only deepened my understanding of software development but also instilled in me a passion for innovation and problem-solving.
      <section class="about">At Hancock Whitney, I worked as a Programmer/Analyst I, where I was responsible for desktop development, accessing DB2 data sources, and 
      implementing data applications with Argo Data. I designed reporting and data access front-ends, created data-driven ASP pages, and developed a 
      strong foundation in database management. These experiences taught me the importance of attention to detail, data integrity, and effective data visualization.
      <section class="about">Throughout these early experiences, I was fortunate to work with talented teams and mentors who guided me in my growth as a developer. 
      I learned the value of collaboration, open communication, and continuous learning in delivering high-quality software solutions. These lessons have 
      stayed with me throughout my career and continue to shape my approach to software development.</section>
      
      <section class="about">As a Design Consultant at Rainmaker Advertising & Design, I assisted in the design and implementation of IT systems, developed components and 
      frontends using VB6, (link unavailable), ASP Classic, (link unavailable) Web Forms, Microsoft Access, Microsoft InterDev, and Microsoft SQL Server. 
      This experience broadened my understanding of software development and taught me the importance of considering user experience and design principles 
      in software development.</section>
      
      <header class="h4">Expanding My Horizons</header>
      <section class="about">As I progressed in my career, I had the opportunity to work on a wide range of projects and technologies. At Solid Earth Inc., I developed and 
      maintained RETS client and server software powered by Oracle and C#. I also developed configurable (link unavailable) web applications for distinct MLS 
      custom implementations and built a full statistics module with deep market analytics and reporting. This experience deepened my understanding of 
      software development and instilled in me a passion for innovation and problem-solving.</section>

      <section class="about">As a Senior Software Developer at Rural Sourcing Inc., I provided mentoring, team management, and project management in relation to the Microsoft stack. 
      I also performed recruiting and interviewing tasks, which helped me develop my leadership and communication skills. I worked with talented teams to deliver 
      high-quality software solutions, and my experience in this role taught me the importance of effective collaboration, open communication, and continuous 
      learning.</section>

      <section class="about">At PK Promotions, I developed web-based commodity production management systems, product evolution tracking systems, and sales/marketing systems. 
      This experience broadened my understanding of software development and taught me the importance of considering user experience and design principles in software 
      development. I also developed a strong foundation in web development, including HTML, CSS, JavaScript, and various frameworks and libraries.</section>

      <section class="about">Throughout these experiences, I continued to expand my skill set and knowledge of software development. I learned new programming languages, frameworks,
       and tools, and I developed a strong foundation in software engineering principles and best practices. I also learned the importance of staying up-to-date with 
       industry trends and emerging technologies, and I continue to pursue ongoing learning and professional development in my career.</section>
      
      <header class="h4">Leadership and Innovation</header>
      <section class="about">As I continued to grow in my career, I had the opportunity to take on leadership roles and drive innovation in software development. At 
      iAdvantage Software Inc., I served as a Lead Developer/Azure DevOps, where I empowered users with dynamic user-defined data models and custom reporting 
      features. I worked with cutting-edge technologies, including WebForms/MVC/WebAPI, OData/SOAP APIs, and Angular/AngularJS. I also developed a strong foundation 
      in cloud computing, including Azure and AWS.</section>

      <section class="about">In this role, I led teams to deliver high-quality software solutions, and my experience taught me the importance of effective leadership, 
      communication, and collaboration. I also developed a strong understanding of DevOps practices and tools, including continuous integration, continuous deployment, 
      and continuous monitoring.</section>

      <section class="about">At Storable, I worked as a Software Engineer II, where I developed and maintained .Net WinForms and web applications. I built backend services to support 
      insurance auto-protect features using .Net Core, Hangfire, Postgres, SQL Server, and Entity Framework. I also established and taught patterns for unit testing in
       WinForms and contributed ideas and design concepts to several initiatives in the company's growing adoption of domain-driven design.</section>

      <section class="about">Throughout these experiences, I continued to innovate and push the boundaries of software development. I learned new technologies, frameworks, and tools, 
      and I developed a strong foundation in software architecture and design principles. I also learned the importance of staying adaptable and agile in a rapidly 
      changing technology landscape.</section>
    
      <header class="h4">Passion Projects and Interests</header>
      <section class="about">Outside of my professional work, I enjoy exploring various passion projects and interests that allow me to express my creativity and curiosity. 
      I'm fascinated by the intersection of technology and art, and I've experimented with projects that blend logic and artistry.</section>

      <section class="about">One of my current interests is AI integration and natural language processing. I've been exploring the possibilities of using machine learning and deep 
      learning to create more intuitive and human-like interfaces. I've also been experimenting with 3D spatial reasoning and machine learning, and I'm excited about 
      the potential applications of these technologies in fields such as robotics and computer vision.</section>

      <section class="about">I'm also passionate about open-source communities and secure AI environments. I believe that open-source software has the power to drive innovation 
      and collaboration, and I've contributed to several open-source projects in my free time. I'm also interested in exploring the possibilities of secure AI 
      environments, where AI systems can be designed to be transparent, explainable, and fair.</section>

      <section class="about">Throughout my career, I've found that pursuing passion projects and interests outside of work has helped me stay curious, motivated, and inspired. 
      It's allowed me to explore new ideas, learn new skills, and connect with like-minded individuals who share my passions.</section>
      
      <header class="h4">Career Reflections and Future Directions</header>
      <section class="about">As I reflect on my career journey, I'm proud of the progress I've made and the experiences I've had. I've had the opportunity to work on a wide 
      range of projects, from desktop development to web applications, and I've developed a strong foundation in software engineering principles and best 
      practices.</section>

      <section class="about">Throughout my career, I've learned the importance of staying adaptable, curious, and open to new ideas. I've seen the technology landscape 
      change rapidly, and I've had to adjust my skills and approach to stay ahead of the curve. I've also learned the value of collaboration, communication, 
      and leadership in delivering high-quality software solutions.</section>

      <section class="about">As I look to the future, I'm excited about the possibilities of emerging technologies such as AI, machine learning, and cloud computing. 
      I believe that these technologies have the potential to drive significant innovation and transformation in industries such as healthcare, finance, 
      and education.</section>

      <section class="about">In the next chapter of my career, I'm looking to continue pushing the boundaries of software development and innovation. 
      I'm interested in exploring new technologies, frameworks, and tools, and I'm excited about the opportunity to work with talented teams to deliver 
      high-quality software solutions.</section>

      <section class="about">Ultimately, my goal is to make a meaningful impact in the world through my work. I believe that software has the power to drive positive change,
       and I'm committed to using my skills and experience to make a difference.</section>
    </article>
    `;
  }
}