import * as d3 from 'd3';
import * as d3Simple from "d3-force-sampled"
//import NetWorkBackEnd from './network_backend';
import { BFSTree } from '../helper/util'
import dynamicPos from '../helper/dynamicPosition';

export default class PositionController {
    constructor(netGraph, { width, height }) {
        this.netGraph = netGraph;
        this.canvasCenter = {
            x: width / 2,
            y: height / 2
        };
        this.offset = {
            x: 0,
            y: 0
        };
        //this.netWorkBackEnd = new NetWorkBackEnd();
        this.force = null

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
    setCanvasCenter({ width, height }) {
        this.canvasCenter = {
            x: width / 2,
            y: height / 2
        }
    }

    setLayout(layoutName) {
        if(layoutName!=="auto"){
            if(this.force){
                this.force.stop();
            }
        }
        if (layoutName != null) {
            this.useLayout = layoutName;
        }
    }

    square(nodes) {
        if (nodes.length > 0) {
            let nodeIds = [];
            let rowNum = Math.ceil(Math.sqrt(nodes.length));
            let node1 = nodes[0];
            if (node1) {
                this.offset.x += (Math.random() - 0.5) * 200;
                this.offset.y += (Math.random() - 0.5) * 200;

                node1.x = ((this.canvasCenter.x - rowNum * 100 / 2) || 0) + this.offset.x;
                node1.y = ((this.canvasCenter.y - rowNum * 100 / 2) || 0) + this.offset.y;

            }
            let col = 0;
            let row = 0;
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                let nodeId = node.id;
                nodeIds.push(nodeId);
                node.x = node1.x + col * 100;
                node.y = node1.y + row * 100;
                col++;
                if (col >= rowNum) {
                    col = 0;
                    row++;
                }
            }
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        }
    }

    layoutBubbleSet(regions) {

        if (!Array.isArray(regions) || regions.length < 0) {
            return
        }
        let nodeIds = [];

        regions.forEach((region, i) => {
            const bubbles = region.getBubbles();
            const curPos = { x: 0, y: 0 };
            bubbles.forEach((bubble, ind) => {
                const nodes = bubble.getOriginNodes();
                if (nodes.length > 0) {

                    let rowNum = Math.ceil(Math.sqrt(nodes.length));
                    let node1 = nodes[0];
                    let col = 0;
                    let row = 0;
                    for (let i = 0; i < nodes.length; i++) {
                        let node = nodes[i];
                        let nodeId = node.id;
                        nodeIds.push(nodeId);
                        if (ind === 0) {
                            node.x = node1.x + col * 100;
                            node.y = node1.y + row * 100;
                        } else {
                            node.x = curPos.x + col * 100;
                            node.y = curPos.y + row * 100;
                        }

                        col++;
                        if (col >= rowNum) {
                            col = 0;
                            row++;
                        }
                    }
                    if (ind === 0) {
                        curPos.x = node1.x + (rowNum + 1) * 100;
                        curPos.y = node1.y;
                    } else {
                        curPos.x = curPos.x + (rowNum + 1) * 100;
                    }

                }
                bubble.reCompute();
            });

        });
        this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, false])

    }

    star(selectedNodes) {
        if (selectedNodes.length > 0) {
            let nodeIds = [];
            let linkIds = [];
            let mapNodeIdToLinkIds = this.netGraph.getIdMapNode();
            let baseNode = selectedNodes[0];
            let baseX = baseNode.x ? baseNode.x : 0;
            let baseY = baseNode.y ? baseNode.y : 0;
            let insideR = (100 * selectedNodes.length) / (2 * Math.PI);
            let outsideR = 0;
            let insideRoate = (2 * Math.PI) / ((selectedNodes.length-1)>0?(selectedNodes.length-1):1);
            let outsideRoate = 0;
            selectedNodes.forEach((node, index) => {
                if (index !== 0) {
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
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        }
    }

    circleShape(nodes) {
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
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        }

    }

    multSquare(nodes) {
        let no1x = 0;
        let no1y = 0;
        if (nodes.length > 0) {
            no1x = nodes[0].x || 0;
            no1y = nodes[0].y || 0;
            const nodeIds = new Array();
            const typeMap = new Map();
            nodes.map(item => {
                let type = item.data.metaType;///
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
                    no.x = no1x + col * 100;
                    no.y = no1y + row * 100;
                    col++;
                    if (col > rowNum) {
                        col = 0;
                        row++;
                    }
                }
                let heightNum = parseInt(nodeArray.length / rowNum);
                no1y = no1y + heightNum * 100 + 200;
            });
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        }


    }

    oneRow(nodes) {
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
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        }

    }

    oneColumn(nodes) {
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
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        }

    }

    auto(nodes, srclinks = null) {
        const nodeIdToIndex = {};
        nodes.forEach((item, index) => {
            nodeIdToIndex[item.id] = index + 1;
        })
        const nodeIds = nodes.map(node => node.id)
        let links = [];
        if (srclinks) {
            links = srclinks;
        } else if (this.netGraph) {
            links = this.netGraph.getLinks();
        } else {
            links = [];
        }

        const linkST = [];
        links.forEach(link => {
            const fromId = link.data.from;
            const toId = link.data.to;
            if (nodeIdToIndex[fromId] && nodeIdToIndex[toId]) {
                linkST.push({
                    source: nodeIdToIndex[fromId] - 1,
                    target: nodeIdToIndex[toId] - 1
                });
            }
        });
        this.force = d3.forceSimulation(nodes)
            .velocityDecay(0.2)
            .force("charge", d3.forceManyBody().strength(-300))
            .force("link", d3.forceLink(linkST).distance(120))
            .force("center", d3.forceCenter(this.canvasCenter.x, this.canvasCenter.y))
        this.force.on("tick", () => {
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        })
        let force = this.force;
        setTimeout(() => {
            if (force) {
                force.stop()
            }
        }, 5000)
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
        if (rootNodes.length > 0) {

            const data = BFSTree(rootNodes, this.netGraph.getNodes(), this.netGraph.getLinks())

            let allIds = [];
            for (let i = 0; i < data.nodes.length; i++) {
                let nn1 = [];
                const initx = rootNodes[i].x;
                const inity = rootNodes[i].y;
                let allNodeIds = [];
                const root = d3.hierarchy(data.nodes[i]);
                root.dx = 100;
                root.dy = 300;
                d3.tree().nodeSize([root.dx, root.dy])(root);
                //console.log(root);
                let ct = root;

                let tt = {
                    id: ct.data.id,
                    x: root.x,
                    y: root.y
                };
                nn1.push(tt);
                if (root.children && root.children.length > 0) {
                    let stack = root.children;
                    while (stack.length !== 0) {
                        let ctt = stack.pop();
                        let ttt = {
                            id: ctt.data.id,
                            x: ctt.x,
                            y: ctt.y
                        }
                        nn1.push(ttt);
                        if (ctt.children && ctt.children.length > 0) {
                            ctt.children.forEach(child => {
                                stack.push(child)
                            })
                        }
                    }
                }
                allNodeIds = nn1.map(item => item.id);
                const allNodes = this.netGraph.getNodes(allNodeIds);
                allNodes.forEach((node, i) => {
                    node.x = nn1[i].x + initx;
                    node.y = nn1[i].y + inity;
                })
                allIds = [...allIds, ...allNodeIds];
            }

            this.netGraph.controller.eventController.fire("_updateEntityPosition", [allIds, true])
        }
    }

    timeSequential(nodes) { // 时序布局
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
            this.netGraph.controller.eventController.fire("_updateEntityPosition", [nodeIds, true])
        });
    }


}