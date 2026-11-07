import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { buildSourceCatalog, compileSelection, digest, sha256, selectionSchema, SELECTION_INSTRUCTIONS, requireValue, ResumeToolError } from './resume-selection.js';
import { providerConfig, requestSelection, buildProviderRequest } from './resume-provider.js';
import { exportPrivateProfile } from '../export-private-resume.js';
import { guardDirectories } from './private-directory-guard.js';

const MAX_JOB_BYTES = 48000;
const MAX_REQUEST_BYTES = 160000;
const MAX_DRAFT_BYTES = 256000;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hasSecret = (text) => /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:api[_ -]?key|access[_ -]?token|password|client[_ -]?secret)\s*[:=]\s*\S+/i.test(text);

export function jobSlug(filename) {
  return path.basename(filename, path.extname(filename)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function createResumeService({ root, resume, fetchImpl, credentials } = {}) {
  const projectRoot = fs.realpathSync(root);
  const catalog = buildSourceCatalog(resume);
  const sourceHash = digest(catalog);
  const schema = selectionSchema(catalog);
  const privatePath = (...parts) => path.join(projectRoot, 'private', ...parts);

  function privateDir(name, { create = false } = {}) {
    for (const dir of [privatePath(), privatePath(name)]) {
      if (!fs.existsSync(dir) && !fs.lstatSync(dir, { throwIfNoEntry: false })) {
        if (!create) return null;
        fs.mkdirSync(dir, { mode: 0o700 });
      }
      const stat = fs.lstatSync(dir);
      requireValue(stat.isDirectory() && !stat.isSymbolicLink(), 'UNSAFE_PATH', 'Private directories must be real directories, not symlinks.');
    }
    return privatePath(name);
  }

  function readPrivateFile(dirName, filename, maxBytes) {
    const dir = privateDir(dirName);
    requireValue(dir, 'NOT_FOUND', 'The selected private directory does not exist.');
    const file = path.join(dir, filename);
    const stat = fs.lstatSync(file, { throwIfNoEntry: false });
    requireValue(stat, 'NOT_FOUND', 'The selected private file does not exist.');
    requireValue(stat.isFile() && !stat.isSymbolicLink() && stat.size <= maxBytes,
      'UNSAFE_INPUT', 'Selected input must be a regular file within the size limit, not a symlink.');
    const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    try {
      requireValue(fs.fstatSync(fd).size <= maxBytes, 'UNSAFE_INPUT', 'Input exceeds the size limit.');
      return fs.readFileSync(fd, 'utf8');
    } finally { fs.closeSync(fd); }
  }

  function readJob(job) {
    requireValue(typeof job === 'string' && job.length <= 160 && job === path.basename(job) &&
      !/[\\\x00-\x1f\x7f]/.test(job) && /\.(md|txt)$/i.test(job), 'INVALID_JOB', 'job must be one .md or .txt filename, not a path.');
    const text = readPrivateFile('job-descriptions', job, MAX_JOB_BYTES);
    requireValue(text.trim().length > 0, 'INVALID_JOB', 'The selected job description is empty.');
    requireValue(!hasSecret(text), 'POSSIBLE_SECRET', 'The selected job description may contain a credential. Remove it before continuing.');
    return { filename: job, sha256: sha256(text), bytes: Buffer.byteLength(text), text };
  }

  function prepare(request) {
    const job = readJob(request.job);
    const id = request.id ?? jobSlug(job.filename);
    requireValue(typeof id === 'string' && id.length <= 120 && slugPattern.test(id), 'INVALID_ID', 'id must be a lowercase hyphen-separated slug of at most 120 characters.');
    const config = providerConfig(request);
    // Keep stable canonical material ahead of the variable JD for reusable prompt prefixes.
    const payload = { instructions: SELECTION_INSTRUCTIONS, input: { canonicalSources: catalog, jobDescription: job.text }, schema };
    const wire = buildProviderRequest(config, payload);
    const requestBytes = Buffer.byteLength(JSON.stringify(wire.body));
    requireValue(requestBytes <= MAX_REQUEST_BYTES, 'INPUT_TOO_LARGE', 'The provider request exceeds the local input size limit.');
    requireValue(!hasSecret(JSON.stringify(catalog)), 'POSSIBLE_SECRET', 'Canonical data may contain a credential. Review it before continuing.');
    const inputHash = digest({ version: 1, id, job: { filename: job.filename, sha256: job.sha256 }, config, payload });
    return { job, id, config, payload, requestBytes, inputHash };
  }

  function preview(prepared) {
    const { job, id, config, inputHash, requestBytes } = prepared;
    return {
      id, job: { filename: job.filename, sha256: job.sha256, bytes: job.bytes }, config,
      inputHash, sourceHash, requestBytes,
      shares: ['Selected job-description text', 'Canonical resume facts and source text'],
      destination: config.provider === 'openai' ? 'OpenAI Responses API' : 'Google Gemini API',
      responseStorage: config.provider === 'openai' ? 'store:false; provider retention policies still apply' : 'Provider retention policies apply',
      attempts: 1, draftPath: privatePath('resume-profiles', `${id}.json`),
      outputMode: 'canonical-selection', roleOrder: 'canonical-chronological', requiresHumanReview: true,
    };
  }

  function reviewSummary(profile) {
    return {
      roleOrder: 'canonical-chronological',
      includedRoleIds: profile.experienceOrder,
      omittedRoleIds: catalog.roles.map((role) => role.id).filter((id) => !profile.experienceOrder.includes(id)),
      bulletCounts: Object.fromEntries(profile.experienceOrder.map((id) => [id, profile.experienceOverrides[id].description.length])),
    };
  }

  async function loadCredential(provider) {
    if (credentials) return credentials(provider);
    // Read credentials only for an explicitly approved generate request. Never include them in source data or output.
    dotenv.config({ path: path.join(projectRoot, '.env.local'), quiet: true });
    dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });
    return process.env[provider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY'];
  }

  async function generate(request) {
    requireValue(request.allowNetwork === true, 'NETWORK_NOT_APPROVED', 'generate requires allowNetwork:true for this selected job and provider.');
    const prepared = prepare(request);
    requireValue(request.expectedInputHash === prepared.inputHash, 'INPUT_CHANGED', 'Run prepare first and pass its inputHash as expectedInputHash. Inputs or settings changed.');
    const { id, job, config, payload } = prepared;
    const dir = privateDir('resume-profiles', { create: true });
    const directoriesUnchanged = guardDirectories([projectRoot, privatePath(), dir]);
    const output = path.join(dir, `${id}.json`);
    requireValue(!fs.lstatSync(output, { throwIfNoEntry: false }), 'ALREADY_EXISTS', 'Draft already exists. Select a new id; existing files are never overwritten.');
    const lock = path.join(dir, `.${id}.lock`);
    let fd;
    try { fd = fs.openSync(lock, 'wx', 0o600); } catch (error) {
      if (error.code === 'EEXIST') throw new ResumeToolError('GENERATION_IN_PROGRESS', 'This draft is already being generated. If an earlier process crashed, review its outcome before removing its local lock.');
      throw error;
    }
    const temp = path.join(dir, `.${id}.${randomUUID()}.tmp`);
    try {
      // A different process may have finished between the first check and this lock.
      requireValue(!fs.lstatSync(output, { throwIfNoEntry: false }), 'ALREADY_EXISTS', 'Draft already exists. No request was sent.');
      const { selection, usage } = await requestSelection(config, payload, { apiKey: await loadCredential(config.provider), fetchImpl });
      requireValue(directoriesUnchanged(), 'UNSAFE_PATH', 'Private output directories changed during generation. No draft was saved; review the original local lock before retrying.');
      const label = path.basename(job.filename, path.extname(job.filename));
      const profile = compileSelection(selection, catalog, resume, { id, label });
      profile._generation = {
        version: 1, mode: 'canonical-selection', sourceHash, inputHash: prepared.inputHash,
        job: { filename: job.filename, sha256: job.sha256 }, config, usage,
        selection, createdAt: new Date().toISOString(), requiresHumanReview: true,
      };
      const bytes = `${JSON.stringify(profile, null, 2)}\n`;
      fs.writeFileSync(temp, bytes, { flag: 'wx', mode: 0o600 });
      fs.linkSync(temp, output); // Atomic publication within private/: fails rather than replacing any existing path.
      return { ...preview(prepared), draftHash: sha256(bytes), usage, review: reviewSummary(profile), warnings: ['Jobs retain canonical chronology. Review omitted roles, selected text, and canonical facts before sharing. Nothing was published.'] };
    } finally {
      fs.closeSync(fd);
      // Never follow a replaced parent path for cleanup either.
      if (directoriesUnchanged()) {
        fs.rmSync(temp, { force: true });
        fs.rmSync(lock, { force: true });
      }
    }
  }

  function validateDraft(id) {
    requireValue(typeof id === 'string' && id.length <= 120 && slugPattern.test(id), 'INVALID_ID', 'Select one draft by its lowercase hyphen-separated id.');
    const bytes = readPrivateFile('resume-profiles', `${id}.json`, MAX_DRAFT_BYTES);
    let profile;
    try { profile = JSON.parse(bytes); } catch { throw new ResumeToolError('INVALID_PROFILE', 'Selected draft is not valid JSON.'); }
    const generation = profile?._generation;
    requireValue(generation?.version === 1 && generation.mode === 'canonical-selection' && generation.sourceHash === sourceHash && profile.id === id,
      'SOURCE_CHANGED', 'Draft provenance is missing or canonical sources changed. Regenerate or review the draft privately.');
    requireValue(typeof generation.job?.filename === 'string' && generation.job.filename === path.basename(generation.job.filename),
      'INVALID_PROFILE', 'Draft job provenance is invalid.');
    const label = path.basename(generation.job.filename, path.extname(generation.job.filename));
    const expected = compileSelection(generation.selection, catalog, resume, { id, label });
    const { _generation, ...savedProfile } = profile;
    requireValue(digest(savedProfile) === digest(expected), 'DRAFT_CHANGED', 'Draft text or fields differ from the verified source selection. Regenerate or review separately.');
    return { profile, draftHash: sha256(bytes), draftPath: privatePath('resume-profiles', `${id}.json`) };
  }

  async function execute(request) {
    requireValue(request && typeof request === 'object' && !Array.isArray(request) && request.version === 1,
      'INVALID_REQUEST', 'Supply one JSON object with version:1.');
    const common = ['version', 'action'];
    const generation = ['job', 'id', 'provider', 'model', 'reasoning', 'maxOutputTokens'];
    const fields = {
      list_jobs: [], inspect_job: ['job'], prepare: generation,
      generate: [...generation, 'allowNetwork', 'expectedInputHash'],
      validate: ['id'], export: ['id', 'expectedDraftHash'],
    };
    requireValue(Object.hasOwn(fields, request.action), 'INVALID_ACTION', 'Unknown action. Use list_jobs, inspect_job, prepare, generate, validate, or export.');
    requireValue(Object.keys(request).every((key) => [...common, ...fields[request.action]].includes(key)), 'INVALID_REQUEST', 'Request contains unsupported fields.');
    let result;
    switch (request.action) {
      case 'list_jobs': {
        const dir = privateDir('job-descriptions');
        result = { jobs: dir ? fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && /\.(md|txt)$/i.test(entry.name))
          .map((entry) => ({ filename: entry.name, suggestedId: jobSlug(entry.name) })).sort((a, b) => a.filename.localeCompare(b.filename)) : [] };
        break;
      }
      case 'inspect_job': result = { job: readJob(request.job) }; break;
      case 'prepare': result = preview(prepare(request)); break;
      case 'generate': result = await generate(request); break;
      case 'validate': {
        const { profile, ...info } = validateDraft(request.id);
        result = { ...info, id: profile.id, sourceHash, review: reviewSummary(profile), requiresHumanReview: true }; break;
      }
      case 'export': {
        const { profile, draftHash } = validateDraft(request.id);
        requireValue(request.expectedDraftHash === draftHash, 'DRAFT_CHANGED', 'Pass the draftHash returned by generate or validate. The selected draft must not change.');
        const outputDir = await exportPrivateProfile(profile, { rootDir: projectRoot, data: resume, selectedSkillsOnly: true });
        result = { id: profile.id, draftHash, outputDir, files: ['index.html', 'resume.txt', 'resume.docx', 'resume.pdf'].map((name) => path.join(outputDir, name)), review: reviewSummary(profile), requiresHumanReview: true }; break;
      }
    }
    return { version: 1, ok: true, action: request.action, result };
  }
  return { execute };
}
