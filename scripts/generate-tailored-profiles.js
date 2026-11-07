// Human CLI compatibility wrapper over the same private service used by assistants.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resumeService, errorResponse } from './resume-tool.js';
import { ResumeToolError } from './lib/resume-selection.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) {
    console.log('Usage: npm run generate:tailored-profiles -- [--provider openai|gemini] [--model <id>] [--reasoning high] <job.md> [another.txt]');
    console.log('Use --all to explicitly select every local job description. Existing drafts are skipped, never overwritten.');
    console.log('Sends selected JDs and canonical sources to the chosen provider; generates private source-backed selections. No site build or publication.');
    return;
  }
  const files = [];
  const options = { provider: process.env.RESUME_PROVIDER || 'openai' };
  let all = false;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--all') all = true;
    else if (['--provider', '--model', '--reasoning', '--max-output-tokens'].includes(arg)) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new ResumeToolError('INVALID_REQUEST', 'Missing flag value.');
      const key = arg === '--max-output-tokens' ? 'maxOutputTokens' : arg.slice(2);
      options[key] = key === 'maxOutputTokens' ? Number(value) : value;
    } else if (arg.startsWith('-')) throw new ResumeToolError('INVALID_REQUEST', 'Unknown flag.');
    else files.push(arg);
  }
  if (all && files.length) throw new ResumeToolError('INVALID_REQUEST', 'Choose filenames or --all, not both.');
  options.model ??= options.provider === 'openai' ? process.env.OPENAI_MODEL : process.env.GEMINI_MODEL?.replace(/^models\//, '');
  options.reasoning ??= process.env.OPENAI_REASONING_EFFORT;
  for (const key of Object.keys(options)) if (options[key] === undefined) delete options[key];
  const jobs = all ? (await resumeService.execute({ version: 1, action: 'list_jobs' })).result.jobs.map((job) => job.filename) : files;
  if (!jobs.length) throw new ResumeToolError('INVALID_REQUEST', 'No selected job descriptions found. Choose a filename or use --all.');
  for (const job of jobs) {
    try {
      const prepared = (await resumeService.execute({ version: 1, action: 'prepare', job, ...options })).result;
      if (fs.lstatSync(prepared.draftPath, { throwIfNoEntry: false })) {
        console.log(`Skipped existing private draft: ${path.relative(root, prepared.draftPath)}`);
        continue;
      }
      const generated = await resumeService.execute({ version: 1, action: 'generate', job, ...options, allowNetwork: true, expectedInputHash: prepared.inputHash });
      console.log(JSON.stringify(generated));
    } catch (error) {
      console.error(JSON.stringify(errorResponse(error)));
      process.exitCode = 1;
    }
  }
}
main().catch((error) => {
  console.error(JSON.stringify(errorResponse(error)));
  process.exitCode = 1;
});
