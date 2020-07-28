import detective from '../../detective/css';

function execCssTest(code: string, depLength: number, resultArr: string[]) {
  const deps = detective(code);
  expect(deps.length).toBe(depLength);
  expect(deps).toEqual(resultArr);
}

describe('css works', () => {
  it('support less', () => {
    execCssTest(`@import "this-is-valid.less"`, 1, ['this-is-valid.less']);
    execCssTest(`@import (reference) "foo.less"`, 1, ['foo.less']);
    execCssTest(`@import "foo"`, 1, ['foo']);
    execCssTest(`@import "foo.php"`, 1, ['foo.php']);
    execCssTest(`@import "foo.css"`, 1, ['foo.css']);
  });
  it('support sass', () => {
    execCssTest(
      `@import "_foo.scss", "bar","./common.less", .header{ color: "red"; };`,
      3,
      ['_foo.scss', 'bar', './common.less']
    );
    execCssTest(
      `@import "_foo.scss";\n@import "_bar.scss";\n@import "_baz";\n@import "_buttons";`,
      4,
      ['_foo.scss', '_bar.scss', '_baz', '_buttons']
    );
    execCssTest(`@import "_foo.scss"\n@import "_bar.scss"`, 2, [
      '_foo.scss',
      '_bar.scss',
    ]);
  });
  it('support stylus', () => {
    execCssTest(
      `
    .foo
        @import "bar.styl"
    @media screen and (min-width: 640px)
      @import "foo.styl"
    `,
      2,
      ['bar.styl', 'foo.styl']
    );
  });
});
