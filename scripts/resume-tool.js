import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resumeData } from '../src/data/resume/resumeData.node.js';
import { createResumeService } from './lib/private-resume-service.js';
import { ResumeToolError } from './lib/resume-selection.js';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
export const resumeService = createResumeService({ root, resume: resumeData });

export function errorResponse(error) {
  return { version: 1, ok: false, error: {
    code: error instanceof ResumeToolError ? error.code : 'LOCAL_ERROR',
    message: error instanceof ResumeToolError ? error.message : 'Local operation failed. Check file access and output directories. No automatic retry was made.',
  } };
}

async function main() {
  if (process.argv.length === 3 && process.argv[2] === '--help') {
    console.log(JSON.stringify({ version: 1, transport: 'One JSON request on stdin; one JSON result on stdout; nonzero exit on error', actions: ['list_jobs', 'inspect_job', 'prepare', 'generate', 'validate', 'export'], documentation: 'docs/private-resume-tool.md' }));
    return;
  }
  if (process.argv.length !== 2 || process.stdin.isTTY) throw new ResumeToolError('INVALID_REQUEST', 'Pass one JSON request on stdin; use --help for the contract.');
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > 16000) throw new ResumeToolError('INVALID_REQUEST', 'Request exceeds 16000 bytes. Job text belongs in a selected private file.');
    chunks.push(chunk);
  }
  let request;
  try { request = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ResumeToolError('INVALID_REQUEST', 'stdin must contain exactly one JSON request.'); }
  console.log(JSON.stringify(await resumeService.execute(request)));
}

if (process.argv[1] === filename) main().catch((error) => {
  console.log(JSON.stringify(errorResponse(error)));
  process.exitCode = 1;
});
