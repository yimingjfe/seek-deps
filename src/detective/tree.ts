import * as path from 'path';
import * as fs from 'fs-extra';
import * as mm from 'micromatch';
import { resolvePath, ResolveOption } from '../resolve';
import { map, filter, forEach, some } from 'lodash';
import { DetectiveOptions } from '../getConfig';
import flatCache from 'flat-cache';
import resolve from 'resolve';
import { output } from '../output';
import { Dep, Deps } from '../Dep';

const fileCache = flatCache.load('find-deps-cache');

const cachedDeps: Deps = {};
let id = 0;

function createDep(absolutePath: string): Dep {
  const oldDep = cachedDeps[absolutePath];
  if (oldDep) return oldDep;
  const newDep = {
    id: id++,
    absolutePath: absolutePath,
    deps: {},
    refers: {},
  };
  cachedDeps[absolutePath] = newDep;
  return newDep;
}

async function readCode(filename: string): Promise<string> {
  let content = fileCache.getKey(filename);
  if (!content) {
    try {
      const buffer = await fs.readFile(filename);
      content = buffer.toString();
      fileCache.setKey(filename, content);
    } catch (error) {
      console.error(error);
    }
  }
  return content;
}

async function collectDep(
  resolveOption: ResolveOption,
  detectiveOptions: DetectiveOptions
): Promise<Dep | null> {
  let resolved = '';
  if (resolve.isCore(resolveOption.dependency)) {
    return createDep(resolveOption.dependency);
  }
  if (resolveOption.dependency.startsWith('http')) {
    return null;
  }
  try {
    resolved = await resolvePath(resolveOption);
  } catch (error) {
    return createDep(resolveOption.dependency);
  }
  if (!resolved) {
    return createDep(resolveOption.dependency);
  }
  if (detectiveOptions.exclude) {
    const isMatch = some(detectiveOptions.exclude, (exclude) =>
      mm.isMatch(resolved, exclude, {
        dot: true,
      })
    );
    if (isMatch) {
      return null;
    }
  }
  // 此处应该返回兄弟节点
  const subDeps = await detectiveTree(resolved, detectiveOptions);
  return subDeps;
}

export default async function detectiveTree(
  entry: string,
  options: DetectiveOptions
): Promise<Dep | null> {
  if (path.isAbsolute(entry)) {
    const cachedDep = cachedDeps[entry];
    if (cachedDep) return cachedDep;
  }
  try {
    const isExists = await fs.pathExists(entry);
    if (!isExists) {
      output(`Cannot found module ${entry}`, 'red');
      return null;
    }
  } catch (error) {
    output(`Cannot found module ${entry}`, 'red');
    return null;
  }
  let ext = path.extname(entry).slice(1);
  if (!ext) {
    if (options.miniProgram) {
      ext = 'json';
    } else {
      ext = 'js';
    }
  }
  let resolveType = ext;
  // TODO: resolve与ext建立map
  const dep = createDep(entry);
  const rules = options.rules;
  const detective = rules[ext];
  if (!detective) return null;
  let depFileNames;
  try {
    if (ext === 'json') {
      resolveType = 'mp';
      depFileNames = await detective(entry);
    } else if (ext === 'wxml' || ext === 'wxss') {
      if (ext === 'wxss') resolveType = 'css';
      const code = await readCode(entry);
      depFileNames = await detective(code);
    } else {
      const code = await readCode(entry);
      depFileNames = await detective(code, options.babelConfig);
    }
  } catch (error) {
    output(`error occur at detective ${entry}`, 'red');
    console.error(error);
  }
  let resolvedSubDeps;
  try {
    resolvedSubDeps = await Promise.all(
      map(depFileNames, (depFileName) =>
        collectDep(
          {
            modules: options.modules,
            dependency: depFileName,
            filename: entry,
            type: resolveType,
            context: options.context,
            webpackConfig: options.webpackConfig,
          },
          options
        )
      )
    );
  } catch (error) {
    console.error(error);
  }
  const subDeps = filter(resolvedSubDeps, (subDep) => !!subDep);
  forEach(subDeps as Dep[], (subDep) => {
    if (subDep) {
      dep.deps[subDep.absolutePath] = subDep;
      subDep.refers[entry] = dep;
    }
  });

  return dep;
}
