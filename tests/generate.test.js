import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

const srcIcons = path.resolve('src/icons');
const reactDir = path.resolve('src/react');
const svelteDir = path.resolve('src/svelte');
const rawDir = path.resolve('src/raw');

describe('icon generator', () => {
  it('generates files and optimizes svg size', () => {
    const icons = fs.readdirSync(srcIcons).filter((f) => f.endsWith('.svg'));
    expect(icons.length).toBeGreaterThan(0);

    // run generator
    execSync('node scripts/generate-icons.js', { stdio: 'inherit' });

    // pick the first icon for assertions
    const file = icons[0];
    const name = file.replace('.svg', '');
    const pascal = (s) => s.split(/[-_\s]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    const comp = pascal(name) + 'Icon';

    // check files exist
    const rawPath = path.join(rawDir, `${name}.js`);
    const sveltePath = path.join(svelteDir, `${name}.svelte`);
    const reactPath = path.join(reactDir, `${comp}.jsx`);

    expect(fs.existsSync(rawPath)).toBe(true);
    expect(fs.existsSync(sveltePath)).toBe(true);
    expect(fs.existsSync(reactPath) || fs.existsSync(path.join(reactDir, `${comp}.js`))).toBe(true);

    // read original and optimized
    const original = fs.readFileSync(path.join(srcIcons, file), 'utf8');
    const rawContent = fs.readFileSync(rawPath, 'utf8');
    const m = rawContent.match(/export default\s+(.+)$/s);
    expect(m).not.toBeNull();
    const optimized = JSON.parse(m[1]);

    // optimized shouldn't be larger than original (allow equality)
    expect(optimized.length).toBeLessThanOrEqual(original.length);

    // svelte should export size and contain svg
    const svelteContent = fs.readFileSync(sveltePath, 'utf8');
    expect(svelteContent.includes('export let size')).toBe(true);
    expect(svelteContent.includes('<svg')).toBe(true);

    // react file should spread props or have dangerouslySetInnerHTML
    const reactContent = fs.readFileSync(fs.existsSync(reactPath) ? reactPath : path.join(reactDir, `${comp}.js`), 'utf8');
    expect(/props/.test(reactContent) || /dangerouslySetInnerHTML/.test(reactContent)).toBe(true);
  });
});
