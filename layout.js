import NetWorkBackEnd from './network_backend';
import dynamicPos from '@/util/dynamicPosition.js';
import * as d3 from 'd3';

export default class GraphLayout {
  constructor (netGraph) {
    this.netGraph = netGraph;
    this.useLayout = 'square';
    this.netWorkBackEnd = new NetWorkBackEnd();
    this.nodeDistance = 150;
    this.nodeExtent = [];
    this._mapType = {
      square: this.square,
      multSquare: this.multSquare,
      star: this.star,
      circleShape: this.circleShape,
      oneRow: this.oneRow,
      oneColumn: this.oneColumn,
      timeSequential: this.timeSequential,
      hierarchy: this.hierarchy,
      auto: this.auto,
      random: this.computedDynamicPosToNodes,
      custom: this.customPosition
    };
  }

  layout (layoutName = null, params = null) {
    if (layoutName) {
      this.useLayout = layoutName;
    }
    return this._mapType[this.useLayout].bind(this);
  }

  getStartPosition () {
    // let maxX = 0;
    // const minY = 0;
    // for (const extent of this.nodeExtent) {
    //   const x = extent[0];
    //   const y = extent[1];
    //   maxX = maxX <= x ? x : maxX;
    //   maxY = maxY <= y ? y : maxY;
    // }
    // return [maxX, maxY];
  }

  recordExtent (width, height) {}

