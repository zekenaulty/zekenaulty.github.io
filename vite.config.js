import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getProfileView, resumeData } from './src/data/resume/resumeData.node.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resumeExportsRoot = path.resolve(__dirname, 'dist', 'resume');
const siteUrl = 'https://zekenaulty.github.io/';

const contentTypeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeJsonForHtml = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const buildMetaDescription = (view) => {
  const firstAbout = view.about?.paragraphs?.[0] ?? view.summary?.[0] ?? '';
  const text = `${view.headline ?? ''} ${firstAbout}`.replace(/\s+/g, ' ').trim();
  return text.length > 155 ? `${text.slice(0, 152).trim()}...` : text;
};

const buildStructuredData = (view) => {
  const skills = [
    ...(view.skillsPrimary ?? []),
    ...(view.skillsSecondary ?? []),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}#zeke-naulty`,
        name: 'Zeke Naulty',
        url: siteUrl,
        jobTitle: view.profileLabel,
        description: buildMetaDescription(view),
        knowsAbout: skills,
      },
      {
        '@type': 'ProfilePage',
        '@id': siteUrl,
        url: siteUrl,
        name: 'Zeke Naulty | Resume',
        description: buildMetaDescription(view),
        mainEntity: { '@id': `${siteUrl}#zeke-naulty` },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'Zeke Naulty',
        publisher: { '@id': `${siteUrl}#zeke-naulty` },
      },
    ],
  };
};

const buildStaticHomepageFallback = () => {
  const view = getProfileView(resumeData.profiles.defaultProfileId);
  const visibleProfiles = resumeData.profiles.visible ?? resumeData.profiles.all ?? [];
  const aboutParagraphs = view.about?.paragraphs ?? view.summary ?? [];

  const profileLinks = visibleProfiles
    .map((profile) => {
      const href = `/resume/${profile.id}/`;
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(profile.label)}</a></li>`;
    })
    .join('\n');

  const aboutHtml = aboutParagraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n');

  const experienceHtml = (view.experiences ?? [])
    .map((job) => {
      const bullets = (job.bullets ?? job.description ?? [])
        .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
        .join('\n');
      const meta = [job.dateRangeText, job.location].filter(Boolean).join(' | ');
      const skills = (job.skillsUsed ?? []).join(', ');

      return `
        <article>
          <h3>${escapeHtml(job.title)} - ${escapeHtml(job.company)}</h3>
          ${meta ? `<p class="static-meta">${escapeHtml(meta)}</p>` : ''}
          ${job.summary ? `<p>${escapeHtml(job.summary)}</p>` : ''}
          ${bullets ? `<ul>${bullets}</ul>` : ''}
          ${skills ? `<p class="static-meta">Technologies: ${escapeHtml(skills)}</p>` : ''}
        </article>
      `;
    })
    .join('\n');

  const skillList = [
    ...(view.skillsPrimary ?? []),
    ...(view.skillsSecondary ?? []),
  ]
    .map((skill) => `<li>${escapeHtml(skill)}</li>`)
    .join('\n');

  return `
    <main id="static-profile-content" class="static-profile-content">
      <section>
        <p class="static-eyebrow">Resume profile</p>
        <h1>Zeke Naulty</h1>
        <h2>${escapeHtml(view.headline)}</h2>
        <p class="static-meta">${escapeHtml(view.profileLabel)}</p>
        ${aboutHtml}
      </section>

      <section>
        <h2>Resume Profiles</h2>
        <ul>${profileLinks}</ul>
      </section>

      <section>
        <h2>Experience</h2>
        ${experienceHtml}
      </section>

      <section>
        <h2>Focus Areas</h2>
        <ul>${skillList}</ul>
      </section>
    </main>
  `;
};

const staticFallbackCss = `
  .static-profile-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 56px;
    color: #e5e7eb;
    background: #0b1020;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
  }
  .static-profile-content h1,
  .static-profile-content h2,
  .static-profile-content h3 {
    line-height: 1.2;
  }
  .static-profile-content h1 {
    margin: 0 0 8px;
    font-size: 2.25rem;
  }
  .static-profile-content h2 {
    margin: 24px 0 10px;
    color: #9fb4ff;
  }
  .static-profile-content h3 {
    margin: 18px 0 4px;
  }
  .static-profile-content section {
    margin-top: 28px;
  }
  .static-profile-content article {
    border-top: 1px solid rgba(255,255,255,0.18);
    padding-top: 14px;
    margin-top: 14px;
  }
  .static-profile-content a {
    color: #9fb4ff;
  }
  .static-profile-content ul {
    padding-left: 22px;
  }
  .static-eyebrow,
  .static-meta {
    color: #9ca3af;
  }
`;

function injectStaticHomepageFallback() {
  return {
    name: 'inject-static-homepage-fallback',
    transformIndexHtml(html) {
      const view = getProfileView(resumeData.profiles.defaultProfileId);
      const description = buildMetaDescription(view);
      const structuredData = buildStructuredData(view);
      const headTags = [
        `<meta name="description" content="${escapeHtml(description)}" />`,
        `<link rel="canonical" href="${siteUrl}" />`,
        `<script type="application/ld+json">${escapeJsonForHtml(structuredData)}</script>`,
        `<style>${staticFallbackCss}</style>`,
      ].join('\n    ');

      return html
        .replace('</head>', `    ${headTags}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root"></div>\n    ${buildStaticHomepageFallback()}`);
    },
  };
}

function serveResumeExports() {
  return {
    name: 'serve-resume-exports',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/resume', (req, res, next) => {
        const requestPath = decodeURIComponent((req.url || '').split('?')[0] ?? '/');
        const relativePath = requestPath.startsWith('/') ? requestPath.slice(1) : requestPath;
        const candidate = path.resolve(resumeExportsRoot, relativePath || '.');

        if (!candidate.startsWith(resumeExportsRoot)) {
          return next();
        }

        let filePath = candidate;
        let stat = null;
        try {
          stat = fs.statSync(filePath);
        } catch {
          stat = null;
        }

        if (stat?.isDirectory()) {
          const indexPath = path.join(filePath, 'index.html');
          if (fs.existsSync(indexPath)) {
            filePath = indexPath;
          } else {
            return next();
          }
        } else if (!stat?.isFile()) {
          return next();
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = contentTypeByExt[ext] ?? 'application/octet-stream';
        res.statusCode = 200;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-cache');
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [react(), injectStaticHomepageFallback(), serveResumeExports()],
});
