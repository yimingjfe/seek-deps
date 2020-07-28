import resolveCss from '../../resolve/resolveCss';
import * as fs from 'fs';

jest.mock('fs');

describe('resolve css path', () => {
  const MOCK_FILE_INFO = {
    example: {
      '_foo.scss': 'body { color: purple; }',
      'baz.scss': '@import "_foo";',
      'styles.scss': '@import "_foo";\n@import "baz.scss";',
      nested: {
        'index.scss': '@import "a/b/b3";',
        'styles.scss': '@import "a/b/b3";\n@import "a/b/b2";',
        a: {
          'a.scss': '@import "../styles";',
          b: {
            'b3.scss': '',
            'b.scss': '@import "../../styles";\n@import "../a";',
            'b2.scss': '@import "b";\n@import "b3";',
          },
        },
      },
    },
  };

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fs.__setMockFiles(MOCK_FILE_INFO);
  });

  it('handles partials with an extension', () => {
    expect(
      resolveCss({
        dependency: 'baz.scss',
        filename: 'example/styles.scss',
        directory: 'example',
      })
    ).toBe(process.cwd() + '/example/baz.scss');
  });

  describe('deeply nested paths', () => {
    it('handles non-underscored partials', () => {
      expect(
        resolveCss({
          dependency: 'a/b/b2',
          filename: 'example/nested/styles.scss',
          directory: 'example',
        })
      ).toBe(process.cwd() + '/example/nested/a/b/b2.scss');
    });

    it('handles partials with underscored files', () => {
      expect(
        resolveCss({
          dependency: '_foo',
          filename: 'example/baz.scss',
          directory: 'example',
        })
      ).toBe(process.cwd() + '/example/_foo.scss');
    });
  });

  describe('relative partials', () => {
    it('handles one level up', () => {
      expect(
        resolveCss({
          dependency: '../a',
          filename: 'example/nested/a/b/b.scss',
          directory: 'example',
        })
      ).toBe(process.cwd() + '/example/nested/a/a.scss');
    });

    it('handles more than one level up', () => {
      expect(
        resolveCss({
          dependency: '../../styles',
          filename: 'example/nested/a/b/b.scss',
          directory: 'example',
        })
      ).toBe(process.cwd() + '/example/nested/styles.scss');
    });
  });

  describe('partials within the same subdirectory', () => {
    it('handles non-underscored partials', function () {
      expect(
        resolveCss({
          dependency: 'b',
          filename: 'example/nested/a/b/b2.scss',
          directory: 'example',
        })
      ).toBe(process.cwd() + '/example/nested/a/b/b.scss');
    });
  });

  describe('multiple directories', () => {
    it('handles partials in middle directory', function () {
      const directories = ['example', 'example/nested/a/b', 'example/a'];
      expect(
        resolveCss({
          dependency: 'b',
          filename: 'b2.scss',
          directory: directories,
        })
      ).toBe(process.cwd() + '/example/nested/a/b/b.scss');
    });

    it('partial in last directory of list', function () {
      const directories = ['example', 'example/nested/a/b'];
      expect(
        resolveCss({
          dependency: 'b',
          filename: 'b2.scss',
          directory: directories,
        })
      ).toBe(process.cwd() + '/example/nested/a/b/b.scss');
    });

    it('non-partial in last directory when given list', function () {
      const directories = ['example', 'example/nested/a/b'];
      expect(
        resolveCss({
          dependency: 'b2',
          filename: 'b3.scss',
          directory: directories,
        })
      ).toBe(process.cwd() + '/example/nested/a/b/b2.scss');
    });

    it('handles underscored partials', function () {
      const directories = ['example', 'example/nested/a/b'];
      expect(
        resolveCss({
          dependency: 'b2',
          filename: 'b3.scss',
          directory: directories,
        })
      ).toBe(process.cwd() + '/example/nested/a/b/b2.scss');
    });
  });
});