  customPosition (nodes, links, positions) {
    const nodeIds = [];
    const length = positions.length;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeId = node.id;
      nodeIds.push(nodeId);
      const index = i % length;
      const position = positions[index];
      node.x = position.x;
      node.y = position.y;
    }
    this.netGraph.updateGraph(nodeIds);
  }

  square (nodes) { // 矩形布局
    if (nodes.length > 0) {
      const nodeIds = [];
      const rowNum = Math.ceil(Math.sqrt(nodes.length));
      const node1 = nodes[0];
      const startX = node1.x || 0;
      const startY = node1.y || 0;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeId = node.id;
        nodeIds.push(nodeId);
        const col = i % rowNum;
        const row = parseInt(i / rowNum);
        node.x = startX + col * this.nodeDistance;
        node.y = startY + row * this.nodeDistance;
      }
      this.netGraph.updateGraph(nodeIds);
    }
  }

  star (selectedNodes) { // 星型布局
    if (selectedNodes.length > 0) {
      const nodeIds = [];
      const linkIds = [];
      const allNodes = this.netGraph.nodes();
      const mapNodeIdToLinkIds = this.netGraph.getMapNodeIdToLinkIds();
      const baseNode = selectedNodes[0];
      const baseX = baseNode.x ? baseNode.x : 0;
      const baseY = baseNode.y ? baseNode.y : 0;
      const insideR = (100 * selectedNodes.length) / (2 * Math.PI);
      let outsideR = 0;
      const insideRoate = (2 * Math.PI) / selectedNodes.length;
      let outsideRoate = 0;
      selectedNodes.forEach((node, index) => {
        const id = node.id;
        const rLinkIds = mapNodeIdToLinkIds[id] || [];

        for (let i = 0; i < rLinkIds.length; i++) {
          const linkId = rLinkIds[i];
          if (linkIds.indexOf(linkId) === -1) {
            linkIds.push(linkId);
          }
        }
        nodeIds.push(id);
        node.x = baseX + Math.sin(insideRoate * index) * insideR;
        node.y = baseY + Math.cos(insideRoate * index) * insideR;
      });
      if (linkIds.length > 0) {
        const links = this.netGraph.getLinks(linkIds);
        const outNodes = [];
        const outNodeIds = [];
        links.forEach(link => {
          const fromId = link.data.from;
          const toId = link.data.to;
          if (nodeIds.indexOf(fromId) === -1 && outNodeIds.indexOf(fromId) === -1) {
            outNodeIds.push(fromId);
            const node = this.netGraph.getNode(fromId);
            outNodes.push(node);
          }
          if (nodeIds.indexOf(toId) === -1 && outNodeIds.indexOf(toId) === -1) {
            outNodeIds.push(toId);
            const node = this.netGraph.getNode(toId);
            outNodes.push(node);
          }
          // nodes = nodes.concat(
          //   mthis.netchart.getLink(item).data.from,
          //   mthis.netchart.getLink(item).data.to
          // );
        });
        outsideR = (100 * outNodes.length) / (2 * Math.PI);
        outsideRoate = (2 * Math.PI) / outNodes.length;
        outNodes.forEach((node, index) => {
          node.x = baseX + Math.sin(outsideRoate * index) * outsideR;
          node.y = baseY + Math.cos(outsideRoate * index) * outsideR;
        });
      }
      this.netGraph.updateGraph(nodeIds);
    }
  }

  circleShape (nodes) { // 环形布局
    if (nodes.length > 0) {
      const nodeIds = [];
      // 半径
      const radius = (nodes.length * this.nodeDistance) / (2 * Math.PI);
      // 每一个BOX对应的角度;
      const avd = 360 / nodes.length;
      // 每一个BOX对应的弧度;
      const ahd = (avd * Math.PI) / 180;
      const no1 = nodes[0];
      for (let i = 0; i < nodes.length; i++) {
        // 解锁位置
        const no = nodes[i];
        const nodeId = no.id;
        nodeIds.push(nodeId);
        no.x = no1.x + Math.sin(ahd * i) * radius;
        no.y = no1.y - radius + Math.cos(ahd * i) * radius;
      }
      this.netGraph.updateGraph(nodeIds);
    }
  }

  multSquare (nodes) { // 多矩形
    var mthis = this;
    let no1x = 0;
    let no1y = 0;
    if (nodes.length > 0) {
      no1x = nodes[0].x;
      no1y = nodes[0].y;
      // mthis.netchart.selection()
      const multSquareObj = {};
      nodes.map(item => {
        const type = item.data.metaType;
        if (multSquareObj[type] && multSquareObj[type].length > 0) {
          multSquareObj[type].push(item);
        } else {
          multSquareObj[type] = new Array(item);
        }
      });
      setTimeout(() => {
        for (const typeList in multSquareObj) {
          if (multSquareObj[typeList].length > 0) {
            const rowNum = Math.ceil(Math.sqrt(multSquareObj[typeList].length));
            for (let i = 0; i < multSquareObj[typeList].length; i++) {
              const no = multSquareObj[typeList][i];
              const col = i % rowNum;
              const row = parseInt(i / rowNum);
              no.x = no1x + col * this.nodeDistance;
              no.y = no1y + row * this.nodeDistance;
            }
            const heightNum = parseInt(multSquareObj[typeList].length / rowNum);
            no1y = no1y + heightNum * this.nodeDistance + 300;
          }
        }
        this.netGraph.setAutoZoomMode('overview');
        // this.netchart.updateSize();
      }, 100);
    }
  }

  oneRow (nodes) {
    if (nodes.length > 0) {
      const nodeIds = [];
      const no1 = nodes[0];
      for (let i = 0; i < nodes.length; i++) {
        const no = nodes[i];
        const nodeId = no.id;
        nodeIds.push(nodeId);
        no.x = no1.x + i * this.nodeDistance;
        no.y = no1.y;
      }
      this.netGraph.updateGraph(nodeIds);
    }
  }

  oneColumn (nodes) {
    if (nodes.length > 0) {
      const nodeIds = [];
      const no1 = nodes[0];
      nodes.forEach((node, index) => {
        const nodeId = node.id;
        nodeIds.push(nodeId);
        node.x = no1.x;
        node.y = no1.y + index * this.nodeDistance;
      });
      this.netGraph.updateGraph(nodeIds);
    }
  }

  timeSequential (nodes) { // 时序布局
    const mthis = this;
    const docnodeids = [];
    const eventnodeids = [];
    const entitynodeids = [];
    const nodeIds = [];
    nodes.forEach(node => {
      const data = node.data ? node.data : node;
      const id = data.id;
      nodeIds.push(id);
      if (data.metaType === 'event') {
        eventnodeids.push(id);
      } else if (data.metaType === 'document') {
        docnodeids.push(id);
      } else if (data.metaType === 'entity') {
        entitynodeids.push(id);
      }
    });
    const datetype = 'day'; // 时序分度值
    const mixed = true; // 时序是否混合显示
    const params = {
      event_ids: eventnodeids,
      doc_ids: docnodeids,
      group_by: datetype,
      mix: mixed
    };
    mthis.netWorkBackEnd.timeLineLayout(params, result => {
      const baseX = 400 * (Math.random() - 0.5) + 200;
      let baseY = baseX;
      let pos = [0, 0];
      // 排布其他节点
      if (entitynodeids.length > 0) {
        pos = dynamicPos.getSquarePosition(baseX, baseY, entitynodeids);

        entitynodeids.forEach((item, index) => {
          mthis.netGraph.getNode(item).x = pos[index][0];
          mthis.netGraph.getNode(item).y = pos[index][1];
        });
      }
      baseY = baseY - 200;
      if (mixed) {
        // 混合排布
        Object.keys(result).forEach((item, index) => {
          const Xr = baseX + index * 150;
          result[item].mix_ids.forEach((it, ind) => {
            mthis.netGraph.getNode(it).x = Xr;
            mthis.netGraph.getNode(it).y = baseY - ind * 100;
          });
        });
      } else {
        // 非混合排布
      }
      mthis.netGraph.updateGraph(nodeIds);
      mthis.netGraph.setAutoZoomMode('overview');
      mthis.netGraph.updateSettings();
      mthis.netGraph.updateSize();
    });
  }

  hierarchy (rootNodes) { // 层级布局
    var mthis = this;
    if (rootNodes.length > 0) {
      // 有选中节点，可以进行层级
      const allNodes = this.netGraph.nodes();
      const allLinks = this.netGraph.links();
      const allNodeIds = allNodes.map(node => node.id);
      const rootIds = rootNodes.map(node => node.id);
      const edgeList = allLinks.map(link => {
        const linkData = {
          id: link.data.from,
          from: link.data.from,
          to: link.data.to
        };
        return linkData;
      });
      const params = {
        nodeIds: allNodeIds,
        RootNodeIdList: rootIds,
        EdgeList: edgeList,
        edge_from_backend: false
      };
      mthis.netWorkBackEnd.hierarchicalLayout(params, data => {
        const treeRoot = data[0][0];
        const node0Id = rootIds[0];
        const node0 = mthis.netGraph.getNode(node0Id);
        const initx = node0.x;
        const inity = node0.y;
        const hierarchyIds = [];
        var root = d3.hierarchy(treeRoot);
        root.dx = 100;
        root.dy = 300;
        d3.tree().nodeSize([root.dx, root.dy])(root);
        var nn1 = [];
        var ct = root;
        var tt = {
          id: ct.data.name,
          x: root.x,
          y: root.y
        };
        nn1.push(tt);
        if (root.children) {
          var stack = root.children;
          while (stack.length !== 0) {
            var ctt = stack.pop();
            var ttt = {
              id: ctt.data.name
            };
            ttt.x = ctt.x;
            ttt.y = ctt.y;
            nn1.push(ttt);
            if (ctt.children !== undefined) {
              const childrens = ctt.children;
              for (let i = childrens.length - 1; i >= 0; i--) { stack.push(childrens[i]); }
            }
          }
        }
        nn1.map(item => {
          if (mthis.netGraph.getNode(item.id)) {
            if (!this.netGraph.isNailNode(item.id)) {
              mthis.netGraph.getNode(item.id).x = item.x + initx;
              mthis.netGraph.getNode(item.id).y = item.y + inity;
              hierarchyIds.push(item.id);
            }
            // mthis.netGraph.getNode(item.id).hierarchyLock = true;
          }
        });
        mthis.netGraph.setSelectEle(hierarchyIds, []);
        mthis.netGraph.updateGraph(allNodeIds);
      }, err => {});
    } else {
      //   mthis.$myToast.warning("请选择节点进行层级排列操作！");
    }
  }

  auto (nodes) {
    const mthis = this;
    const nodeIdToIndex = {};
    nodes.forEach((item, index) => {
      nodeIdToIndex[item.id] = index;
    });
    const links = mthis.netGraph.links();
    const linkST = [];
    links.forEach(link => {
      const fromId = link.data.from;
      const toId = link.data.to;
      if (nodeIdToIndex[fromId] && nodeIdToIndex[toId]) {
        linkST.push({
          source: nodeIdToIndex[fromId],
          target: nodeIdToIndex[toId]
        });
      }
    });
    mthis.force = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-300)) // 团簇内拉伸力
      .force('link', d3.forceLink(linkST).distance(500))
      .force('center', d3.forceCenter()); // 用指定的x坐标和y坐标创建一个居中力
    mthis.jutuan(nodes);
  }

  jutuan (nodes) {
    var mthis = this;
    const nodeIds = nodes.map(node => node.id);
    mthis.netGraph.updateSettings({
      layout: {
        mode: 'dynamic',
        gravity: {
          from: 'node',
          to: 'graph',
          strength: 0.05,
          fromCenter: 'geometric',
          toCenter: 'geometric'
        },
        nodeSpacing: 150,
        layoutFreezeMinTimeout: 5000,
        layoutFreezeTimeout: 5000,
        crementalLayoutMaxTime: 5000,
        initialLayoutMaxTime: 5000,
        globalLayoutOnChanges: false
      }
    });
    // nodeIds.forEach(id => {
    //     mthis.netchart.unlockNode(id);
    //     mthis.netchart.updateSettings();
    //     mthis.netchart.updateSize();
    // });
    // setTimeout(function () {
    //   mthis.netGraph.updateGraph(nodeIds);
    setTimeout(function () {
      mthis.netGraph.updateSettings({
        layout: {
          mode: 'static'
        }
      });
    }, 5000);
    // }, 200);
  }

  hierarchyCircle () { // 层级环布局

  }

  computedSquarePosToNodes (nodes) {
    let sqnum = 0;
    const rowNum = Math.ceil(Math.sqrt(nodes.length));
    return nodes.map((item, index) => {
      const col = sqnum % rowNum;
      const row = parseInt(sqnum / rowNum);
      item.x = col * this.nodeDistance;
      item.y = row * this.nodeDistance;
      sqnum++;
      return item;
    });
  }

  computedDynamicPosToNodes (nodes) {
    const posArr = dynamicPos.getDynamicPosition(0, 0, nodes, 0);
    return nodes.map((item, index) => {
      const base = posArr[index];
      item.x = base[0];
      item.y = base[1];
      return item;
    });
  }
}
