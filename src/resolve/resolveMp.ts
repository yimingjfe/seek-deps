import * as path from 'path';
import * as fs from 'fs-extra';

/**
 *
 * 小程序只允许一个目录
 */
export default async function resolveMp({
  dependency: dep,
  filename,
  context,
}: {
  dependency: string;
  filename: string;
  context: string | undefined;
}): Promise<string> {
  if (typeof dep === 'undefined') {
    throw new Error('dependency is not supplied');
  }

  if (typeof filename === 'undefined') {
    throw new Error('filename is not supplied');
  }

  if (typeof context === 'undefined') {
    throw new Error('context is not supplied');
  }

  const fileDir = path.dirname(filename);
  const ext = path.extname(dep) ? '' : path.extname(filename);
  let depDir = path.dirname(dep);
  const isSlashed = dep.indexOf('/') !== -1;
  const depName = (isSlashed ? path.basename(dep) : dep) + ext;
  let resolvedDepPath;

  if (path.isAbsolute(dep)) {
    if (await fs.pathExists(dep)) {
      return dep;
    } else {
      depDir = depDir.slice(1);
      resolvedDepPath = path.resolve(context, depDir, depName);
    }
  } else {
    resolvedDepPath = path.resolve(fileDir, depDir, depName);
  }
  if (await fs.pathExists(resolvedDepPath)) {
    return resolvedDepPath;
  }
  return '';
}
