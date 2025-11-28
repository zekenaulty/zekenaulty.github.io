import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resumeExportsRoot = path.resolve(__dirname, 'dist', 'resume');

const contentTypeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

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
  plugins: [react(), serveResumeExports()],
});
