import { replaceExt } from '../utils';
import * as fs from 'fs-extra';

export default async function detectiveJson(entry: string): Promise<string[]> {
  let config;
  try {
    config = require(entry);
  } catch (error) {
    console.error(error);
    return [];
  }
  const pages = config.pages || {};
  const usingComponents = config.usingComponents || {};
  let depPaths: string[] = Object.values(pages);
  depPaths = depPaths.concat(Object.values(usingComponents));
  const otherExtDeps = await getOtherExtDeps(entry);
  depPaths = depPaths.concat(otherExtDeps);
  return depPaths;
}

async function getOtherExtDeps(entry: string): Promise<string[]> {
  const miniProgramExts = [
    '.wxss',
    '.wxs',
    '.wxml',
    '.js',
    '.ts',
    '.css',
    '.less',
    '.sass',
    '.scss',
  ];
  const files = miniProgramExts.map((ext) => {
    return replaceExt(entry, ext);
  });
  const existedFiles = [];
  for (const file of files) {
    const isExist = await fs.pathExists(file);
    if (isExist) {
      existedFiles.push(file);
    }
  }
  return existedFiles;
}
