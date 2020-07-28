const refpath = `["'](.+?)["']`;
const importReg = new RegExp(
  `@import\\s+?.*?(${refpath}(?:,\\s*${refpath})*)`,
  'gim'
);
const urlReg = /url\(["']?(.*?)["']?\)/gi;

const defaultFileType = 'js';

function execReg(reg: RegExp, str: string) {
  const matchs = [];
  let match;
  while ((match = reg.exec(str)) !== null) {
    matchs.push(match);
  }
  return matchs;
}

function getCaptureStr(reg: RegExp, str: string): string[] {
  const captures = [];
  let match;
  while ((match = reg.exec(str)) !== null) {
    if (match[0]) captures.push(match[1]);
  }
  return captures;
}

function getImportPaths(code: string) {
  let importPaths: string[] = [];
  const matchedImports = code.match(importReg);
  matchedImports &&
    matchedImports.forEach((importStr) => {
      const paths = getCaptureStr(/["'](.*?)["']/g, importStr);
      if (paths) importPaths = importPaths.concat(paths);
    });
  return importPaths;
}

function getUrlPaths(code: string) {
  const urlPaths: string[] = getCaptureStr(urlReg, code);
  return urlPaths.filter((url) => !url.startsWith('data:'));
}

function parseCss(code: string) {
  const importPaths = getImportPaths(code);
  const urlPaths = getUrlPaths(code);
  return importPaths.concat(urlPaths);
}

export default function detectiveCss(code: string): string[] {
  const collectedPath: string[] = parseCss(code);
  return collectedPath;
}
