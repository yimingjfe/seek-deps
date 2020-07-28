import { detective } from './detective';
import { getConfig, DetectiveOptions } from './getConfig';
import { Dep } from './Dep';
import * as path from 'path';

type PartialRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export async function seek(
  options: PartialRequired<DetectiveOptions, 'entry' | 'context'>
): Promise<void> {
  process.env.rootDir = path.resolve(__dirname, '../');
  const config = getConfig(options);
  // eslint-disable-next-line prefer-const
  let { entry, render, context } = config;
  if (path.isAbsolute(context)) context = path.resolve(context);
  if (!Array.isArray(entry)) entry = [entry];
  const deps = await Promise.all(
    entry.map((entryItem) => {
      if (!path.isAbsolute(entryItem)) {
        entryItem = path.resolve(entryItem);
      }
      return detective(entryItem, config);
    })
  );
  render && render(deps as Dep[], context);
}
