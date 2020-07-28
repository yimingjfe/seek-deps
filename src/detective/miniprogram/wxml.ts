import parser, { Node, NodeTag } from 'posthtml-parser';
import { get } from 'lodash';

const importSrc = 'src';
// 不支持image标签，因为很可能是动态地址
const collectedTags = ['include', 'import', 'wxs'];

export default function detectiveWxml(code: string): string[] {
  const depPaths: string[] = [];
  const parsed: Node[] = parser(code);

  function walk(nodes: Node[]) {
    const nodeTags: NodeTag[] = nodes.filter(
      (node) => typeof node !== 'string'
    ) as NodeTag[];
    nodeTags.forEach((nodeTag: NodeTag) => {
      if (collectedTags.includes(nodeTag.tag)) {
        const depPath = get(nodeTag, `attrs.${importSrc}`);
        if (depPath) {
          depPaths.push(depPath);
        }
      }
      if (nodeTag.content) {
        const children: Node[] = nodeTag.content;
        walk(children);
      }
    });
  }
  walk(parsed);

  return depPaths;
}
