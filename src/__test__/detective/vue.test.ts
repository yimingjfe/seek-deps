import detective from '../../detective/vue';
import defaultOptions from '../../defaultOptions';

const babelConfig = defaultOptions.babelConfig;

describe('vue works', () => {
  it('basic support', () => {
    const code = `
      <template>
        <header></header>
      </template>
      
      <script>
        import foo from "./foo.js"
        import bar from "bar"
        export default {
        
        }
      </script>
      
      <style lang="less">
      @import './common';
      </style>
    `;
    const deps = detective(code, babelConfig);
    expect(deps).toEqual(['./common', './foo.js', 'bar']);
  });
});
