<template>
  <div>
    <div class="search-container">
      <el-autocomplete
        size="mini"
        :style="{width: '400px'}"
        placeholder="请输入label"
        clearable
        :fetch-suggestions="querySearch"
        @select="handleSeachLabelSelect"
        v-model="searchedLabel"
      ></el-autocomplete>
      <el-input size="mini" :style="{width: '200px'}" placeholder="请输入深度" v-model="searchedDeep"></el-input>
      <el-select size="mini" v-model="direction" placeholder="请选择">
        <el-option
          v-for="option in directionOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        ></el-option>
      </el-select>
      <el-button size="mini" @click="searchHandler">搜索</el-button>
      <span v-loading="loading" class="loading-container"></span>
    </div>
    <p class="tip">共有{{nodeLength}}个节点,最大深度为{{maxLevel}}</p>
    <p class="tip">双击节点可以复制节点label;hover可以查看绝对路径;深度输入0，会查询最大深度</p>
  </div>
</template>

<script>

import { Message } from 'element-ui';
import { flatten, uniq, maxBy } from 'lodash';
import vis from 'vis-network/dist/vis-network.esm';


const originalNodes = JSON.parse(document.body.dataset.nodes);
const originalEdges = JSON.parse(document.body.dataset.edges);
const maxLevelNode = maxBy(originalNodes, 'level')
const maxLevel = maxLevelNode.level
let appVM;

function searchByLabel(label, nodes, deep, direction) {
  if (typeof deep !== 'number') throw new TypeError('deep must be number');
  emptyContainers();
  if(deep === 0){
    deep = maxLevel
  }
  const node = nodes.find((node) => node.label.includes(label));
  renderByNode(node, deep, direction);
}

function filterNodesByLabel(label, nodes){
  const newNodes = nodes.filter((node) => node.label.includes(label));
  return newNodes
}

/**
 *
 * @param {*} node
 * @param {*} deep 寻找的深度
 */
function getDepNodes(node, deep = 1, direction) {
  let ancestorLevel = node.level;
  let childNodes = getChildNodes(node, direction);
  let childNodeIds = childNodes.map(childNode => childNode.id)
  for( let childNode of childNodes){
    if (Math.abs(childNode.level - ancestorLevel) >= deep) return childNodes;
    const depNodes = getChildNodes(childNode, direction);
    depNodes.forEach((depNode) => {
      if(!childNodeIds.includes(depNode.id)){
        childNodes.push(depNode);
        childNodeIds.push(depNode.id)
      }
    });
  }
  return childNodes;
}

function getChildNodes(node, direction = 0) {
  let deps;
  if (!direction) {
    deps = node.deps;
  } else {
    deps = node.refers;
  }
  const depNodes = deps.map((depId) => getNodeById(originalNodes, depId));
  return depNodes;
}

function renderByNode(node, deep = 1, direction) {
  const childNodes = getDepNodes(node, deep, direction);
  const newNodes = uniq([node].concat(childNodes));
  const edges = originalEdges;
  renderVisContainer(newNodes, edges);
}

function renderVisContainer(nodes, edges) {
  const visNodes = new vis.DataSet(nodes);
  const visEdges = new vis.DataSet(edges);
  const container = document.createElement('div');
  container.classList.add('container');
  document.body.appendChild(container);
  const options = {
    layout: {
      improvedLayout: false,
    },
    edges: {
      arrows: 'from',
      scaling: {
        label: true,
      },
      shadow: true,
      smooth: true,
    } 
  };

  if(nodes.length > 100){
    // options.physics = {
    //   enabled: false,
    //   solver: "forceAtlas2Based",
    // }
    options.hideEdgesOnDrag = true
  }

  const network = new vis.Network(
    container,
    {
      nodes: visNodes,
      edges: visEdges,
    },
    options
  );
  network.selectNodes([nodes[0].id]);
  network.on('doubleClick', (e) => {
    const nodeId = e.nodes && e.nodes[0];
    const node = getNodeById(originalNodes, nodeId);
    if (node) copy(node.label);
  });

  network.on('startStabilizing', (e) => {
    appVM.loading = true
    console.log('开始渲染');
  });

  network.on('stabilizationIterationsDone', (e) => {
    appVM.loading = false
    console.log('渲染完成');
  });
}

function copy(content) {
  const input = document.createElement('input');
  input.value = content;
  document.body.appendChild(input);
  input.select();
  if(document.execCommand('copy')){
    Message.success({
      message: '复制成功'
    })
  }
  document.body.removeChild(input);
}

function emptyContainers() {
  const containers = document.querySelectorAll('.container');
  containers.forEach((container) => {
    removeNode(container);
  });
}

function removeNode(node) {
  return node.remove();
}

function getNodeById(nodes, id) {
  return nodes.find((node) => node.id === id);
}

export default {
  data(){
    return {
      maxLevel: maxLevel,
      searchedLabel: '',
      searchedDeep: 1,
      direction: 0,
      directionOptions: [{
        value: 0,
        label: '自上而下'
      }, {
        value: 1,
        label: '自下而上'
      }],
      nodeSuggestions: null,
      loading: false,
      nodeLength: originalNodes.length
    }
  },
  mounted(){
    const rootNode = originalNodes[0];
    renderByNode(rootNode, 1);
    this.loadSuggestions()
    appVM = this
  },
  methods: {
    searchHandler(){
      const searchedLabel = this.searchedLabel
      const nodes = originalNodes;
      const direction = this.direction
      let deep = this.searchedDeep
      if (/\d+/.test(deep)) deep = Number(deep);
      searchByLabel(searchedLabel, nodes, deep, direction);      
    },
    loadSuggestions(){
      this.nodeSuggestions = originalNodes.map(node => {

      })
    },
    querySearch(queryString, cb){
      const nodes = originalNodes
      const suggestedNodes = filterNodesByLabel(queryString, nodes)
      const suggestions = suggestedNodes.map(node => {
        return {
          ...node,
          value: node.label
        }
      })
      cb(suggestions)
    },
    handleSeachLabelSelect(node){
      this.searchedLabel = node.value
    }
  }
}

</script>

<style lang="less" scoped>
.tip{
  font-size: 14px;
}
.loading-container{
  margin-left: 5px;
}
</style>
