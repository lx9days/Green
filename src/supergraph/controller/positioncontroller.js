import * as d3 from 'd3'
function searchZeroDegreeNode(nodes) {
    const zeroDegreeNodes = [];
    nodes.forEach(node => {
        if (node.targetLinks.length === 0) {
            zeroDegreeNodes.push(node);
        }
    });
    return zeroDegreeNodes
}
function BFSTree(rootNodes, nodes, links) {
    const neborTable = new Map();

    const tagMap = new Map();
    const nodeMap = new Map();
    let nodeRes = [];
    nodes.forEach((node) => {
        nodeMap.set(node.id, { id: node.id, children: [] });
        tagMap.set(node.id, false);
        neborTable.set(node.id, [])
    });
    links.forEach(link => {
        if (neborTable.has(link.data.from)) {
            neborTable.get(link.data.from).push(nodeMap.get(link.data.to));
        }
    })

    for (let i = 0; i < rootNodes.length; i++) {
        const queue = [];
        if (!tagMap.get(rootNodes[i].id)) {
            queue.push(nodeMap.get(rootNodes[i].id))
            tagMap.set(rootNodes[i].id, true);
        }
        while (queue.length > 0) {

            const fromNode = queue.shift();
            neborTable.get(fromNode.id).forEach(toNode => {
                if (!tagMap.get(toNode.id)) {
                    tagMap.set(toNode.id, true);
                    fromNode.children.push(toNode);
                    queue.push(toNode);
                }
            })
        }
        nodeRes.push(nodeMap.get(rootNodes[i].id))
    }

    return {
        nodes: nodeRes,
    }
}

export class PositionController {
    constructor(superGraph, name = 'vertical', viewSize) {
        this.superGraph = superGraph
        this.name = name;
        this.viewSize = viewSize
    }
    updateViewSize(viewSize) {
        this.viewSize = [viewSize.width, viewSize.height];
    }
    layout(nodes, links, flag, name = null) {
        if (name) {
            this.name = name;
        }
        switch (this.name) {
            case 'vertical':
                this.verticalLayout(nodes, links, flag);
                break;
            case 'horizontal':
                this.horizontalLayout(nodes, links, flag);
                break;
        }
    }

    horizontalLayout_v1(nodes, links) {
        if (nodes && nodes.length > 0) {
            const rootNodes = searchZeroDegreeNode(nodes);
            const idMapNode = new Map();
            nodes.forEach(node => {
                idMapNode.set(node.id, node);
            })
            const data = BFSTree(rootNodes, nodes, links);
            let allIds = [];
            for (let i = 0; i < data.nodes.length; i++) {
                let nn1 = [];
                const initx = this.viewSize[0] / 2;//rootNodes[i].x?rootNodes[i].x:(i+1)*150;
                const inity = this.viewSize[1] / 2 + 100 * i;//rootNodes[i].y?rootNodes[i].y:400;
                let allNodeIds = [];
                const root = d3.hierarchy(data.nodes[i]);
                root.dx = 250;
                root.dy = 250;
                d3.tree().nodeSize([root.dx, root.dy])(root);

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
                const allNodes = []
                allNodeIds.forEach(nodeId => {
                    allNodes.push(idMapNode.get(nodeId));
                });
                allNodes.forEach((node, i) => {
                    node.x = nn1[i].y + initx;
                    node.y = nn1[i].x + inity;
                })
                allIds = [...allIds, ...allNodeIds];
            }
        }
    }
    horizontalLayout(nodes, links, flag = false) {
        if (nodes && nodes.length > 0) {
            const rootNodes = searchZeroDegreeNode(nodes);
            const data = BFSTree(rootNodes, nodes, links);
            const idMapNode = new Map();
            nodes.forEach(node => {
                idMapNode.set(node.id, node);
            });
            const virtualRootNode = { id: "virtual_node", data: { id: "virtual_node" }, children: [] }
            for (let i = 0; i < data.nodes.length; i++) {
                virtualRootNode.children.push(data.nodes[i]);
            }
            let nn1 = [];
            const initx = this.viewSize[0] / 2;//rootNodes[i].x?rootNodes[i].x:(i+1)*150;
            const inity = this.viewSize[1] / 2;//rootNodes[i].y?rootNodes[i].y:400;
            let allNodeIds = [];
            const root = d3.hierarchy(virtualRootNode);
            root.dx = 150;
            root.dy = 150;
            d3.tree().nodeSize([root.dx, root.dy])(root);

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
            nn1.forEach(item => {
                allNodeIds.push(item.id);
            });
            const allNodes = [];
            allNodeIds.forEach(nodeId => {
                allNodes.push(idMapNode.get(nodeId));
            });

            allNodes.forEach((node, i) => {
                if (!flag) {
                    if (node && node.newNode) {
                        node.x = nn1[i].y + initx - 150;
                        node.y = nn1[i].x + inity;
                        node.newNode = false;
                    }
                } else {
                    if (node) {
                        node.x = nn1[i].y + initx - 150;
                        node.y = nn1[i].x + inity;
                        node.newNode = false;
                    }
                }


            });
        }
    }

