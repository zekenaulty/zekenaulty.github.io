import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resumeData } from '../src/data/resume/resumeData.node.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const SITE_URL = 'https://zekenaulty.github.io/';

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toAbsoluteUrl = (pathname) => new URL(pathname, SITE_URL).toString();

const publicProfiles = (resumeData.profiles.visible ?? [])
  .filter((profile) => profile?.id && profile.published !== false)
  .sort((a, b) => a.id.localeCompare(b.id));

const defaultProfile = publicProfiles.find(
  (profile) => profile.id === resumeData.profiles.defaultProfileId,
);
const orderedProfiles = [
  ...(defaultProfile ? [defaultProfile] : []),
  ...publicProfiles.filter((profile) => profile.id !== defaultProfile?.id),
];

const urls = [
  SITE_URL,
  ...orderedProfiles.map((profile) => toAbsoluteUrl(`/resume/${profile.id}/`)),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
console.log(`Wrote sitemap with ${urls.length} public URLs to ${OUTPUT_PATH}`);
