import axios from 'axios';
import NetGraph, { HIGHLIGHT, SELECTED, UNSELECTED } from '../../src/index';
import { BubbleSet } from '../../src/helper/bubbleset';

const debug = false;
// let isUpLoadFile = false;

// function readData () {
//     if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
//         return -1;
//     } else {
//         if (!isUpLoadFile) {
//             throw new Error("two files are needed");
//         }
//         let input = document.getElementById("uploadFile");
//         let dataFile = input.files[0];
//         let dataFileReader = new FileReader();

//         dataFileReader.onload = function (e) {
//             let dataContent = e.target.result;
//             let data = JSON.parse(dataContent);
//             //const renderData={nodes:data.data.nodes,links:data.data.links};
//             data.nodes.forEach((node, i) => {
//                 node.img = '/src/img1/b' + i % 10 + '.png';
//             });
//             // console.log(renderData.nodes.length);
//             // console.log(renderData.links.length);
//             draw(data);
//         };
//         dataFileReader.readAsText(dataFile);
//     }
// }

// document.getElementById("uploadFile").addEventListener("change", (e) => {
//     if (e.target.files[0].name.lastIndexOf('.json') !== -1) {
//         isUpLoadFile = true;
//         readData();
//     }
// });
function convertGroupToTreeFormat(rawData) {
  const { nodes, links, groups } = rawData.data;

  // 1. 初始化：将原始 nodes 做映射（id 为字符串）
  const idToNode = new Map(nodes.map(n => [String(n.id), { ...n, id: String(n.id), isLeaf: true }]));

  // 2. 找出最大数字 ID，用于新生成内部节点 ID（递增）
  const maxNumericId = Math.max(...Array.from(idToNode.keys()).map(id => parseInt(id)).filter(n => !isNaN(n)));
  let internalIdCounter = maxNumericId + 1;

  const groupIdMap = new Map();     // old group id → new id（如 -1 → 1001）
  const childToParent = new Map();  // child id → parent id

  // === Step 1: 分配正数 ID 给 group.id 以及负数 children（内部节点）
  for (const group of groups) {
    const oldGroupId = String(group.id);
    if (!groupIdMap.has(oldGroupId)) {
      groupIdMap.set(oldGroupId, String(internalIdCounter++));
    }

    for (const child of group.childrens) {
      const oldChildId = String(child);
      if (oldChildId.startsWith("-") && !groupIdMap.has(oldChildId)) {
        groupIdMap.set(oldChildId, String(internalIdCounter++));
      }
    }
  }

  // === Step 2: 构建节点（内部节点直接添加，子节点替换为正整数）
  for (const group of groups) {
    const parentId = groupIdMap.get(String(group.id));

    // 添加内部节点本身
    if (!idToNode.has(parentId)) {
      idToNode.set(parentId, {
        id: parentId,
        isLeaf: false
      });
    }

    for (const rawChildId of group.childrens) {
      const oldChildId = String(rawChildId);
      const newChildId = groupIdMap.get(oldChildId) || oldChildId;

      // 添加子节点（若原来不存在则视作内部节点）
      if (!idToNode.has(newChildId)) {
        idToNode.set(newChildId, {
          id: newChildId,
          isLeaf: !oldChildId.startsWith("-")
        });
      }

      // 设置 parent
      idToNode.get(newChildId).parent = parentId;
    }
  }

  // === Step 3: 补充所有节点 parent 字段（未设置的为 ""）
  for (const node of idToNode.values()) {
    if (!node.hasOwnProperty("parent")) {
      node.parent = "";
    }
  }

  // === Step 4: 转换 links，确保 ID 也是字符串
  const newLinks = links.map(l => ({
    source: String(l.source),
    target: String(l.target),
    value: l.value
  }));

  return {
    nodes: Array.from(idToNode.values()),
    links: newLinks
  };
}
function generateHierarchicalGraph(nodeCount, linkCount) {
  const nodes = [];
  const links = [];

  // Step 1: 创建原始叶子节点
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: String(i),
      isLeaf: true
    });
  }

  const leafIds = nodes.map(n => n.id);

  // Step 2: 创建随机连边（仅在叶子节点之间）
  const usedPairs = new Set();
  while (links.length < linkCount) {
    const a = leafIds[Math.floor(Math.random() * leafIds.length)];
    const b = leafIds[Math.floor(Math.random() * leafIds.length)];
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (a !== b && !usedPairs.has(key)) {
      links.push({ source: a, target: b, value: 1 });
      usedPairs.add(key);
    }
  }

  let nextId = nodeCount; // 内部节点从 nodeCount 开始编号

  // Step 3: 创建 10 个高度为 2 的内部节点（叶子 → 内部2）
  const level2Nodes = [];
  for (let i = 0; i < 10; i++) {
    const groupId = String(nextId++);
    const groupSize = Math.floor(nodeCount / 10);
    const children = leafIds.splice(0, groupSize);
    children.forEach(cid => {
      const node = nodes.find(n => n.id === cid);
      node.parent = groupId;
    });
    nodes.push({
      id: groupId,
      isLeaf: false
    });
    level2Nodes.push(groupId);
  }

  // Step 4: 创建 5 个高度为 3 的内部节点（内部2 → 内部3）
  for (let i = 0; i < 5; i++) {
    const groupId = String(nextId++);
    const groupSize = Math.floor(level2Nodes.length / 5);
    const children = level2Nodes.splice(0, groupSize);
    children.forEach(cid => {
      const node = nodes.find(n => n.id === cid);
      node.parent = groupId;
    });
    nodes.push({
      id: groupId,
      isLeaf: false
    });
  }

  // Step 5: 给所有没有 parent 的节点添加 parent: ""
  nodes.forEach(n => {
    if (!n.hasOwnProperty("parent")) {
      n.parent = "";
    }
  });

  return {
    nodes,
    links
  };
}

