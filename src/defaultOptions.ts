import { DetectiveOptions } from './getConfig';
import {
  detectiveJS,
  detectiveCss,
  detectiveVue,
  detectiveWxml,
  detectiveJSON,
} from './detective';
import render from './renderByVis';

const defaultOptions: DetectiveOptions = {
  entry: '',
  babelConfig: {
    strictMode: false,
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: ['typescript', 'classProperties', 'dynamicImport'],
  },
  context: '',
  modules: ['node_modules'],
  rules: {
    js: detectiveJS,
    ts: detectiveJS,
    css: detectiveCss,
    less: detectiveCss,
    sass: detectiveCss,
    scss: detectiveCss,
    vue: detectiveVue,
    wxss: detectiveCss,
    wxml: detectiveWxml,
    json: detectiveJSON,
    wxs: detectiveJS,
  },
  render: render,
};

export default defaultOptions;
