import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const projects = require('./projects.json');

export default projects;
