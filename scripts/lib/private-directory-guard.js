import fs from 'node:fs';

// Detect path replacement across long asynchronous work. This is not a sandbox
// against a hostile process racing each filesystem operation as the same user.
export function guardDirectories(paths) {
  const snapshots = paths.map((name) => {
    const stat = fs.lstatSync(name);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Private output directory is unsafe.');
    return { name, dev: stat.dev, ino: stat.ino };
  });
  return () => snapshots.every(({ name, dev, ino }) => {
    const stat = fs.lstatSync(name, { throwIfNoEntry: false });
    return stat?.isDirectory() && !stat.isSymbolicLink() && stat.dev === dev && stat.ino === ino;
  });
}
