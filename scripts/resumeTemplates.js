import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

function formatDate(isoString) {
  if (!isoString) return '';
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;
  return monthYearFormatter.format(parsed);
}

function formatDateRange(entry) {
  if (!entry) return '';
  if (entry.dateRangeText) return entry.dateRangeText;

  const start = entry.start || formatDate(entry?.dates?.start);
  const end = entry.end || formatDate(entry?.dates?.end);
  if (start && end) return `${start} - ${end}`;
  if (start && !end) return `${start} - Present`;
  return end || '';
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeSkills(view) {
  if (view.skillsBuckets) return view.skillsBuckets;
  if (view.skillsByCategory) return view.skillsByCategory;

  return {
    core: view.skillsPrimary ?? [],
    supporting: view.skillsSecondary ?? [],
    other: view.skillsCatalog ?? [],
  };
}

export function renderHtmlResume(view) {
  const {
    profileSlug,
    profileLabel,
    headline,
    summary = [],
    experience = [],
    projects = [],
  } = view;

  const skills = normalizeSkills(view);
  const description = headline || summary[0] || `Resume for ${profileLabel ?? 'Zeke Naulty'}`;
  const summaryHtml = summary.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');

  const experienceHtml = experience
    .map((job) => {
      const bulletsHtml = (job.bullets ?? job.description ?? [])
        .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
        .join('\n');
      const dateRange = formatDateRange(job);
      const metaParts = [dateRange, job.location].filter(Boolean).join(' | ');
      const techList = (job.skillsUsed ?? []).map(escapeHtml).join(', ');

      return `
        <article class="experience-item">
          <h4>${escapeHtml(job.title ?? '')} - ${escapeHtml(job.company ?? '')}</h4>
          <div class="meta">${escapeHtml(metaParts)}</div>
          ${job.summary ? `<p class="summary">${escapeHtml(job.summary)}</p>` : ''}
          <ul>${bulletsHtml}</ul>
          ${techList ? `<div class="tech">Tech: ${techList}</div>` : ''}
        </article>
      `;
    })
    .join('\n');

  const skillsHtml = `
    <div class="skills-columns">
      <div>
        <h4>Core</h4>
        <ul>${(skills.core ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('\n')}</ul>
      </div>
      <div>
        <h4>Supporting</h4>
        <ul>${(skills.supporting ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('\n')}</ul>
      </div>
      <div>
        <h4>Other</h4>
        <ul>${(skills.other ?? []).map((s) => `<li>${escapeHtml(s)}</li>`).join('\n')}</ul>
      </div>
    </div>
  `;

  const projectsHtml = (projects ?? [])
    .map((project) => {
      const url = project.url ?? project.repoUrl;
      return `
        <li>
          <strong>${escapeHtml(project.name ?? '')}</strong> - ${escapeHtml(
        project.shortDescription ?? project.description ?? '',
      )}
          ${url ? `<br/><a href="${escapeHtml(url)}">${escapeHtml(url)}</a>` : ''}
        </li>
      `;
    })
    .join('\n');

  const slug = profileSlug;
  const canonicalUrl = `https://zekenaulty.github.io/resume/${slug}/`;

  const minimalCss = `
    :root {
      color-scheme: light;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #0b1020, #0f172a);
      color: #e5e7eb;
      margin: 0;
      padding: 0;
    }
    main {
      max-width: 960px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem 3rem;
    }
    header { margin-bottom: 1.5rem; }
    h1 { font-size: 2rem; margin: 0 0 0.25rem; letter-spacing: 0.01em; }
    h2 { font-size: 1.2rem; margin: 0 0 0.35rem; color: #9fb4ff; }
    .profile-label { color: #9ca3af; font-weight: 600; letter-spacing: 0.02em; }
    section { margin-top: 1.75rem; }
    h3 { font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.08em; color: #9fb4ff; margin-bottom: 0.75rem; }
    h4 { margin: 0 0 0.15rem; font-size: 1rem; color: #e5e7eb; }
    p { margin: 0 0 0.75rem; color: #d1d5db; }
    a { color: #9fb4ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .experience-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
    .experience-item .meta { color: #9ca3af; font-size: 0.9rem; margin-bottom: 0.35rem; }
    .experience-item .tech { margin-top: 0.5rem; font-size: 0.9rem; color: #cbd5e1; }
    ul { padding-left: 1.25rem; margin: 0; }
    .skills-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .skills-columns ul { list-style: disc; }
    #projects ul, #downloads ul { list-style: none; padding-left: 0; }
    #projects li, #downloads li { margin-bottom: 0.5rem; }
    footer { margin-top: 2rem; color: #9ca3af; font-size: 0.9rem; }
  `;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Zeke Naulty - ${escapeHtml(profileLabel ?? '')}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${minimalCss}</style>
  </head>
  <body>
    <main>
      <header>
        <h1>Zeke Naulty</h1>
        <h2>${escapeHtml(headline ?? '')}</h2>
        <div class="profile-label">${escapeHtml(profileLabel ?? '')}</div>
      </header>

      <section id="summary">
        <h3>Summary</h3>
        ${summaryHtml}
      </section>

      <section id="experience">
        <h3>Experience</h3>
        ${experienceHtml}
      </section>

      <section id="skills">
        <h3>Skills</h3>
        ${skillsHtml}
      </section>

      <section id="projects">
        <h3>Projects</h3>
        <ul>${projectsHtml}</ul>
      </section>

      <section id="downloads">
        <h3>Downloads</h3>
        <ul>
          <li><a href="/resume/${slug}/resume-${slug}.txt">Plain text</a></li>
          <li><a href="/resume/${slug}/resume-${slug}.pdf">PDF</a></li>
          <li><a href="/resume/${slug}/resume-${slug}.docx">Word (.docx)</a></li>
        </ul>
      </section>

      <footer>Generated from structured resume data. No client-side JavaScript is used on this page.</footer>
    </main>
  </body>
</html>`;
}

export function renderTextResume(view) {
  const { profileLabel, headline, summary = [], experience = [], projects = [] } = view;
  const skills = normalizeSkills(view);

  const lines = [];
  lines.push('ZEKE NAULTY');
  if (profileLabel) lines.push(profileLabel.toUpperCase());
  if (headline) lines.push(headline);
  lines.push('');

  lines.push('SUMMARY');
  lines.push('-------');
  summary.forEach((p) => {
    lines.push(p);
    lines.push('');
  });

  lines.push('EXPERIENCE');
  lines.push('----------');
  experience.forEach((job) => {
    const dateRange = formatDateRange(job);
    lines.push(`${job.title ?? ''} - ${job.company ?? ''}`.trim());
    const metaParts = [];
    if (dateRange) metaParts.push(dateRange);
    if (job.location) metaParts.push(job.location);
    if (metaParts.length) lines.push(metaParts.join(' | '));
    (job.bullets ?? job.description ?? []).forEach((b) => lines.push(`  - ${b}`));
    lines.push('');
  });

  lines.push('SKILLS');
  lines.push('------');
  if (skills.core?.length) {
    lines.push('Core:');
    skills.core.forEach((s) => lines.push(`  - ${s}`));
    lines.push('');
  }
  if (skills.supporting?.length) {
    lines.push('Supporting:');
    skills.supporting.forEach((s) => lines.push(`  - ${s}`));
    lines.push('');
  }
  if (skills.other?.length) {
    lines.push('Other:');
    skills.other.forEach((s) => lines.push(`  - ${s}`));
    lines.push('');
  }

  lines.push('PROJECTS');
  lines.push('--------');
  projects.forEach((project) => {
    lines.push(`${project.name ?? ''} - ${project.shortDescription ?? project.description ?? ''}`);
    const url = project.url ?? project.repoUrl;
    if (url) lines.push(`URL: ${url}`);
    lines.push('');
  });

  return lines.join('\n');
}

export async function renderDocxResume(view) {
  const skills = normalizeSkills(view);
  const experience = view.experience ?? [];
  const summary = view.summary ?? [];
  const projects = view.projects ?? [];

  const children = [
    new Paragraph({
      text: 'Zeke Naulty',
      heading: HeadingLevel.TITLE,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: view.profileLabel ?? '',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 50 },
    }),
    view.headline
      ? new Paragraph({
          children: [new TextRun({ text: view.headline, bold: false })],
          spacing: { after: 200 },
        })
      : null,
    new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_1 }),
    ...summary.map((p) => new Paragraph({ text: p, spacing: { after: 120 } })),
    new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_1, spacing: { before: 200 } }),
    ...experience.flatMap((job) => {
      const pieces = [];
      pieces.push(
        new Paragraph({
          text: `${job.title ?? ''} - ${job.company ?? ''}`.trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 40 },
        }),
      );
      const metaParts = [];
      const dateRange = formatDateRange(job);
      if (dateRange) metaParts.push(dateRange);
      if (job.location) metaParts.push(job.location);
      if (metaParts.length) {
        pieces.push(
          new Paragraph({
            text: metaParts.join(' | '),
            spacing: { after: 60 },
          }),
        );
      }
      (job.bullets ?? job.description ?? []).forEach((bullet) => {
        pieces.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
          }),
        );
      });
      if (job.skillsUsed?.length) {
        pieces.push(
          new Paragraph({
            text: `Tech: ${job.skillsUsed.join(', ')}`,
            spacing: { before: 60, after: 100 },
          }),
        );
      } else {
        pieces.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      }
      return pieces;
    }),
    new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_1, spacing: { before: 120 } }),
    new Paragraph({ text: 'Core', heading: HeadingLevel.HEADING_2 }),
    ...(skills.core ?? []).map(
      (s) => new Paragraph({ text: s, bullet: { level: 0 }, spacing: { after: 20 } }),
    ),
    new Paragraph({ text: 'Supporting', heading: HeadingLevel.HEADING_2, spacing: { before: 80 } }),
    ...(skills.supporting ?? []).map(
      (s) => new Paragraph({ text: s, bullet: { level: 0 }, spacing: { after: 20 } }),
    ),
    new Paragraph({ text: 'Other', heading: HeadingLevel.HEADING_2, spacing: { before: 80 } }),
    ...(skills.other ?? []).map(
      (s) => new Paragraph({ text: s, bullet: { level: 0 }, spacing: { after: 20 } }),
    ),
    new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_1, spacing: { before: 120 } }),
    ...projects.flatMap((project) => {
      const nodes = [
        new Paragraph({
          text: project.name ?? '',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 30 },
        }),
      ];
      if (project.shortDescription || project.description) {
        nodes.push(
          new Paragraph({
            text: project.shortDescription ?? project.description ?? '',
            spacing: { after: 60 },
          }),
        );
      }
      if (project.url ?? project.repoUrl) {
        nodes.push(
          new Paragraph({
            text: project.url ?? project.repoUrl,
            style: 'Hyperlink',
            spacing: { after: 80 },
          }),
        );
      }
      return nodes;
    }),
  ].filter(Boolean);

  const doc = new Document({
    creator: 'zekenaulty.github.io',
    title: `Resume - ${view.profileLabel ?? ''}`,
    description: view.headline ?? '',
    sections: [
      {
        properties: {
          alignment: AlignmentType.LEFT,
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function renderPdfResume(view) {
  const skills = normalizeSkills(view);
  const doc = new PDFDocument({ margin: 50 });

  const chunks = [];
  const bufferPromise = new Promise((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.font('Helvetica-Bold').fontSize(20).text('Zeke Naulty');
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(12).text(view.profileLabel ?? '', { lineGap: 2 });
  if (view.headline) {
    doc.font('Helvetica').fontSize(11).fillColor('#111111').text(view.headline, { lineGap: 4 });
  }
  doc.fillColor('#000000');
  doc.moveDown();

  doc.font('Helvetica-Bold').fontSize(13).text('Summary');
  doc.moveDown(0.2);
  (view.summary ?? []).forEach((p) => {
    doc.font('Helvetica').fontSize(11).text(p, { paragraphGap: 6 });
  });

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(13).text('Experience');
  doc.moveDown(0.2);
  (view.experience ?? []).forEach((job) => {
    const metaParts = [];
    const dateRange = formatDateRange(job);
    if (dateRange) metaParts.push(dateRange);
    if (job.location) metaParts.push(job.location);

    doc.font('Helvetica-Bold').fontSize(11).text(`${job.title ?? ''} - ${job.company ?? ''}`.trim());
    if (metaParts.length) {
      doc.font('Helvetica').fontSize(10).fillColor('#444444').text(metaParts.join(' | '));
    }
    doc.fillColor('#000000');

    (job.bullets ?? job.description ?? []).forEach((bullet) => {
      doc.font('Helvetica').fontSize(10).text(`- ${bullet}`, { indent: 12 });
    });
    if (job.skillsUsed?.length) {
      doc.font('Helvetica').fontSize(10).fillColor('#222222').text(`Tech: ${job.skillsUsed.join(', ')}`);
      doc.fillColor('#000000');
    }
    doc.moveDown();
  });

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(13).text('Skills');
  doc.moveDown(0.2);
  if (skills.core?.length) {
    doc.font('Helvetica-Bold').fontSize(11).text('Core');
    skills.core.forEach((s) => doc.font('Helvetica').fontSize(10).text(`- ${s}`, { indent: 12 }));
    doc.moveDown(0.4);
  }
  if (skills.supporting?.length) {
    doc.font('Helvetica-Bold').fontSize(11).text('Supporting');
    skills.supporting.forEach((s) => doc.font('Helvetica').fontSize(10).text(`- ${s}`, { indent: 12 }));
    doc.moveDown(0.4);
  }
  if (skills.other?.length) {
    doc.font('Helvetica-Bold').fontSize(11).text('Other');
    skills.other.forEach((s) => doc.font('Helvetica').fontSize(10).text(`- ${s}`, { indent: 12 }));
    doc.moveDown(0.4);
  }

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(13).text('Projects');
  doc.moveDown(0.2);
  (view.projects ?? []).forEach((project) => {
    doc.font('Helvetica-Bold').fontSize(11).text(project.name ?? '');
    if (project.shortDescription || project.description) {
      doc.font('Helvetica').fontSize(10).text(project.shortDescription ?? project.description ?? '', {
        indent: 12,
      });
    }
    const url = project.url ?? project.repoUrl;
    if (url) {
      doc.font('Helvetica').fontSize(10).fillColor('#1d4ed8').text(url, { indent: 12, link: url });
      doc.fillColor('#000000');
    }
    doc.moveDown();
  });

  doc.end();
  return bufferPromise;
}
