import * as fs from 'fs-extra';
import * as path from 'path';
import generateData from './render';
import serve from './parcel-serve';
import { Dep } from '../Dep';

function template(data: any, deps: Dep[]) {
  const { nodes, edges } = data;
  const str = `
  <!doctype html>
  <html>
  <head>
    <title>Seek-Deps</title>   
  </head>
  <body data-nodes='${JSON.stringify(nodes)}' data-edges='${JSON.stringify(
    edges
  )}'>
    <div id="app"></div>
  <script src="${path.relative(
    __dirname,
    path.join(process.env.rootDir as string, 'src/renderByVis/fontend/index.js')
  )}"></script>
  </body>
  </html>
  `;
  return str;
}

export default function render(deps: Dep[], context: string) {
  const data = generateData(deps, context);
  const htmlTemp = template(data, deps);
  try {
    fs.writeFileSync(path.resolve(__dirname, './index.html'), htmlTemp);
    serve();
  } catch (error) {
    console.error(error);
  }
}
