import * as path from 'path';

interface Edge {
  from?: number;
  to?: number;
}

interface Node {
  id: number;
  label: string;
  title?: string;
  deps: number[];
  refers: number[];
  level: number;
}

interface CacheNodes {
  [id: number]: Node;
}

export default function generateNodes(deps: Dep[], context: string) {
  const cachedNodeIds: number[] = [];
  const cachedNodes: CacheNodes = {};
  const cachedEdges: string[] = [];
  const originalLevel = 1;

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    traverse(dep, context);
  }
  const data = {
    nodes,
    edges,
  };

  return data;

  function traverse(dep: Dep, context: string) {
    const node = addNode(dep, context);
    for (const childDep of Object.values(dep.deps)) {
      addNode(childDep, context, node.level + 1);
      if (addEdge(dep, childDep)) {
        traverse(childDep, context);
      }
    }
  }

  function addEdge(sourceDep: Dep, targetDep: Dep): boolean {
    const from = sourceDep.id;
    const to = targetDep.id;
    const edgeId = `${from}-${to}`;
    if (!cachedEdges.includes(edgeId)) {
      cachedEdges.push(edgeId);
      const edge: Edge = {
        from,
        to,
      };
      edges.push(edge);
      return true;
    }
    return false;
  }

  function addNode(dep: Dep, context: string, level = 1): Node {
    if (cachedNodeIds.includes(dep.id)) return cachedNodes[dep.id];
    // 如果是url，或者不是/这样的路径，就不执行
    let relativeToContext = dep.absolutePath;
    if (path.isAbsolute(relativeToContext)) {
      relativeToContext = path.relative(context, dep.absolutePath);
    }
    const label = relativeToContext;
    const node = {
      id: dep.id,
      label: label,
      level,
      title: String(dep.absolutePath),
      deps: Object.values(dep.deps).map((depItem) => depItem.id),
      refers: Object.values(dep.refers).map((depItem) => depItem.id),
    };

    cachedNodeIds.push(dep.id);
    cachedNodes[dep.id] = node;
    nodes.push(node);
    return node;
  }
}
