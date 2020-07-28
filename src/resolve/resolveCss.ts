//fork from https://github.com/dependents/node-sass-lookup

import * as path from 'path';
import * as fs from 'fs-extra';

export default function resolve({
  filename,
  dependency: dep,
  directory,
}: {
  filename: string;
  dependency: string;
  directory: string[] | string;
}): string {
  if (typeof dep === 'undefined') {
    throw new Error('dependency is not supplied');
  }

  if (typeof filename === 'undefined') {
    throw new Error('filename is not supplied');
  }

  if (typeof directory === 'undefined') {
    throw new Error('directory is not supplied');
  }

  const fileDir = path.dirname(filename);

  const ext = path.extname(dep) ? '' : path.extname(filename);

  const isSlashed = dep.indexOf('/') !== -1;
  const depDir = isSlashed ? path.dirname(dep) : '';
  const depName = (isSlashed ? path.basename(dep) : dep) + ext;

  const relativeToFile = findDependency(path.resolve(fileDir, depDir), depName);
  if (relativeToFile) {
    return relativeToFile;
  }

  const directories = typeof directory === 'string' ? [directory] : directory;

  let i;
  for (i in directories) {
    const dir = directories[i];
    const relativeToDir = findDependency(path.resolve(dir, depDir), depName);
    if (relativeToDir) {
      return relativeToDir;
    }
  }

  if (typeof directory === 'string') {
    return path.resolve(directory, depDir, depName);
  }

  return '';
}

function findDependency(searchDir: string, depName: string) {
  const nonPartialPath = path.resolve(searchDir, depName);
  if (fs.existsSync(nonPartialPath)) {
    return nonPartialPath;
  }
}
