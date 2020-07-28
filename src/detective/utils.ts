import * as path from 'path';

function addExtName(filename: string, ext: string): string {
  if (!path.extname(filename)) {
    return replaceExt(filename, ext);
  }
  return filename;
}

function replaceExt(filename: string, ext: string): string {
  const oldExt = path.extname(filename);
  if (oldExt) {
    return filename.replace(oldExt, ext);
  } else {
    return filename + `.${ext}`;
  }
}

export { addExtName, replaceExt };
