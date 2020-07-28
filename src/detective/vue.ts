import detectiveCss from './css';
import detectiveJs from './js';
import { get, flatten, filter, map, isString } from 'lodash';
import * as compiler from 'vue-template-compiler';
import { ParserOptions } from '@babel/parser';
import { parse, SFCBlock } from '@vue/component-compiler-utils';

function getElemDeps(
  elem: SFCBlock | null,
  babelConfig?: ParserOptions
): string[] | null {
  const content = get(elem, 'content');
  if (!elem || typeof content !== 'string') return null;
  let collectDeps = [];
  if (elem.type === 'script') {
    collectDeps = detectiveJs(content, babelConfig);
  } else {
    collectDeps = detectiveCss(content);
  }
  return collectDeps;
}

export default function detectiveVue(
  code: string,
  babelConfig?: ParserOptions
): string[] {
  const descriptor = parse({
    source: code,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    compiler: compiler,
    needMap: false,
  });
  const styles = descriptor.styles;
  const script = descriptor.script;
  const styleDeps = flatten(
    map(styles, (elem: SFCBlock) => getElemDeps(elem, babelConfig))
  );
  const scriptDeps = getElemDeps(script, babelConfig);
  return filter(styleDeps.concat(scriptDeps), isString);
}
