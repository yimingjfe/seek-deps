import { simple } from 'babel-walk';
import { parse, ParserOptions } from '@babel/parser';
import * as t from '@babel/types';

interface State {
  collectDepPaths: string[];
}

type ESModuleDeclaration = t.ImportDeclaration | t.ExportNamedDeclaration;

const visitors = simple<State>({
  ImportDeclaration(node, state) {
    collectJSDep(node, state);
  },
  ExportNamedDeclaration(node, state) {
    collectJSDep(node, state);
  },
  CallExpression(node, state) {
    const args = node.arguments;
    const callee = node.callee;
    if (
      t.isImport(callee) ||
      (t.isIdentifier(callee) && callee.name === 'require')
    ) {
      const firstArg = args[0];

      if (t.isStringLiteral(firstArg)) {
        state.collectDepPaths.push(firstArg.value);
      }
    }
  },
});

function collectJSDep(node: ESModuleDeclaration, state: State) {
  const source = node.source;
  if (source && t.isStringLiteral(source)) {
    const value = source.value;
    state.collectDepPaths.push(value);
  }
}

function traverse(ast: t.File) {
  const state: State = {
    collectDepPaths: [],
  };
  visitors(ast, state);
  return state.collectDepPaths;
}

function parseJs(code: string, babelConfig?: ParserOptions) {
  return parse(code, babelConfig);
}

function detectiveJs(code: string, babelConfig?: ParserOptions): string[] {
  const ast = parseJs(code, babelConfig);
  const collectDepPaths = traverse(ast);
  return collectDepPaths;
}

export default detectiveJs;
