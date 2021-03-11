import NetWorkBackEnd from './network_backend'
import * as d3 from 'd3';

export default class GraphLayout{
    constructor(netGraph){
        this.netGraph = netGraph
        this.useLayout = 'square'
        this.netWorkBackEnd = new NetWorkBackEnd()
        this._mapType = {
            square: this.square,
            star: this.star,
            circleShape: this.circleShape,
            oneRow: this.oneRow,
            oneColumn: this.oneColumn,
            timeSequential: this.timeSequential,
            hierarchy: this.hierarchy,
            auto: this.auto
        }
    }

    layout(layoutName = null){
        if(layoutName){
            this.useLayout = layoutName;
        }
        return this._mapType[this.useLayout].bind(this)
    }

    square (nodes) { //矩形布局
        if (nodes.length > 0) {
            let nodeIds = []
            let rowNum = Math.ceil(Math.sqrt(nodes.length));
            let node1 = nodes[0]
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                let nodeId = node.id
                nodeIds.push(nodeId)
                let col = i % rowNum;
                let row = parseInt(i / rowNum);
                node["x"] = node1["x"] + col * 150;
                node["y"] = node1["y"] + row * 150;
            }
            this.netGraph.updateGraph(nodeIds);
        }
    }

    star (selectedNodes) { //星型布局
        if (selectedNodes.length > 0) {
            let nodeIds = []
            let linkIds = []
            let allNodes = this.netGraph.nodes()
            let mapNodeIdToLinkIds = this.netGraph.getMapNodeIdToLinkIds()
            let baseNode = selectedNodes[0];
            let baseX = baseNode["x"] ? baseNode["x"] : 0;
            let baseY = baseNode["y"] ? baseNode["y"] : 0;
            let insideR = (100 * selectedNodes.length) / (2 * Math.PI);
            let outsideR = 0;
            let insideRoate = (2 * Math.PI) / selectedNodes.length;
            let outsideRoate = 0;
            selectedNodes.forEach((node, index) => {
                let id = node.id
                let rLinkIds = mapNodeIdToLinkIds[id] || []

                for(let i = 0; i < rLinkIds.length; i++){
                    let linkId = rLinkIds[i];
                    if(linkIds.indexOf(linkId) === -1){
                        linkIds.push(linkId)
                    }
                }
                nodeIds.push(id)
                node["x"] = baseX + Math.sin(insideRoate * index) * insideR;
                node["y"] = baseY + Math.cos(insideRoate * index) * insideR;
            });
            if (linkIds.length > 0) {
                let links = this.netGraph.getLinks(linkIds)
                let outNodes = [];
                let outNodeIds = []
                links.forEach(link => {
                    let fromId = link.data.from;
                    let toId = link.data.to;
                    if(nodeIds.indexOf(fromId) === -1 && outNodeIds.indexOf(fromId) === -1){
                        outNodeIds.push(fromId)
                        let node = this.netGraph.getNode(fromId)
                        outNodes.push(node)
                    }
                    if(nodeIds.indexOf(toId) === -1 && outNodeIds.indexOf(toId) === -1){
                        outNodeIds.push(toId)
                        let node = this.netGraph.getNode(toId)
                        outNodes.push(node)
                    }
                    // nodes = nodes.concat(
                    //   mthis.netchart.getLink(item).data.from,
                    //   mthis.netchart.getLink(item).data.to
                    // );
                });
                outsideR = (100 * outNodes.length) / (2 * Math.PI);
                outsideRoate = (2 * Math.PI) / outNodes.length;
                outNodes.forEach((node, index) => {
                    node["x"] = baseX + Math.sin(outsideRoate * index) * outsideR;
                    node["y"] = baseY + Math.cos(outsideRoate * index) * outsideR;
                });
            }
            this.netGraph.updateGraph(nodeIds);
        }
    }

    
    circleShape (nodes) {  //环形布局
        if (nodes.length > 0) {
            let nodeIds = []
            //半径
            let radius = (nodes.length * 150) / (2 * Math.PI);
            //每一个BOX对应的角度;
            let avd = 360 / nodes.length;
            //每一个BOX对应的弧度;
            let ahd = (avd * Math.PI) / 180;
            let no1 = nodes[0];
            for (let i = 0; i < nodes.length; i++) {
                //解锁位置
                let no = nodes[i];
                let nodeId = no.id;
                nodeIds.push(nodeId)
                no.x = no1.x + Math.sin(ahd * i) * radius;
                no.y = no1.y - radius + Math.cos(ahd * i) * radius;
            }
            this.netGraph.updateGraph(nodeIds);
        }
    }

    multSquare (nodes) {   //多矩形
        var mthis = this;
        let no1x = 0;
        let no1y = 0;
        if (nodes.length > 0) {
          no1x = nodes[0]["x"];
          no1y = nodes[0]["y"];
          // mthis.netchart.selection()
          let multSquareObj = {};
          nodes.map(item => {
            let type = item.data.Entity_type;
            if (multSquareObj[type] && multSquareObj[type].length > 0) {
              multSquareObj[type].push(item);
            } else {
              multSquareObj[type] = new Array(item);
            }
          });
          setTimeout(() => {
            for (let typeList in multSquareObj) {
              if (multSquareObj[typeList].length > 0) {
                let rowNum = Math.ceil(Math.sqrt(multSquareObj[typeList].length));
                for (let i = 0; i < multSquareObj[typeList].length; i++) {
                  let no = multSquareObj[typeList][i];
                  if (!no.userManualLock) {
                    let col = i % rowNum;
                    let row = parseInt(i / rowNum);
                    no["x"] = no1x + col * 150;
                    no["y"] = no1y + row * 150;
                  }
                }
                let heightNum = parseInt(multSquareObj[typeList].length / rowNum);
                no1y = no1y + heightNum * 150 + 300;
              }
            }
          }, 100);
        }
    }

    oneRow (nodes) {
        if (nodes.length > 0) {
            let nodeIds = []
            let no1 = nodes[0];
            for (let i = 0; i < nodes.length; i++) {
                let no = nodes[i];
                let nodeId = no.id;
                nodeIds.push(nodeId)
                no["x"] = no1["x"] + i * 150;
                no["y"] = no1["y"];
            }
            this.netGraph.updateGraph(nodeIds);
        }
    }

    oneColumn (nodes) {
        if (nodes.length > 0) {
            let nodeIds = []
            let no1 = nodes[0];;
            nodes.forEach((node, index) => {
                let nodeId = node.id;
                nodeIds.push(nodeId)
                node["x"] = no1["x"];
                node["y"] = no1["y"] + index * 150;
            });
            this.netGraph.updateGraph(nodeIds);
        }
    }

    
    timeSequential () {  //时序布局
        return 
        let mthis = this
        let doctypes = ["document"].concat(this.docV);
        let eventtypes = ["event"].concat(this.evV);
        let docnodeids = [];
        let eventnodeids = [];
        let entitynodeids = [];
        this.selectionId.forEach(item => {
          let node = mthis.netchart.getNode(item);
          if (node) {
            if (doctypes.indexOf(node.data.Entity_type) > -1) {
              docnodeids.push(node.id);
            } else if (eventtypes.indexOf(node.data.Entity_type) > -1) {
              eventnodeids.push(node.id);
            } else {
              entitynodeids.push(node.id);
            }
          }
        });
        let datetype = "day"; //时序分度值
        let mixed = true; //时序是否混合显示
        let params = {
          event_ids: eventnodeids,
          doc_ids: docnodeids,
          group_by: datetype,
          mix: mixed
        }
        mthis.netWorkBackEnd.timeLineLayout(params, result => {
          let baseX = 400 * (Math.random() - 0.5) + 200;
            let baseY = baseX;
            let pos = [0, 0];
            //排布其他节点
            if (entitynodeids.length > 0) {
              pos = dynamicPos.getSquarePosition(baseX, baseY, entitynodeids);
  
              entitynodeids.forEach((item, index) => {
                mthis.netchart.getNode(item)["x"] = pos[index][0];
                mthis.netchart.getNode(item)["y"] = pos[index][1];
              });
            }
            baseY = baseY - 200;
            if (mixed) {
              //混合排布
              Object.keys(result).forEach((item, index) => {
                let Xr = baseX + index * 150;
                result[item]["mix_ids"].forEach((it, ind) => {
                  mthis.netchart.getNode(it)["x"] = Xr;
                  mthis.netchart.getNode(it)["y"] = baseY - ind * 100;
                });
              });
            } else {
              // 非混合排布
            }
        }, err =>{
        //   mthis.$Message.error("/doc/timeline接口异常！");
        })
    }

    hierarchy (rootNodes) {  // 层级布局
        var mthis = this;
        if (rootNodes.length > 0) {
          // 有选中节点，可以进行层级
          debugger
          let allNodes = this.netGraph.nodes()
          let allLinks = this.netGraph.links()
          let allNodeIds = allNodes.map(node => node.id)
          let rootIds = rootNodes.map(node => node.id)
          let edgeList = allLinks.map(link => {
              let linkData = {
                id: link.data.from,
                from: link.data.from,
                to: link.data.to
              }
              return linkData;
            });
          let params = {
            nodeIds: allNodeIds,
            RootNodeIdList: rootIds,
            EdgeList: edgeList,
            edge_from_backend: false
          }
          mthis.netWorkBackEnd.hierarchicalLayout(params, data => {
            let treeRoot = data[0][0];
            let node0Id = rootIds[0]
            let node0 = mthis.netGraph.getNode(node0Id)
            let initx = node0["x"];
            let inity = node0["y"];
            var root = d3.hierarchy(treeRoot);
            root.dx = 100;
            root.dy = 300;
            d3.tree().nodeSize([root.dx, root.dy])(root);
            var nn1 = [];
            var ct = root;
            var tt = {
              id: ct.data.name,
              x: root["x"],
              y: root["y"]
            };
            nn1.push(tt);
            if (root.children) {
              var stack = root.children;
              while (stack.length != 0) {
                var ct = stack.pop();
                var tt = {
                  id: ct.data.name
                };
                tt.x = ct.x;
                tt.y = ct.y;
                nn1.push(tt);
                if (ct.children !== undefined) {
                  let childrens = ct.children;
                  for (let i = childrens.length - 1; i >= 0; i--)
                    stack.push(childrens[i]);
                }
              }
            }
            nn1.map(item => {
              if (mthis.netGraph.getNode(item.id)) {
                if (!mthis.netGraph.getNode(item.id).userManualLock) {
                  mthis.netGraph.getNode(item.id)["x"] = item.x + initx;
                  mthis.netGraph.getNode(item.id)["y"] = item.y + inity;
                }
                mthis.netGraph.getNode(item.id).hierarchyLock = true;
              }
            });
            mthis.netGraph.updateGraph(allNodeIds);
          }, err => {})
        } else {
        //   mthis.$myToast.warning("请选择节点进行层级排列操作！");
        }
    }

    auto (nodes) {
        let mthis = this;
        if (nodes.length < 100) {
          mthis.jutuan(nodes);
        } else {
          let nodeIdToIndex = {};
          nodes.forEach((item, index) => {
            nodeIdToIndex[item.id] = index;
          });
          let links = mthis.netGraph.links();
          let linkST = [];
          links.forEach(link => {
              let fromId = link.data.from;
              let toId = link.data.to
              if (nodeIdToIndex[fromId] && nodeIdToIndex[toId]) {
                linkST.push({
                  source: nodeIdToIndex[fromId],
                  target: nodeIdToIndex[toId]
                });
              }
            });
          mthis.force = d3
            .forceSimulation(nodes)
            .force("charge", d3.forceManyBody().strength(-300)) // 团簇内拉伸力
            .force("link", d3.forceLink(linkST).distance(500))
            .force("center", d3.forceCenter()); // 用指定的x坐标和y坐标创建一个居中力
          setTimeout(function () {
            mthis.netGraph.updateSettings({
              layout: {
                mode: "static"
              }
            });
            mthis.force.stop();
          }, 2000);
        }
    }

    jutuan(nodes) {
        var mthis = this;
        let nodeIds = nodes.map(node => node.id)
        mthis.netGraph.updateSettings({
          layout: {
            mode: "dynamic"
          },
          gravity: {
            from: "node",
            to: "cluster",
            strength: 100
          },
          layoutFreezeMinTimeout: 100,
          layoutFreezeTimeout: 2000,
          incrementalLayoutMaxTime: 2000,
          initialLayoutMaxTime: 2000,
          globalLayoutOnChanges: false
        });
        // nodeIds.forEach(id => {
        //     mthis.netchart.unlockNode(id);
        //     mthis.netchart.updateSettings();
        //     mthis.netchart.updateSize();
        // });
        setTimeout(function() {
          mthis.netGraph.updateGraph(nodeIds)
          setTimeout(function() {
            mthis.netGraph.updateSettings({
              layout: {
                mode: "static"
              }
            });
          }, 5000);
        }, 200);
    }
    
    hierarchyCircle () {  //层级环布局
        return
        var mthis = this;
        if (mthis.selectionId.length > 0) {
          let nodesIDS = mthis.netchart.nodes().map(item => {
            return item.id;
          });
          let rootIds =
            typeof mthis.selectionId[0] === "string"
              ? mthis.selectionId
              : mthis.selectionId.map(it => {
                return it.id;
              });
          let edgeList = [];
          let slink = mthis.netchart
            .links()
            .filter(item => {
              return (
                util.ifInArr(item.from.id, nodesIDS) ||
                util.ifInArr(item.to.id, nodesIDS)
              );
            })
            .map(item => {
              edgeList.push({
                id: item.from.id,
                from: item.from.id,
                to: item.to.id
              });
              return item;
            });
          let params = {
            nodeIds: nodesIDS,
            RootNodeIdList: rootIds,
            EdgeList: edgeList,
            edge_from_backend: false
          }
          mthis.netWorkBackEnd.hierarchicalLayout(params, data => {
            let treeRoot = data[0][0];
            let initx = mthis.netchart.getNode(rootIds[0])["x"];
            let inity = mthis.netchart.getNode(rootIds[0])["y"];
            let tempMax = {};
            let tempMin = {};
            var root = d3.hierarchy(treeRoot);
  
            root.dx = 100;
            root.dy = 300; //半径倍数或层数
            d3.tree().nodeSize([root.dx, root.dy])(root);
  
            var nn1 = [];
            var ct = root;
            var tt = {
              id: ct.data.name,
              x: root["x"],
              y: root["y"]
            };
            nn1.push(tt);
            if (root.children) {
              var stack = root.children;
              while (stack.length != 0) {
                var ct = stack.pop();
                var tt = {
                  id: ct.data.name
                };
                tt.x = ct.x;
                tt.y = ct.y;
                nn1.push(tt);
                if (ct.children !== undefined) {
                  let childrens = ct.children;
                  for (
                    let i = childrens.length - 1;
                    i >= 0;
                    i-- //将现在访问点的节点的子节点存入stack，供将来访问
                  )
                    stack.push(childrens[i]);
                }
                mthis.netchart.getNode(item.id).hierarchyLock = true;
              }
            }
            let temp = nn1.map(item => {
              tempMax[item.y] =
                tempMax[item.y] > item.x ? tempMax[item.y] : item.x;
              tempMin[item.y] =
                tempMin[item.y] < item.x ? tempMin[item.y] : item.x;
              return item;
            });
            let temptotal = {};
            Object.keys(tempMax).forEach(key => {
              temptotal[key] = tempMax[key] - tempMin[key];
            });
            temp.map(item => {
              if (mthis.netchart.getNode(item.id)) {
                if (temptotal[item.y] !== 0) {
                  mthis.netchart.getNode(item.id)["x"] =
                    Math.sin(((2 * Math.PI) / temptotal[item.y]) * item.x) *
                    item.y +
                    initx;
                  mthis.netchart.getNode(item.id)["y"] =
                    Math.cos(((2 * Math.PI) / temptotal[item.y]) * item.x) *
                    item.y +
                    inity;
                } else {
                  mthis.netchart.getNode(item.id)["x"] = initx;
                  mthis.netchart.getNode(item.id)["y"] = inity;
                }
                mthis.netchart.getNode(item.id).hierarchyLock = true;
              }
            });
            mthis.scrollAndUpdateView(nodesIDS);
          }, err => {})
        } else {
          this.$myToast.warning("请选择节点进行层级排列操作！");
        }
      }
}