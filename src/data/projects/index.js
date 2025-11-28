const isNode = typeof process !== 'undefined' && !!process.versions?.node;

async function loadJson(modulePath) {
  if (isNode) {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    return require(modulePath);
  }
  const mod = await import(modulePath);
  return mod.default ?? mod;
}

const projects = await loadJson('./projects.json');

export default projects;
