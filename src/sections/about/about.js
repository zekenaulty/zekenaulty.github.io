import { Section } from "../section";
import { SectionBaseComponent } from "../sectionBaseComponent.js";

export class About extends SectionBaseComponent {
  constructor(options = {}) {
    const o = SectionBaseComponent.initOptions(options,{
        sectionId: 'about'
    });
    super(o); 
    this.build();
  }

  build() {

    this.DOM.element('header', {
      parent: this.e,
      html: 'About',
      classes: [
        'h5',
        'text-center'
      ]
    });
    
    this.section = new Section({
      parent: this.e,
      id: 'about-section',
      sectionId: 'about',
      header: 'about',
      classes: ['text-centered'],
      styles: {
      }
    });

    this.section.body.classList.add('d-flex');
    this.section.body.classList.add('flex-wrap');
    this.section.body.classList.add('justify-content-center');
    this.section.body.style['position'] = 'relative';
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

      <header class="h4">About Me</header>
      <section class="about">I spend most of my time inside long-lived systems—desktop apps, web stacks, and services that carry real business load. The work I enjoy is untangling them, making them testable, and leaving teams with code that is easier to change. .NET and JavaScript have been the backbone, but the through-line is owning hard systems and making them humane to operate.</section>

      <section class="about">At Storable I shipped and maintained .NET WinForms and web apps, built backend services for an insurance auto-protect product using .NET Core, Hangfire, Postgres, SQL Server, and Entity Framework, and introduced unit testing patterns to WinForms while contributing to early domain-driven design efforts.</section>

      <section class="about">Before that at iAdvantage I led development and Azure DevOps, delivering user-defined data models and custom reporting for GLP-compliant products. I built WebForms/MVC/WebAPI services with REST OData and SOAP APIs on Oracle using .NET, nHibernate, Entity Framework, and PL/SQL, crafted responsive UIs with CSS, Bootstrap, and AngularJS, and supported offline WinForms and Xamarin apps.</section>

      <section class="about">Earlier, at Rural Sourcing I mentored teams, handled project management across the Microsoft stack, and helped with recruiting. At Solid Earth I built RETS client/server software, configurable MLS web apps, and a market analytics/statistics module on Oracle and C#. At PK Promotions I delivered web-based systems for commodity production, product tracking, and sales/marketing.</section>

      <section class="about">I started with hands-on roles that forced me to learn by doing: Hancock Bank (DB2/Argo-driven desktop apps, reporting front-ends, data-driven ASP pages, SQL Server), Rainmaker (front-ends in VB6/VB.NET/ASP, Access, InterDev, Flash, SQL Server), Litton Avondale (3D-to-2D transformations, network app deployment, error logging/reporting, an IDE for those scripts), and Computer Specialist (troubleshooting, building PCs, custom software for small businesses).</section>

      <section class="about">Systems are not neutral—they shift who carries risk and who fights fires. I pay attention to that and prefer to build in ways that reduce hidden load and failure modes instead of chasing whatever is trending.</section>

      <section class="about">Interests tilt toward AI/NLP, multi-agent ideas, 3D spatial reasoning, and machine learning—tools that improve how people make decisions rather than replace them. Outside of work, it is quieter: cooking, biking, games, reading, and steadily refining whatever is in front of me.</section>
    </article>
    `;
  }
}
