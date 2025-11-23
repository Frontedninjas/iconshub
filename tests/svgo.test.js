import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import * as svgoConfig from '../scripts/svgo.config.js';
import { describe, it, expect } from 'vitest';

describe('svgo config and optimization', () => {
  it('config has multipass and reduces size', () => {
    expect(svgoConfig.multipass).toBeTruthy();

    const iconsDir = path.resolve('src/icons');
    const icons = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));
    expect(icons.length).toBeGreaterThan(0);

    const file = icons[0];
    const original = fs.readFileSync(path.join(iconsDir, file), 'utf8');
    const result = optimize(original, svgoConfig);
    expect(result).toBeTruthy();
    expect(result.data.length).toBeLessThanOrEqual(original.length);

    // if original had viewBox, ensure it's preserved
    if (/viewBox=/.test(original)) {
      expect(/viewBox=/.test(result.data)).toBe(true);
    }
  });
});
