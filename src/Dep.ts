export interface Dep {
  /**
   * 依赖文件的id
   */
  id: number;
  /**
   * 依赖文件的绝对路径
   */
  absolutePath: string;
  size?: number;
  /**
   * 依赖文件的下级节点（自身的依赖）
   */
  deps: Deps;
  /**
   * 依赖文件的上级节点（依赖文件被哪些文件依赖）
   */
  refers: Deps;
}

export interface Deps {
  [absolutePath: string]: Dep;
}
