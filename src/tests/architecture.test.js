/**
 * @file architecture.test.js
 * @description 数字园区模块的自动化验证与测试夹具。
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? filesIn(resolve(directory, entry.name))
        : [resolve(directory, entry.name)],
    ),
  );
  return groups.flat().filter((file) => /\.(js|jsx)$/.test(file));
}

test('模块依赖方向保持清晰：领域无框架，渲染层不读数据仓库，应用 Hook 不引用界面', async () => {
  for (const file of await filesIn(sourceRoot)) {
    const importer = relative(sourceRoot, file);
    if (importer.startsWith('tests/')) {
      continue;
    }
    const text = await readFile(file, 'utf8');
    const imports = [...text.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g)].map(
      (match) => match[1],
    );
    for (const dependency of imports) {
      const target = dependency.startsWith('.')
        ? relative(sourceRoot, resolve(dirname(file), dependency))
        : dependency;
      const message = `${importer} 不应依赖 ${target}`;
      if (importer.startsWith('domain/')) {
        assert.ok(!/^(app|ui|features|infrastructure)\//.test(target), message);
        assert.ok(!/^(react|three|@react-three|echarts)/.test(target), message);
      }
      if (importer.startsWith('ui/') || importer.startsWith('features/scene/')) {
        assert.ok(!/^app\//.test(target), message);
        assert.ok(!/^infrastructure\/(data|repositories)\//.test(target), message);
      }
      if (importer.startsWith('app/hooks/')) {
        assert.ok(!/^(ui|features|infrastructure)\//.test(target), message);
      }
    }
  }
});
