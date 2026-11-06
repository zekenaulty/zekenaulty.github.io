import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'src/data/resume/profiles/generated/';
const DESTINATION = path.join(ROOT, 'private', 'recovered-generated-profiles');
const git = (...args) => execFileSync('git', args, { cwd: ROOT });

// A deliberate, local recovery step. Never rewrites history, publishes, or
// overwrites a different local draft. The destination remains gitignored.
export function recoverDrafts(ref) {
  if (!ref || ref.startsWith('-')) throw new Error('Provide --ref <commit-or-branch>.');
  const commit = git('rev-parse', '--verify', `${ref}^{commit}`).toString().trim();
  const files = git('ls-tree', '-r', '--name-only', '-z', commit, '--', SOURCE)
    .toString().split('\0').filter((file) => file.endsWith('.json'));
  if (!files.length) throw new Error(`No generated JSON drafts found at ${commit}.`);

  const drafts = files.map((source) => {
    if (!source.startsWith(SOURCE) || path.dirname(source) !== SOURCE.slice(0, -1)) {
      throw new Error(`Unexpected draft path: ${source}`);
    }
    const bytes = git('show', `${commit}:${source}`);
    const destination = path.join(DESTINATION, path.basename(source));
    if (fs.existsSync(destination) && !fs.readFileSync(destination).equals(bytes)) {
      throw new Error(`Refusing to overwrite a different local file: ${destination}`);
    }
    return { source, destination, bytes };
  });

  // Validate every destination before writing any file.
  fs.mkdirSync(DESTINATION, { recursive: true });
  const manifest = { sourceCommit: commit, files: [] };
  for (const draft of drafts) {
    if (!fs.existsSync(draft.destination)) fs.writeFileSync(draft.destination, draft.bytes, { flag: 'wx' });
    const recovered = fs.readFileSync(draft.destination);
    if (!recovered.equals(draft.bytes)) throw new Error(`Verification failed: ${draft.destination}`);
    manifest.files.push({
      source: draft.source,
      destination: path.relative(ROOT, draft.destination),
      bytes: recovered.length,
      sha256: createHash('sha256').update(recovered).digest('hex'),
    });
  }
  const manifestPath = path.join(DESTINATION, `recovery-${commit}.json`);
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  if (fs.existsSync(manifestPath) && !fs.readFileSync(manifestPath).equals(manifestBytes)) {
    throw new Error(`Refusing to overwrite a different manifest: ${manifestPath}`);
  }
  if (!fs.existsSync(manifestPath)) fs.writeFileSync(manifestPath, manifestBytes, { flag: 'wx' });
  return { count: drafts.length, destination: DESTINATION, manifestPath };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--ref') throw new Error('Usage: node scripts/recover-resume-drafts.js --ref <commit-or-branch>');
    const result = recoverDrafts(args[1]);
    console.log(`Recovered and byte-verified ${result.count} drafts into ${result.destination}.`);
    console.log(`Checksum manifest: ${result.manifestPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
