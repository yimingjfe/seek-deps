import * as resolve from 'resolve';
import * as path from 'path';
import resolveCssPath from './resolveCss';
import resolveMp from './resolveMp';
import { create as createResolve } from 'enhanced-resolve';
import { output } from '../output';

interface ResolveOption {
  dependency: string;
  type: string;
  filename: string;
  modules: string[];
  context?: string; // 项目目录，小程序项目需要使用
  webpackConfig?: string;
}

let webpackResolve: any = null;

async function resolvePath(resolveOption: ResolveOption): Promise<string> {
  const { type } = resolveOption;
  switch (type) {
    case 'css': {
      const { dependency, filename, modules: directory } = resolveOption;
      return resolveCssPath({ dependency, filename, directory });
    }
    case 'mp': {
      const { dependency, filename, context } = resolveOption;
      return await resolveMp({ dependency, filename, context });
    }
    default:
      return await resolveJsPath(resolveOption);
  }
}

async function resolveJsPath(resolveOption: ResolveOption): Promise<string> {
  const { filename, dependency, modules, webpackConfig } = resolveOption;
  if (webpackConfig) {
    let loadedConfig;
    try {
      loadedConfig = require(webpackConfig);
      if (typeof loadedConfig === 'function') {
        loadedConfig = loadedConfig();
      }
    } catch (error) {
      output('cannot resolve webpack config at' + webpackConfig, 'red');
      process.exit(1);
    }
    if (typeof loadedConfig.resolve === 'object') {
      if (!webpackResolve) {
        try {
          webpackResolve = createResolve({
            extensions: ['.js', '.ts', '.jsx', '.tsx'],
            ...loadedConfig.resolve,
          });
        } catch (error) {
          console.error(error);
        }
      }
      return new Promise((resolve, reject) => {
        webpackResolve(
          path.dirname(filename),
          dependency,
          (err: Error, res: string) => {
            if (err) reject(err);
            return resolve(res);
          }
        );
      });
    }
  }
  let resolved;
  try {
    resolved = resolve.sync(dependency, {
      basedir: path.dirname(filename),
      extensions: ['.js', '.ts', '.jsx', '.tsx'],
      moduleDirectory: modules,
    });
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      output(error.message, 'red');
    }
    return dependency;
  }
  return resolved;
}

export { resolvePath, ResolveOption };
