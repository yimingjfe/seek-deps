import * as fs from 'fs';
import * as path from 'path';
import server from './server';
import { exec } from 'child_process';

interface Edge {
  source?: string;
  target?: string;
}

interface Node {
  id: string;
  label: string;
  title?: string;
}

const cachedNodeIds: number[] = [];
const cachedEdges: string[] = [];

const nodes: Node[] = [];
const edges: Edge[] = [];

const htmlTemp = `
<!doctype html>
<html>
<head>
  <title>Network</title>
  <script src="https://gw.alipayobjects.com/os/antv/pkg/_antv.g6-3.3.1/dist/g6.min.js"></script>
  <style type="text/css">
    .container {
      width: 1200px;
      height: 800px;
      border: 1px solid lightgray;
    }
  </style>
</head>
<body>
<script src="./render.js"></script>
</body>
</html>
`;

function template(data: any) {
  let str = `;(function(){`;
  str += `const nodes = ${JSON.stringify(nodes)};`;
  str += `const edges = ${JSON.stringify(edges)};`;
  str += `
    var container = document.createElement('div');
    container.classList.add('container');
    document.body.appendChild(container)
    var data = {
      nodes: nodes,
      edges: edges
    };
    var width = 1000;
    var height = 1000;
    var options = {
      container: container,
      width,
      height,
      layout: {
        type: 'force',
        preventOverlap: true,
      },
      defaultNode: {
        color: '#5B8FF9',
        style: {
          lineWidth: 2,
          fill: '#C6E5FF',
        },
      },
      defaultEdge: {
        size: 1,
        color: '#e2e2e2',
      },
    }
    const graph = new G6.Graph(options)
    graph.data(data);
    graph.render()    
  `;
  str += `})()`;
  return str;
}

function addNode(dep: Dep, context: string): boolean {
  if (cachedNodeIds.includes(dep.id)) return false;
  // 如果是url，或者不是/这样的路径，就不执行
  let relativeToContext = dep.absolutePath;
  if (path.isAbsolute(relativeToContext)) {
    relativeToContext = path.relative(context, dep.absolutePath);
  }
  const label = relativeToContext;

  cachedNodeIds.push(dep.id);
  nodes.push({
    id: String(dep.id),
    label: label,
    title: String(dep.absolutePath),
  });
  return true;
}

function addEdge(sourceDep: Dep, targetDep: Dep): boolean {
  const source = String(sourceDep.id);
  const target = String(targetDep.id);
  const edgeId = `${source}-${target}`;
  if (!cachedEdges.includes(edgeId)) {
    cachedEdges.push(edgeId);
    const edge: Edge = {
      source,
      target,
    };
    edges.push(edge);
    return true;
  }
  return false;
}

function traverse(dep: Dep, context: string) {
  addNode(dep, context);
  for (const childDep of Object.values(dep.deps)) {
    addNode(childDep, context);
    if (addEdge(dep, childDep)) {
      traverse(childDep, context);
    }
  }
}

export default function render(deps: Dep[], context: string) {
  let content = '';
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    traverse(dep, context);
  }
  const data = {
    nodes,
    edges,
  };
  content += template(data);
  try {
    fs.writeFileSync(path.resolve(__dirname, './render.js'), content);
    fs.writeFileSync(path.resolve(__dirname, './index.html'), htmlTemp);
    server();
  } catch (error) {
    console.error(error);
  }
}
