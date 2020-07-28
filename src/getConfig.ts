import defaultOptions from './defaultOptions';
import { ParserOptions } from '@babel/parser';
import { Dep } from './Dep';

type DetectiveRule = (
  code: string,
  babelConfig?: ParserOptions
) => string[] | Promise<string[]>;

export interface Rules {
  /**
   * ext为文件的extname，如scss,vue
   */
  [ext: string]: DetectiveRule;
}

export interface DetectiveOptions {
  /**
   * 查询依赖的入口文件
   */
  entry: string | string[];
  /**
   * 项目的根目录，用来输出相对路径
   */
  context: string;
  /**
   * node_modules路径，如果配置webpackConfig，会以webpackConfig为准
   * @default ['node_modules']
   */
  modules: string[];
  /**
   * 不解析的文件，可以使用glob语法定义，如**\/node_modules\/**
   */
  exclude?: string | string[];
  /**
   * 解析依赖的规则可自定义
   */
  rules: Rules;
  /**
   * 传给babel-parser的配置
   */
  babelConfig?: ParserOptions;
  /**
   * 是否是小程序项目
   */
  miniProgram?: boolean;
  /**
   * 得到依赖分析结果后，会交给这个函数处理，可自定义
   */
  render?: (dpes: Dep[], context: string) => void;
  /**
   * webpack配置的地址
   */
  webpackConfig?: string;
}

export function getConfig(
  options: Partial<DetectiveOptions>
): DetectiveOptions {
  if (!options.entry) {
    throw new Error('entry must be assign');
  }
  const entry: string | string[] | null = Array.isArray(options.entry)
    ? options.entry
    : [options.entry];
  return {
    ...defaultOptions,
    ...options,
    entry,
  };
}