axios.get('/src/hierarchy100k.json').then((res) => {

  
  
    const nodes = res.data.data.nodes;
    const roots = nodes.filter(d => d.parent === "")
    let links = res.data.data.links;

    nodes.forEach((node, i) => {
        // node.img = '/src/img1/a' + i % 10 + '.png';
        node.img = '';
        node.name = `${node.id}`

        if(node.parent != '') {//加入树上的边
          links.push({
            source:node.parent,
            target:node.id,
            type:"treeLink"
          })
        }
    });
    links.forEach((link, i) => {
        link.id = i;
        link.from = link.source;
        link.to = link.target;
    });
    roots.forEach((node, i) => {
      node.expand = false
  });
  

    console.log("nodes", nodes);
    console.log("links", links);
    // const nodes=[]
    const data = {
        nodes: nodes,
        links:links,
    };
    const rootOnly = {
      nodes: roots,
      links:[],
  };
    // let temp = new Array(200000).fill(1);
    // const nodes = temp.map((v, i) => {
    //     return {
    //         id: 'a' + i,
    //         name: 'h',
    //         img: '/src/img1/a0.png',
    //     };
    // });
    // const data = {
    //     nodes,
    //     links: [],
    // }
    draw(data,rootOnly);
});
function draw(rawData, initData) {
    let data = null;
    if (!debug) {
        data = rawData;
    } else {
        data = {
            nodes: [
                {
                    id: 'a001',
                    name: '你哈',
                    img: '/src/img1/a0.png',
                },
                {
                    id: 'a002',
                    name: '是',
                    img: '/src/img1/a1.png',
                },
                {
                    id: 'a003',
                    name: '速度',
                    img: '/src/img1/a2.png',
                },
                {
                    id: 'a004',
                    name: '负对数',
                    img: '/src/img1/a3.png',
                },
                {
                    id: 'a005',
                    name: '是',
                    img: '/src/img1/a4.png'
                },
                {
                    id: 'a006',
                    name: '是',
                    img: '/src/img1/a1.png',
                    type: 'human',
                    ca: false,
                },
                {
                    id: 'a007',
                    name: '速度',
                    img: '/src/img1/a2.png',
                    //class:['event','kkdkd']
                },
                {
                    id: 'a008',
                    name: '负对数',
                    img: '/src/img1/a3.png',
                },
                {
                    id: 'a009',
                    name: '是',
                    img: '/src/img1/a4.png'
                }, {
                    id: 'a0010',
                    name: '是',
                    img: '/src/img1/a4.png'
                }
            ],
            links: [
                {
                    id: 'link1',
                    type: '但是',
                    from: 'a001',
                    to: 'a002',
                }, {
                    id: 'link2',
                    type: '但是',
                    from: 'a001',
                    to: 'a003',
                }, {
                    id: 'link3',
                    type: '但是',
                    from: 'a001',
                    to: 'a004',
                }, {
                    id: 'link4',
                    type: '但是',
                    from: 'a001',
                    to: 'a005',
                },
                {
                    id: 'link5',
                    type: '但是',
                    from: 'a001',
                    to: 'a006',
                },
                {
                    id: 'link6',
                    type: '但是',
                    from: 'a001',
                    to: 'a007',
                }, {
                    id: 'link7',
                    type: '但是',
                    from: 'a001',
                    to: 'a008',
                }, {
                    id: 'link8',
                    type: '但是',
                    from: 'a001',
                    to: 'a009',
                }, {
                    id: 'link9',
                    type: '但是',
                    from: 'a001',
                    to: 'a0010',
                }
            ]

        };
    }

    const netGraph = new NetGraph({
        canvasProps: {
            containerWidth: 2500,
            containerHeight: 1200,
            zoom: 0,
            container: 'container',
            maxZoom: 16,
            minZoom: -16,
        },
        constant: {
            nodeHighlightColor: '#a9d9d9',
            nodeHighlightOpacity: 0.5,
            lineHighlightColor: '#ffd53f',
            lineHighlightOpacity: 0.5,
            // defaultUrl:'/src/img1/a2.png',
            defaultUrlMap: {
                "human": '/src/img1/a100.png',
                "entity": '/src/img1/a101.png',
                "animal": "/src/img1/a103.png",
                "default": "/src/img1/a102.png",
            },
            defaultUrlFunc: (d) => {
                if (d.data.subType) {
                    return d.data.subType;
                } else {
                    if (d.data.type) {
                        return d.data.type;
                    } else {
                        if (d.data.metaType) {
                            return d.data.metaType;
                        } else {
                            return 'default';
                        }
                    }
                }
            }
        },
        layout: 'square',
        data: initData,
        style: [
            {
                selector: 'node',
                style: {
                    'width': 30,
                    'height': (d) => {
                      if (d.data.isLeaf) {
                          return 30;
                      } else {
                          return 45;
                      }
                  },//radius
                    'background-width': (d) => {
                        if (d.data.metaType === 'nodeSet') {
                            return 98;
                        } else {
                            return 30;
                        }
                    },
                    'background-height': (d) => {
                        if (d.data.metaType === 'nodeSet') {
                            return 75;
                        } else {
                            return 30;
                        }
                    },
                    'url': (d) => d.data.img,
                    'opacity':(d) => {
                      if (!d.data.isLeaf) {
                          return 0.2;
                      } else {
                          return 1;
                      }
                  },
                    'background-color': (d) => {
                      if (!d.data.isLeaf) {
                          return '#46D1BE';
                      } else {
                          return '#ffd53f';
                      }
                    },
                    'background-opacity': 1,
                    'text-color': (d) => {
                        if (d.data.metaType === 'nodeSet') {
                            return '#324189';
                        } else {
                            return '#845624';
                        }
                    },
                    'text-opacity': 1,
                    'font-size': (d) => {
                        if (!d.data.isLeaf) {
                            return 20;
                        } else {
                            return 15;
                        }
                    },
                    'text': (d) => {
                      if (!d.data.isLeaf) {
                          return "Cluster: " + d.data.name;
                      } else {
                          return d.data.name;
                      }
                    },
                    'shape': (d) => {
                        if (d.data.metaType === 'nodeSet') {
                            return 'horizontal_rect';
                        } else {
                            // return 'rect';
                            return 'circle';
                        }
                    },
                    'highlight-color': "#Fff0BC",
                    'highlight-opacity': 0.8,
                    // "label-style": {
                    //     'url': '/src/img1/images.png',
                    //     'width': 15,
                    //     'height': 15,
                    //     'position': 'left-top',
                    // },
                    'border-width': 5,//图片周围圆圈的宽度
                    'border-color': '#f00',//颜色
                    'border-opacity': 0.5,//透明度
                }
            },

            {
                selector: 'link',
                style: {
                    'width': 2,
                    'line-color': '#456456',
                    'line-opacity': 0.05,
                    'text-opacity': 1,
                    'line-style': (d) => {
                        return 'solid';

                    },
                    'text-color': "#456456",
                    'font-size': 10,
                    'text': (d) => d.data.type,
                    'direct': (d) => true
                }
            }, {
                selector: 'link.color',
                style: {
                    'line-color': '#fff',
                    'text-color': '#aaa'
                }
            },
            {
                selector: 'node.class2',
                style: {
                    'background-color': '#ccc',
                }
            }
            ,
            {
                selector: "link.selected",
                style: {
                    'line-color': '#fff',
                }
            }
        ]
    });

    console.log(netGraph);
    netGraph.setRawData(rawData)

    let timeout = null;
    netGraph.addEventListener('canvasMouseDown', (e) => {
        timeout = setTimeout(() => {
            netGraph.showBrushArea();
        }, 2000);
    });
    netGraph.addEventListener('canvasMouseUp', (e) => {
        if (timeout) {
            clearTimeout(timeout);
        }
    });
    netGraph.addEventListener('canvasMouseMove', (e) => {
        if (timeout) {
            clearTimeout(timeout);
        }
    });

let bubbles = {
  datas:[],
  colors:["#aa0011","#07fa41","#666aaa"],
  ids:[]
}
function getRandomHexColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}
function getAllDescendants(rootId, nodes) {
  const descendants = [];
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    for (const node of nodes) {
      if (node.parent === currentId) {
        descendants.push(node);
        queue.push(node.id);
      }
    }
  }
  return descendants;
}

    netGraph.addEventListener('nodeClick', (object, e) => {
      const clickedNode = object.object.origionElement.data;
    
      if (clickedNode.isLeaf) {
        console.log(netGraph.getRawData().nodes);
        return;
      } else if (clickedNode.isExpanded) {
        console.log("unexpand");
      
        clickedNode.isExpanded = false;
        const currentNodeId = clickedNode.id;
      
        // 1. 获取以当前节点为根的子树所有节点（完整后代节点，不筛）
        const allNodes = netGraph.getRawData().nodes;
        const childNodes = getAllDescendants(currentNodeId, allNodes);
      
        // 2. 当前画布上实际存在的节点 id
        const visibleNodeIds = new Set(netGraph.getNodes().map(n => n.id));
      
        // 3. 实际需要删除的子节点 id（子树里那些已经在画布上的节点）
        const childNodeIds = childNodes
          .map(n => n.id)
          .filter(id => visibleNodeIds.has(id));
      
        // 4. 找出子树中需要删除 bubble 的节点（内部展开过 && 非叶子）
        const expandedNodeIds = childNodes
          .filter(n => n.isExpanded && !n.isLeaf)
          .map(n => n.id);
      
        // 5. 清除子树内所有非叶子节点的 isExpanded 标记
        childNodes.forEach(n => {
          if (!n.isLeaf) {
            n.isExpanded = false;
          }
        });
      
        // 6. 删除 bubble（当前点击的节点 + 内部展开的节点）
        netGraph.removeBubbleSet(expandedNodeIds.concat([currentNodeId]));
      
        // 7. 删除实际可见的子节点
        console.log(childNodeIds);
        netGraph.removeNodes(childNodeIds);
      }
      
       else {
        clickedNode.isExpanded = true
        const currentNodeId = clickedNode.id;
    
        // 1. 获取当前被点击节点的孩子节点
        const childNodes = netGraph.getRawData().nodes.filter(d => d.parent === currentNodeId);
        const childNodeIds = new Set(childNodes.map(n => n.id));
      
        // 2. 当前画布上的节点（不包括被点击节点）+ childNodes
        const visibleNodeIds = new Set(netGraph.getNodes().map(n => n.id));
        // visibleNodeIds.delete(currentNodeId);
        childNodes.forEach(n => visibleNodeIds.add(n.id)); // 添加即将出现的新节点
      
        // 3. 筛选：任意一端是 child，另一端是 visible 的边
        const addLinks = netGraph.getRawData().links.filter(d => {
          const isChildFrom = childNodeIds.has(d.from);
          const isChildTo = childNodeIds.has(d.to);
          const otherEnd = isChildFrom ? d.to : isChildTo ? d.from : null;
          return (isChildFrom || isChildTo) && visibleNodeIds.has(otherEnd);
        });
      
        // 4. 构造要添加的数据
        const expand = {
          nodes: childNodes,
          links: addLinks
        };
      
        // 5. 执行图更新：移除被点击节点，添加其孩子及边
        // netGraph.removeNodes([object.object.id]);
        netGraph.addData(expand);
        // netGraph.removeBubbleSet(bubbles.ids)
        // bubbles.datas.push(childNodeIds)
        // bubbles.ids.push(currentNodeId)
        // netGraph.addBubbleSet(bubbles.datas,bubbles.colors,bubbles.ids)
        let bubbleIds = Array.from(childNodeIds)
        // bubbleIds.push(currentNodeId)
        console.log(bubbleIds);
        
        netGraph.addBubbleSet([bubbleIds],[getRandomHexColor()], currentNodeId)
        netGraph.setNodeLayout('square');
        netGraph.setNodeLayout('auto');
      }
    
      
    });
    netGraph.addEventListener('nodeClickWithCtrl', (info, e) => {
        // let a = [];
        // for(let i=0; i< 10000; i++) {
        //     if(i%2 == 0)
        //     a.push(i.toString);
        // }
        // console.log(a);
        netGraph.addClassForNode(['0', '1', '2'], ['fff']);
        console.log(netGraph.getNode('0'))
        console.log('nodeClickWithCtrl');
    });

    netGraph.addEventListener('lineClick', (o, e) => {
        console.log('lineClick');
    });
    netGraph.addEventListener('canvasRightClick', (info, e) => {
        // console.log(netGraph.exportCanvasAsBase64())
        console.log('canvas right click');
    });
    netGraph.addEventListener('lineClickWithCtrl', (o, e) => {
        console.log('lineClickWithCtrl');
    });
    netGraph.addEventListener('emptyClick', (o, e) => {
        //console.log(console.log(netGraph.getNode('01cc378b0ebe3ad6b82c4a13e0767d47')));
        console.log("emptyClick");
        // console.log('emptyClick');
        // netGraph.getNodes(['a005'])[0].addClasses(['fff']);
        // netGraph.addStyle([{
        //     selector: 'node.fff',
        //     style: {
        //         'width': 60,
        //         'height': 40,
        //         'url': (d) => d.data.img,
        //         'opacity': 1,
        //         'background-color': '#aaa',
        //         'background-opacity': 1,
        //         'border-width': 5,
        //         'border-color': '#fff',
        //         'border-opacity': 1,
        //         'color': '#845624',
        //         'text-opacity': 1,
        //         'font-size': 16,
        //         'text': (d) => d.data.name,
        //         'shape': 'rect',
        //     }
        // },]);
    });

    netGraph.addEventListener('brush', (nodeIds) => {
        netGraph.updateNodeStatus(nodeIds, SELECTED);
    });



    netGraph.addEventListener('rightClick', () => {

        console.log("rightClick");
    });
    document.getElementById('remove').addEventListener('click', (e) => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.removeNodes(selectedNodeIds);
    });


    document.getElementById('addStyle').addEventListener('click', () => {
        // const nodes = netGraph.getNodes();
        // let id = 'aaa';

        // if (nodes.length > 5) {
        //     id = nodes[4].id;
        // }
        netGraph.addStyle([{
            selector: "node#01cc378b0ebe3ad6b82c4a13e0767d47,node#3ded00b898c73c11a72558530859568d",
            style: {
                'background-height': (d) => {
                    return 75;
                },
                'background-width': (d) => {
                    if (d) {
                        return 75;
                    }
                },
                'background-color': '#7FFFD4',
                'text-color': '#551A8B',
                'font-size': 15,
            }
        },
        {
            selector: 'link',
            style: {
                'width': 5,
                'line-color': '#009ACD',
                'text-color': "#009ACD",
                'font-size': 13,
            }
        }
        ]);
        //netGraph.controller.canvasController.updateRenderGraph()
        //netGraph.controller.canvasController.updateRenderObject({position:1});
    });


    document.getElementById('setLayout').addEventListener('click', () => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        console.log(selectedNodeIds);
        netGraph.setNodeLayout('circleShape', selectedNodeIds);
    });
    document.getElementById('starLayout').addEventListener('click', () => {
        // const selectedNodes = netGraph.getSelectedNodes();
        // const selectedNodeIds = new Array();
        // selectedNodes.map((v, i) => {
        //     selectedNodeIds.push(v.getId());
        // });
        // console.log(netGraph.getNodes(["3ded00b898c73c11a72558530859568d"]))
        let nodeIds = netGraph.getSelectedNodes().map(item => item.id);
        console.log(nodeIds);
        netGraph.setNodeLayout('star', nodeIds);
    });
    document.getElementById('brush').addEventListener('click', () => {
        netGraph.showBrushArea();
    });

    // new NetworkChart({
    //     ...
    //     events:{
    //       onClick: function(event){...},
    //       onSelectionChange: function(event){...}
    //     },
    //     ...
    //   });
    let isGroup = false;
    document.getElementById('groupDrag').addEventListener('click', () => {

        netGraph.setGroupDrag(!isGroup);
        isGroup = !isGroup;
    });


    document.getElementById('addClass').addEventListener('click', () => {
        // const nodes = netGraph.getNodes();
        // const links = netGraph.getLinks();
        // if (nodes.length > 0) {
        //     netGraph.addClassForNode([nodes[0].id], ['fff']);
        // }
        // if (links.length > 0) {
        //     netGraph.addClassForLink([links[0].id], ['color']);
        // }


        // netGraph.updateStyle();
    });


    document.getElementById('updateLinkStyle').addEventListener('click', () => {


        // netGraph.addStyle([{
        //     selector:"link.selected",
        //     style: {
        //         'line-color': '#fff',
        //     }
        // }],false);

        const links = netGraph.getLinks();

        if (links.length > 3) {
            netGraph.addClassForLink([links[2].id], ['selected']);
        }




    });

    document.getElementById("lockNode").addEventListener("click", () => {
        const nodes = netGraph.getNodes();
        if (nodes.length > 0) {
            netGraph.lockNodes([nodes[0].id]);
        }

    });
    document.getElementById("unlockNode").addEventListener("click", () => {
        const nodes = netGraph.getNodes();
        if (nodes.length > 0) {
            netGraph.unlockNodes([nodes[0].id]);
        }

    });
    document.getElementById("alterStatus").addEventListener("click", () => {
        const selectedNodes = netGraph.getNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.updateNodeStatus(selectedNodeIds, UNSELECTED);
    });
    document.getElementById("replaceData").addEventListener("click", () => {
        netGraph.replaceData({
            nodes: [],
        });
    });


    document.getElementById('add').addEventListener('click', () => {
        // netGraph.addData({nodes:[
        //    { id:'dssd',
        //     name:'fsd',
        //     img:'/src/img1/a5.png'}
        // ]})
        //let nodeIds=netGraph.getSelectedNodes().map(item=>item.id);
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        let linkList = [
            {
                "source": "275",
                "target": "74",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "422",
                "target": "325",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "180",
                "target": "20",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "187",
                "target": "377",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "364",
                "target": "390",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "383",
                "target": "82",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "317",
                "target": "264",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "41",
                "target": "44",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "113",
                "target": "138",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "51",
                "target": "17",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "422",
                "target": "244",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "167",
                "target": "288",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "138",
                "target": "148",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "106",
                "target": "213",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "431",
                "target": "249",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "313",
                "target": "100",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "312",
                "target": "145",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "434",
                "target": "266",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "281",
                "target": "347",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "147",
                "target": "228",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "12",
                "target": "75",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "75",
                "target": "243",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "132",
                "target": "247",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "76",
                "target": "274",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "27",
                "target": "7",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "127",
                "target": "392",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "10",
                "target": "126",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "251",
                "target": "390",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "391",
                "target": "174",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "443",
                "target": "357",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "194",
                "target": "376",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "305",
                "target": "412",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "176",
                "target": "375",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "447",
                "target": "398",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "361",
                "target": "181",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "7",
                "target": "201",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "34",
                "target": "249",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "146",
                "target": "87",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "290",
                "target": "103",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "211",
                "target": "344",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "231",
                "target": "189",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "177",
                "target": "34",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "356",
                "target": "400",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "19",
                "target": "343",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "327",
                "target": "397",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "140",
                "target": "185",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "342",
                "target": "204",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "151",
                "target": "356",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "283",
                "target": "5",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "217",
                "target": "315",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "18",
                "target": "422",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "263",
                "target": "122",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "273",
                "target": "176",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "426",
                "target": "302",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "420",
                "target": "302",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "327",
                "target": "49",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "9",
                "target": "324",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "308",
                "target": "300",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "278",
                "target": "442",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "63",
                "target": "80",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "279",
                "target": "180",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "302",
                "target": "332",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "246",
                "target": "430",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "270",
                "target": "307",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "434",
                "target": "156",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "7",
                "target": "64",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "43",
                "target": "300",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "224",
                "target": "177",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "343",
                "target": "21",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "180",
                "target": "321",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "368",
                "target": "261",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "193",
                "target": "107",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "154",
                "target": "276",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "130",
                "target": "367",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "417",
                "target": "243",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "67",
                "target": "305",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "256",
                "target": "247",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "345",
                "target": "352",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "191",
                "target": "352",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "415",
                "target": "211",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "208",
                "target": "290",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "2",
                "target": "64",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "183",
                "target": "127",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "106",
                "target": "372",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "408",
                "target": "148",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "208",
                "target": "316",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "440",
                "target": "171",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "312",
                "target": "246",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "256",
                "target": "327",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "296",
                "target": "244",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "101",
                "target": "228",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "264",
                "target": "272",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "245",
                "target": "52",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "243",
                "target": "75",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "68",
                "target": "223",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "60",
                "target": "373",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "330",
                "target": "301",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "340",
                "target": "260",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "421",
                "target": "281",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "439",
                "target": "421",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "324",
                "target": "128",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "111",
                "target": "346",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "79",
                "target": "196",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "49",
                "target": "291",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "435",
                "target": "334",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "339",
                "target": "34",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "210",
                "target": "130",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "95",
                "target": "402",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "305",
                "target": "298",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "59",
                "target": "108",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "121",
                "target": "221",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "417",
                "target": "1",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "108",
                "target": "86",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "263",
                "target": "273",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "231",
                "target": "318",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "360",
                "target": "290",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "143",
                "target": "405",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "103",
                "target": "350",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "434",
                "target": "290",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "241",
                "target": "402",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "333",
                "target": "117",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "412",
                "target": "328",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "34",
                "target": "48",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "404",
                "target": "285",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "412",
                "target": "201",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "50",
                "target": "96",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "330",
                "target": "24",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "419",
                "target": "152",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "183",
                "target": "248",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "339",
                "target": "3",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "94",
                "target": "23",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "146",
                "target": "19",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "189",
                "target": "26",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "252",
                "target": "450",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "36",
                "target": "32",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "29",
                "target": "441",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "227",
                "target": "323",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "143",
                "target": "145",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "403",
                "target": "402",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "150",
                "target": "284",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "403",
                "target": "143",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "424",
                "target": "135",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "261",
                "target": "192",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "382",
                "target": "284",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "346",
                "target": "54",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "3",
                "target": "259",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "182",
                "target": "56",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "98",
                "target": "291",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "106",
                "target": "1",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "248",
                "target": "28",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "169",
                "target": "289",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "147",
                "target": "109",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "371",
                "target": "164",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "30",
                "target": "126",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "191",
                "target": "168",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "135",
                "target": "78",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "449",
                "target": "104",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "185",
                "target": "353",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "397",
                "target": "35",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "55",
                "target": "165",
                "type": "participatedIn",
                "label": "Participated in"
              },
              {
                "source": "41",
                "target": "163",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "32",
                "target": "173",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "98",
                "target": "376",
                "type": "knows",
                "label": "Knows"
              },
              {
                "source": "185",
                "target": "286",
                "type": "locatedIn",
                "label": "Located in"
              },
              {
                "source": "388",
                "target": "117",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "155",
                "target": "277",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "272",
                "target": "341",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "351",
                "target": "53",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "382",
                "target": "332",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "363",
                "target": "346",
                "type": "partnership",
                "label": "Partners with"
              },
              {
                "source": "282",
                "target": "128",
                "type": "memberOf",
                "label": "Member of"
              },
              {
                "source": "4",
                "target": "132",
                "type": "memberOf",
                "label": "Member of"
              },
        ]
        linkList.forEach((l ,i)=> {
            l.id = i+10000
            l.from = l.source
            l.to = l.target
        })
        netGraph.addData({
            nodes: [],//addD2.data.record[0].params
            links: linkList
        });
    });

    document.getElementById("treeLayout").addEventListener("click", () => {
        const nodes = netGraph.getNodes();

        if (nodes.length > 10) {
            netGraph.setNodeLayout('hierarchy', [nodes[0].id, nodes[9].id]);
        }

        //netGraph.setNodeLayout('hierarchy', ["2786b7455ff93ce7ad0fc4a4cfe5bd21", "61c90e594b88372f8fa3217c150656f0"]);
    });
    document.getElementById("zoom").addEventListener("click", () => {
        let zoomNum = netGraph.getZoom();
        console.log(zoomNum);
        zoomNum += 0.4;
        if (zoomNum > 4) {
            zoomNum = -3;
        }
        netGraph.setZoom(zoomNum);
    });
    document.getElementById("scroll").addEventListener("click", () => {
        const nodes = netGraph.getNodes();

        if (nodes.length > 0) {
            console.log(nodes[0].id);
            netGraph.scrollIntoView(nodes[0].id);
        }
        //netGraph.scrollIntoView("3ded00b898c73c11a72558530859568d");
    });
    document.getElementById("fitView").addEventListener("click", () => {
        netGraph.fitView(null);
    });

    document.getElementById("auto").addEventListener("click", () => {
        const selectedNodes = netGraph.getSelectedNodes();
        const selectedNodeIds = new Array();
        selectedNodes.map((v, i) => {
            selectedNodeIds.push(v.getId());
        });
        netGraph.setNodeLayout('auto');
    });
    document.getElementById("addBubble").addEventListener("click", () => {
        const nodeIds = netGraph.getSelectedNodes().map(v => v.id);
        netGraph.addBubbleSet([nodeIds], ["#d7473a", "#4ea79b"], "one");
    });
    document.getElementById("layoutBubble").addEventListener("click", () => {
        netGraph.layoutBubbleSet(["one"]);
    });
    document.getElementById("removeBubble").addEventListener("click", () => {
        console.log(netGraph.removeBubbleSet(["one"]));
    });

    document.getElementById("addAnimation").addEventListener("click", () => {
        const links = netGraph.getLinks();
        if (links.length > 5) {


            const anData = {
                "data": [
                    {
                        "id": "flow_one",
                        "name": "abc",
                        "speed": 2,
                        "colour": "rgba(246,42,26,1)",
                        "balls": {
                            "ball_001": {
                                "size": 0.301,
                                "link_id": links[0].id,
                                "direct": 1
                            },
                            "ball_002": {
                                "size": 0.3,
                                "link_id": links[1].id,
                                "direct": -1
                            }
                        },
                        "order": [
                            [
                                "ball_001",
                                "ball_002"
                            ]
                        ]
                    },
                    {
                        "id": "flow_two",
                        "name": "abcd",
                        "speed": 1.5,
                        "colour": "rgba(117,218,233,1)",
                        "balls": {
                            "ball_003": {
                                "size": 0.201,
                                "link_id": links[2].id,
                                "direct": 1
                            },
                            "ball_004": {
                                "size": 0.37,
                                "link_id": links[3].id,
                                "direct": -1
                            }
                        },
                        "order": [
                            [
                                "ball_003",
                                "ball_004"
                            ]
                        ]
                    }
                ]
            };
            netGraph.addFlowAnimation(anData.data);
        }
        // axios.get("/src/animation.json").then((res) => {
        //     netGraph.addFlowAnimation(res.data.data)
        // })
    });
    document.getElementById("pauseAnimation").addEventListener("click", () => {
        netGraph.pauseFlowAnimation(["flow_one"]);
    });
    document.getElementById("restartAnimation").addEventListener("click", () => {
        netGraph.restartFlowAnimation(["flow_one"]);
    });
    document.getElementById("removeAnimation").addEventListener("click", () => {
        netGraph.removeFlowAnimation();
    });

    document.getElementById("addFusion").addEventListener("click", () => {


        // const data = {
        //     record: [{
        //         method: "del_node",
        //         params: ["44860c1791da304980f1238f02186257", "614b034c75a23083bbef8a385a81cf20"]
        //     }, {
        //         method: "add_node",
        //         params: [
        //             {
        //                 id: "80b55436e31238928e1b753b2611485ccc",
        //                 name: '你哈',
        //                 img: '/src/img1/a10.png',
        //             }
        //         ]
        //     }, {
        //         method: "del_link",
        //         params:["MG_c02abf5ce4f208d6cd6384ed3ca9db13","MG_adf6a06845a2a3cbe2cd0b6a3b575852"]// ["MG_8209bb0a976600ee8f4be8749c1eb78c", "MG_794dbaf446bae70c486720216e4b5747", "MG_d52a6fa1404fd8b43464beeb16c8f85b"],
        //     }, {
        //         method: "add_link",
        //         params: []
        //         // [{
        //         //     "direct": true,
        //         //     "e_type": 0,
        //         //     "from": "80b55436e31238928e1b753b2611485c",
        //         //     "id": "fjsdlkjflksdjflkjds",
        //         //     "to": "1f56770072803b819da91b3ae1f2a6c4",
        //         //     "type": "玩的接口",
        //         //     "undirected_type": "set_off"
        //         // }]
        //     }]
        // };
        const data = {
            record: [{
                method: "del_node",
                params: ["5d6ee631c7bc3ec1bf24218f99806666", "44860c1791da304980f1238f02186666"]
            }, {
                method: "add_node",
                params: [
                    {
                        id: "80b55436e31238928e1b753b2611485ccc",
                        name: 'xrh1',
                        img: '/src/img1/a10.png',
                    }
                ]
            }, {
                method: "del_link",
                params: []// ["MG_8209bb0a976600ee8f4be8749c1eb78c", "MG_794dbaf446bae70c486720216e4b5747", "MG_d52a6fa1404fd8b43464beeb16c8f85b"],
            }, {
                method: "add_link",
                params: []
                // [{
                //     "direct": true,
                //     "e_type": 0,
                //     "from": "80b55436e31238928e1b753b2611485c",
                //     "id": "fjsdlkjflksdjflkjds",
                //     "to": "1f56770072803b819da91b3ae1f2a6c4",
                //     "type": "玩的接口",
                //     "undirected_type": "set_off"
                // }]
            }]
        };
        netGraph.addFusionAnimation(data);
    });

    document.getElementById("updateUrlMap").addEventListener("click", () => {
        netGraph.replaceDefaultUrlMap({
            "human": '/src/img1/a104.png',
            "entity": '/src/img1/a106.png',
            "animal": "/src/img1/a105.png",
            "default": "/src/img1/a107.png",
        });
    });

    document.getElementById("highlight").addEventListener("click", () => {
        netGraph.updateNodeStatus(["01cc378b0ebe3ad6b82c4a13e0767d47", "80b55436e31238928e1b753b2611485c"], HIGHLIGHT);
    });

    document.getElementById("updateTextStyle").addEventListener("click", () => {
        netGraph.scrollIntoView("Q249995");
        // const selectedNodes = netGraph.getSelectedNodes();
        // netGraph.updateNodeCustomStyle(selectedNodes,{'font-size':40,'background-color':"#000"});
    });
    document.getElementById("autoFocus").addEventListener("click", () => {
        netGraph.focusOnNodes(["01cc378b0ebe3ad6b82c4a13e0767d47"])
    });
    document.getElementById("updateDim").addEventListener("click", () => {
        netGraph.updateDim({ width: 400, height: 400 })
        //   netGraph.updateConstantParams({ nodeHighlightColor: '#ff0000',
        //   nodeHighlightOpacity: 0.5,
        //   lineHighlightColor: '#ff0000',
        //   lineHighlightOpacity: 0.5});
    });
    document.getElementById("updateHighlight").addEventListener("click", () => {
        netGraph.updateConstantParams({
            nodeHighlightColor: '#ff0000',
            nodeHighlightOpacity: 0.5,
            lineHighlightColor: '#ff0000',
            lineHighlightOpacity: 0.5
        });
    });
    document.getElementById("importLayout").addEventListener("click", () => {
        let nodeIds = netGraph.getSelectedNodes().map(item => item.id);
        //console.log(nodeIds);
        netGraph.setNodeLayout('importLayout', nodeIds);
    });
    document.getElementById("exportLayout").addEventListener("click", () => {
        netGraph.backupNodeLayout = new Map(
            netGraph.controller.dataController.data.nodes.map(n => [
                n.id,  // key
                {      // value
                    x: netGraph.getIdMapNode().get(n.id)._x,
                    y: netGraph.getIdMapNode().get(n.id)._y
                }
            ])
        );
        // exportData.nodes.forEach((node) => {
        //     node.x = netGraph.getIdMapNode().get(node.id)._x;
        //     node.y = netGraph.getIdMapNode().get(node.id)._y;
        // });

        console.log(netGraph.backupNodeLayout);

        //console.log(netGraph.controller.elementController.idMapNode.get("0"));
        // saveJSON(exportData, "exportData_"+ new Date() +".json");
    });
}

function saveJSON(data, filename) {
    if (!data) {
        alert('保存的数据为空');
        return;
    }
    if (!filename)
        filename = 'json.json'
    if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 4)
    }
    var blob = new Blob([data], { type: 'text/json' }),
        //e = document.createEvent('MouseEvents'),
        a = document.createElement('a')
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    console.log(a.download);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    //e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    //a.dispatchEvent(e)
    a.click();
};

let addD2 = {
    "code": 20000,
    "data": {
        "record": [
            {
                "method": "add_node",
                "params": [{
                    "id": "5242f25ac46611ec9840b8ca3a670658",
                    "name": "锟斤拷",
                    "img": "/src/img1/a0.png",
                    "metaType": "event",
                    "type": "justice",
                    "subType": "sanction",
                    "loaded": "true"
                }, {
                    "id": "1f56770072803b819da91b3ae1f2a6c4123123",
                    "name": "宋建魑魅魉魍明",
                    "type": "",
                    "subType": "",
                    "img": "./static/img/human.png",
                    "metaType": "nodeSet",
                    "statistics": { "关系": 10, "实体": "00" },
                    "loaded": 1

                },]
            }
        ],
        "fingerprint": "1"
    },
    "ts": 1652233374757
};