    verticalLayout_v1(nodes, links) {
        if (nodes && nodes.length > 0) {
            const rootNodes = searchZeroDegreeNode(nodes);
            const data = BFSTree(rootNodes, nodes, links);
            let allIds = [];
            const idMapNode = new Map();
            nodes.forEach(node => {
                idMapNode.set(node.id, node);
            });
            for (let i = 0; i < data.nodes.length; i++) {
                let nn1 = [];
                const initx = this.viewSize[0] / 2 + i * 100;//rootNodes[i].x?rootNodes[i].x:(i+1)*150;
                const inity = this.viewSize[1] / 2;//rootNodes[i].y?rootNodes[i].y:400;
                let allNodeIds = [];
                const root = d3.hierarchy(data.nodes[i]);
                root.dx = 250;
                root.dy = 250;
                d3.tree().nodeSize([root.dx, root.dy])(root);

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
                const allNodes = []
                allNodeIds.forEach(nodeId => {
                    allNodes.push(idMapNode.get(nodeId));
                });

                allNodes.forEach((node, i) => {
                    node.x = nn1[i].x + initx;
                    node.y = nn1[i].y + inity;
                })
                allIds = [...allIds, ...allNodeIds];
            }
        }
    }
    verticalLayout(nodes, links, flag = false) {
        if (nodes && nodes.length > 0) {
            const rootNodes = searchZeroDegreeNode(nodes);
            const data = BFSTree(rootNodes, nodes, links);
            const idMapNode = new Map();
            nodes.forEach(node => {
                idMapNode.set(node.id, node);
            });
            const virtualRootNode = { id: "virtual_node", data: { id: "virtual_node" }, children: [] }
            for (let i = 0; i < data.nodes.length; i++) {
                virtualRootNode.children.push(data.nodes[i]);
            }

            let nn1 = [];
            const initx = this.viewSize[0] / 2;//rootNodes[i].x?rootNodes[i].x:(i+1)*150;
            const inity = this.viewSize[1] / 2;//rootNodes[i].y?rootNodes[i].y:400;
            let allNodeIds = [];
            const root = d3.hierarchy(virtualRootNode);
            root.dx = 150;
            root.dy = 150;
            d3.tree().nodeSize([root.dx, root.dy])(root);

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
            nn1.forEach(item => {
                allNodeIds.push(item.id);
            });
            const allNodes = [];
            allNodeIds.forEach(nodeId => {
                allNodes.push(idMapNode.get(nodeId));
            });

            allNodes.forEach((node, i) => {
                if (!flag) {
                    if (node && node.newNode) {
                        node.x = nn1[i].x + initx;
                        node.y = nn1[i].y + inity - 150;
                        node.newNode = false;
                    }
                } else {
                    if (node) {
                        node.x = nn1[i].x + initx;
                        node.y = nn1[i].y + inity - 150;
                        node.newNode = false;
                    }
                }
            });
        }
    }
}

