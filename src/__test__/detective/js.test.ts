import detective from '../../detective/js';
import defaultOptions from '../../defaultOptions';
import { ParserOptions } from '@babel/parser';

const babelConfig = defaultOptions.babelConfig as ParserOptions;

describe('js works', function () {
  it('support es module', function () {
    const deps = detective('import {foo, bar} from "mylib";', babelConfig);
    expect(deps.length).toBe(1);
    expect(deps).toEqual(['mylib']);
  });

  it('support relative path', function () {
    const deps = detective('import {foo, bar} from "./mylib";', babelConfig);
    expect(deps.length).toBe(1);
    expect(deps).toEqual(['./mylib']);
  });

  it('support commonJs module', () => {
    const deps = detective('const foo = require("mylib")', babelConfig);
    expect(deps.length).toBe(1);
    expect(deps).toEqual(['mylib']);
  });

  it('support re-export', () => {
    const code = `export {foo, bar} from "mylib"`;
    const deps = detective(code, babelConfig);
    expect(deps.length).toBe(1);
    expect(deps).toEqual(['mylib']);
  });

  it('support multiple imports', () => {
    const code = `import {foo, bar} from "mylib";\nimport "mylib2"`;
    const deps = detective(code, babelConfig);
    expect(deps.length).toBe(2);
    expect(deps).toEqual(['mylib', 'mylib2']);
  });

  it('support dynamic imports', () => {
    const code = `import("foo").then(foo => foo());`;
    const deps = detective(code, babelConfig);
    expect(deps.length).toBe(1);
    expect(deps).toEqual(['foo']);
  });

  it('return empty array for non-modules', () => {
    const deps1 = detective('', babelConfig);
    expect(deps1.length).toBe(0);
    const deps2 = detective('const foo = function(){}', babelConfig);
    expect(deps2.length).toBe(0);
  });
});
