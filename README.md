# 一个依赖可视化工具

## 特点

- 支持微信小程序的依赖可视化(支持wxml,wxss,wxs,json,js,ts,less,sass,vue等拓展名的文件)
- 支持webpack resolve
- 支持正向或逆向地查看依赖
- 支持定制依赖结果展示的渲染层
- 支持定制查询依赖的规则
- typescript编写，对使用者友好
- 命令行工具，支持快速使用

## 快速开始

命令行模式下，不会解析node_modules下面的依赖

```
npm install seek-deps -g
cd my-project
sdep
```

## 使用api

```
// example.ts
// 小程序的entry需要是app.json
import { seek } from 'seek-deps'
seek({
  entry:
    'my-project-path/app.json',
  context: 'my-project-path',
  exclude: ['**/node_modules/**'],
  miniProgram: true,
}) 

// 使用webpackConfig
// 如果使用的脚手架没有暴露出webpack配置，可以使用webpack-config-dump-plugin插件导出配置
seek({
  entry:
    'my-project-path/src/index.js',
  context: 'my-project-path',
  exclude: ['**/node_modules/**'],
  miniProgram: false,
  webpackConfig: 'my-project-path/config/webpack.config.js'
}) 

// 定制render
seek({
  entry:
    'my-project-path/app.json',
  context: 'my-project-path',
  exclude: ['**/node_modules/**'],
  miniProgram: true,
  render: (deps) => {
    console.log(deps)
  }
}) 
```
备注：

- 具体参数含义可以查看d.ts中的描述
- 小程序的entry是xxx.json，如app.json
- entry和context是必填参数，entry指入口文件，context指项目目录

## 界面操作

![image](https://s1.ax1x.com/2020/07/21/UTmfJK.png)

## 查找不到模块的情况

以下情况seek-deps会找不到相应的模块，不会继续向下寻找依赖，但会把这个文件加入到依赖中，并且在控制台用红色打印出相应模块信息。

- 路径错误
- 动态加载
- 项目构建规则seek-deps不知道（如使用rollup，webpack config没有传递给seek-deps）
