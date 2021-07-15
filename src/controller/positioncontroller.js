import * as d3 from 'd3';

export default class PositionController {
    constructor(netGraph) {
        this.netGraph = netGraph;
        this.useLayout = 'square';
        this._mapType = {
            square: this.square,
            star: this.star,
            circleShape: this.circleShape,
            multSquare: this.multSquare,
            oneRow: this.oneRow,
            oneColumn: this.oneColumn,
            timeSequential: this.timeSequential,
            hierarchy: this.hierarchy,
            auto: this.auto
        }
    }

    layout() {
        return this._mapType[this.useLayout].bind(this);
    }

    setLayout(layoutName) {
        if (layoutName != null) {
            this.useLayout = layoutName;
        }
    }

    square(nodes, elementController,offset=null) {
        if (nodes.length > 0) {
            let nodeIds = [];
            let rowNum = Math.ceil(Math.sqrt(nodes.length));
            let node1 = nodes[0];
            if (!node1.x) {
                node1.x = offset.maxX||0;
                node1.y = offset.maxY||0;
            }
            let col = 0;
            let row = 0;
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                let nodeId = node.id;
                nodeIds.push(nodeId);
                node.x = node1.x + col * 150;
                node.y = node1.y + row * 150;
                col++;
                if (col >= rowNum) {
                    col = 0;
                    row++;
                }
            }
            return elementController.updateLinkPosition(nodeIds);
        }
        return null;
    }

    star(selectedNodes, elementController) {
        if (selectedNodes.length > 0) {
            let nodeIds = [];
            let linkIds = [];
            let mapNodeIdToLinkIds = this.netGraph.getMapNodeIdToLinks();
            let baseNode = selectedNodes[0];
            let baseX = baseNode.x ? baseNode.x : 0;
            let baseY = baseNode.y ? baseNode.y : 0;
            let insideR = (100 * selectedNodes.length) / (2 * Math.PI);
            let outsideR = 0;
            let insideRoate = (2 * Math.PI) / selectedNodes.length;
            let outsideRoate = 0;

            selectedNodes.forEach((node, index) => {
                let id = node.id;
                if (mapNodeIdToLinkIds.has(node.id)) {
                    let rLinkObj = mapNodeIdToLinkIds.get(node.id);
                    rLinkObj.sourceLinks.forEach((link) => {
                        if (linkIds.indexOf(link.id) === -1) {
                            linkIds.push(link.id);
                        }
                    });
                    rLinkObj.targetLinks.forEach((link) => {
                        if (linkIds.indexOf(link.id) === -1) {
                            linkIds.push(link.id);
                        }
                    });
                    nodeIds.push(id);
                    node.x = baseX + Math.sin(insideRoate * index) * insideR;
                    node.y = baseY + Math.cos(insideRoate * index) * insideR;
                } else {
                    node.x = 0;
                    node.y = 0;
                }

            });
            if (linkIds.length > 0) {
                let links = this.netGraph.getLinks(linkIds);
                let outNodes = [];
                let outNodeIds = [];
                links.forEach((link) => {
                    let fromId = link.source.id;
                    let toId = link.target.id;
                    if (nodeIds.indexOf(fromId) === -1 && outNodeIds.indexOf(fromId) === -1) {
                        outNodeIds.push(fromId);
                        let node = this.netGraph.getNodes([fromId])[0];
                        outNodes.push(node);
                    }
                    if (nodeIds.indexOf(toId) === -1 && outNodes.indexOf(toId) === -1) {
                        outNodeIds.push(toId);
                        let node = this.netGraph.getNodes([toId])[0];
                        outNodes.push(node);
                    }
                });
                outsideR = (100 * outNodes.length) / (2 * Math.PI);
                outsideRoate = (2 * Math.PI) / outNodes.length;
                outNodes.forEach((node, index) => {
                    node.x = baseX + Math.sin(outsideRoate * index) * outsideR;
                    node.y = baseY + Math.cos(outsideRoate * index) * outsideR;
                });
            }
            return elementController.updateLinkPosition(nodeIds);
        }
        return null;
    }

    circleShape(nodes, elementController) {
        if (nodes.length > 0) {
            let nodeIds = [];
            let radius = (nodes.length * 150) / (2 * Math.PI);
            let avd = 360 / nodes.length;
            let ahd = (avd * Math.PI) / 180;
            let no1 = nodes[0];
            no1.x = no1.x || 0;
            no1.y = no1.y || 0;
            for (let i = 0; i < nodes.length; i++) {
                let no = nodes[i];
                nodeIds.push(no.id);
                no.x = no1.x + Math.sin(ahd * i) * radius;
                no.y = no1.y - radius + Math.cos(ahd * i) * radius;
            }
            return elementController.updateLinkPosition(nodeIds);
        }
        return null;
    }

    multSquare(nodes, elementController) {
        let no1x = 0;
        let no1y = 0;
        if (nodes.length > 0) {
            no1x = nodes[0].x || 0;
            no1y = nodes[0].y || 0;
            const nodeIds=new Array();
            const typeMap = new Map();
            nodes.map(item => {
                let type = item.data.Entity_type;///
                if (typeMap.has(type)) {
                    typeMap.get(type).push(item);
                } else {
                    typeMap.set(type, [item]);
                }
                nodeIds.push(item.getId());
            });

            Array.from(typeMap.keys()).forEach((v, i) => {
                const nodeArray = typeMap.get(v);
                let rowNum = Math.ceil(Math.sqrt(nodeArray.length));
                let col = 0;
                let row = 0;
                for (let i = 0; i < nodeArray.length; i++) {
                    let no = nodeArray[i];
                    //用户交互锁？？？
                    no.x = no1x + col * 150;
                    no.y = no1y + row * 150;
                    col++;
                    if (col > rowNum) {
                        col = 0;
                        row++;
                    }
                }
                let heightNum = parseInt(nodeArray.length / rowNum);
                no1y = no1y + heightNum * 150 + 300;
            });
            return elementController.updateLinkPosition(nodeIds);
        }
        return null;
        
    }

    oneRow(nodes, elementController) {
        if (nodes.length > 0) {
            let nodeIds = [];
            let no1 = nodes[0];
            no1.x = no1.x || 0;
            no1.y = no1.y || 0;
            nodes.forEach((node, i) => {
                nodeIds.push(node.id);
                node.x = no1.x + i * 150;
                node.y = no1.y;
            });
            return elementController.updateLinkPosition(nodeIds);
        }
        return null;
    }

    oneColumn(nodes, elementController) {
        if (nodes.length > 0) {
            let nodeIds = [];
            let no1 = nodes[0];
            no1.x = no1.x || 0;
            no1.y = no1.y || 0;
            nodes.forEach((node, i) => {
                nodeIds.push(node.id);
                node.x = no1.x;
                node.y = no1.y + i * 150;
            });
            return elementController.updateLinkPosition(nodeIds);
        }
        return null;
    }

    auto(nodes) {
        const mythis = this;
        if (nodes.length < 100) {
            this.jutuan(nodes);
        } else {
            let links = this.netGraph.getLinks();
            this.force = d3.forceSimulation(nodes)
                .force('link', d3.forceLink(links).id(d => d.id).distance(500))
                .force('charge', d3.forceManyBody().strength(-300))
                .force('center', d3.forceCenter());
            setTimeout(() => {
                this.netGraph.updateSettings({
                    layout: {
                        mode: 'static'
                    }
                });
                mythis.force.stop();
            }, 2000);
        }

    }

    jutuan(nodes) {
        const mythis = this;
        let nodeIds = nodes.map(node => node.id);
        this.netGraph.updateSettings({
            layout: {
                mode: 'dynamic'
            },
            gravity: {
                from: 'node',
                to: 'cluster',
                strength: 100
            },
            layoutFreezeMinTimeout: 100,
            layoutFreezeTimeout: 2000,
            incrementalLayoutMaxTime: 2000,
            initialLayoutMaxTime: 2000,
            globalLayoutOnChange: false
        });
        setTimeout(function () {
            mythis.netGraph.updateGraph(nodeIds)
            setTimeout(function () {
                mythis.netGraph.updateSettings({
                    layout: {
                        mode: "static"
                    }
                });
            }, 5000);
        }, 200);
    }

    hierarchy(rootNodes) {
        var mthis = this;
        if (rootNodes.length > 0) {
            // 有选中节点，可以进行层级
            let allNodes = this.netGraph.getNodes()
            let allLinks = this.netGraph.getLinks()
            let allNodeIds = allNodes.map(node => node.id)
            let rootIds = rootNodes.map(node => node.id)
            let edgeList = allLinks.map(link => {
                let linkData = {
                    id: link.source.id,
                    from: link.source.id,
                    to: target.id
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
                let node0 = mthis.netGraph.getNodes([node0Id])[0];
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
                        if (!mthis.netGraph.getNodes([item.id])[0].userManualLock) {
                            mthis.netGraph.getNodes([item.id])[0]["x"] = item.x + initx;
                            mthis.netGraph.getNodes([item.id])[0]["y"] = item.y + inity;
                        }
                        mthis.netGraph.getNodes([item.id]).hierarchyLock = true;
                    }
                });
                mthis.netGraph.updateGraph(allNodeIds);
            }, err => { })
        } else {
            //   mthis.$myToast.warning("请选择节点进行层级排列操作！");
        }
    }

    timeSequential() {  //时序布局
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
        }, err => {
            //   mthis.$Message.error("/doc/timeline接口异常！");
        })
    }


}