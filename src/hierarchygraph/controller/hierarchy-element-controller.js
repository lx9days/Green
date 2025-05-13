import HierarchyNode from "../model/hierarchy-node";
import * as d3 from "d3";
import RenderHierarchyLine from "../model/render-hierarchy-line";
import RenderHierarchyBackground from "../model/render-hierarchy-background";
import RenderHierarchyIcon from "../model/render-hierarchy-icon";
import RenderHierarchyMarker from "../model/render-hierarchy-marker";
import RenderHierarchyText from "../model/render-hierarchy-text";
import { autoFocusNode } from "../helper/util";
import { style } from "d3";

export default class HierarchyElementController {
    constructor(controller, data) {
        this._init(controller);
        this.parseNewData(data);

        this.controller.canvasController.mountElementController(this);
    }

    parseNewData(data) {
        this._parseParams(data);
    }
    _parseParams(data) {
        this._generateInternalEntity(data);

    }
    //初始化数据结构
    _init(controller) {
        this.initVisibleDepth = 2
        this.roots = new Array();
        this.fakeRoot = null;
        this.nodes = new Array();
        this.links = new Array();
        this.controller = controller;
        this.idMapNode = new Map();//id Node 映射
        this.idMapLink = new Map();//id Link 映射
        //this.nodeIdMapLinks = new Map();//node Id 映射与该node发生关联的所有的link
        this.nodeRenderMap = new Map();// node id 映射该node 对应的所有的 renderobj
        this.linkRenderMap = new Map();// link id 映射该link 对应的所有的 renderobj
        this.characterSet = new Set();//保存textlayer的字符

        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderText: new Array(),
            renderMark: new Array(),
            charSet: null,
        }
    }
    _generateInternalEntity(data) {

        this.idMapNode = new Map();
        if (data && data.nodes && data.nodes.length > 0) {
            const roots = data.nodes.map((item) => {
                return item.data;
            });
            const fakeRoot = { id: "fake_root", _id: "fake_root", children: roots }
            const hierarchyRoot = d3.hierarchy(fakeRoot);
            const dim = this.controller.canvasController.getDim();
            this.treeFunc = d3.tree().nodeSize([100, 250]).separation(function (a, b) { return (a.parent == b.parent ? 1 : 2); });
            const treeRes = this.treeFunc(hierarchyRoot);
            this.fakeRoot = new HierarchyNode({ data: treeRes.data, depth: treeRes.depth, height: treeRes.height, childrenVis: true }, null, true)
            this.nodes.push(this.fakeRoot);

            data.nodes.forEach(obj => {
                const curInternalObj = new HierarchyNode({ data: obj.data, depth: this.fakeRoot.depth + 1, height: this.fakeRoot.height - 1, childrenVis: true }, this.fakeRoot);
                this.fakeRoot.addChild(curInternalObj);
                this.nodes.push(curInternalObj);
                this.roots.push(curInternalObj);
            });

            let quene = [];
            this.roots.forEach(root => {
                quene.push(root);
            })
            while (quene.length > 0) {
                const cur = quene.shift();
                //console.log(cur);
                const curChildren = cur.data.children;
                if (curChildren && curChildren.length > 0) {
                    curChildren.forEach(child => {
                        const curInternalObj = new HierarchyNode({ data: child, depth: cur.depth + 1, height: cur.height - 1, childrenVis: (cur.depth + 1) < this.initVisibleDepth ? true : false }, cur);
                        this.nodes.push(curInternalObj);
                        cur.addChild(curInternalObj);
                        quene.push(curInternalObj);
                    });
                }
            }
            this.nodes.forEach(node => {
                this.idMapNode.set(node.id, node);
            });
        }
        this.updateVisibleTree();
        const visibleNodes = this.getVisibleNodes();
        this.controller.styleController.mountAllStyleToElement(visibleNodes, []);
        this._parseElements(visibleNodes);
    }
    traverseLayoutedTree(layoutedTree, dim) {
        //let columnNum = Math.ceil(Math.sqrt(layoutedTree.children.length));
        let gapX = 0;
        let baseX = layoutedTree.children[0].x;
        let gapY = (layoutedTree.children[2].y - layoutedTree.y) * 2.5 + 20;
        //console.log(gapY);
        // layoutedTree.children.forEach((d, i) => {

        //     d.shiftX = gapX * (1 + i % columnNum) - d.x;
        //     d.shiftY = gapY * Math.floor( i / columnNum);
        // });
        layoutedTree.children.forEach((d, i) => {
            d.leftWidth = 0;
            d.rightWidth = 0;
            console.log(d.data.childrenVisible);
            if (d.children) {
                let leftPointer = d.children[0];
                let rightPointer = d.children[d.children.length - 1];
                d.children.forEach((c) => {
                    if (c.children && c.children.length > 1) {
                        leftPointer = (leftPointer.x > c.children[0].x) ? c.children[0] : leftPointer;
                        rightPointer = (rightPointer.x < c.children[c.children.length - 1].x) ? c.children[c.children.length - 1] : rightPointer;
                        //console.log(leftPointer.x , c.children[0].x, rightPointer.x, c.children[c.children.length - 1].x);
                    }
                })
                d.leftWidth = d.x - leftPointer.x;
                d.rightWidth = rightPointer.x - d.x;
            }
            d.treeWidth = d.rightWidth + d.leftWidth;
        });
        let lineLength = 0;
        let idealLineLength = 250;
        layoutedTree.children.forEach((d) => {
            idealLineLength = (d.treeWidth > idealLineLength) ? d.treeWidth : idealLineLength;
        });
        let lineId = 0;
        baseX -= layoutedTree.children[0].leftWidth;
        layoutedTree.children.forEach((d, i) => {

            if (lineLength >= idealLineLength) {
                lineId++;
                //console.log(lineLength, ">", idealLineLength, 'so going to line', lineId);
                lineLength = 0;
                gapX = baseX + d.leftWidth - d.x;
            }
            lineLength += d.treeWidth;
            d.line = lineId;
            d.shiftY = gapY * lineId;
            d.shiftX = gapX;

        });
        // layoutedTree.children[0].shiftX = dim.width * 0.25 - layoutedTree.children[0].x;
        // layoutedTree.children[0].shiftY = 0;
        // layoutedTree.children[1].shiftX = dim.width * 0.75 - layoutedTree.children[1].x;
        // layoutedTree.children[1].shiftY = 0;
        // layoutedTree.children[2].shiftX = dim.width * 0.25 - layoutedTree.children[2].x;
        // layoutedTree.children[2].shiftY = (layoutedTree.children[2].y - layoutedTree.y) * 2.5; 
        // layoutedTree.children[3].shiftX = dim.width * 0.75 - layoutedTree.children[3].x;
        // layoutedTree.children[3].shiftY = (layoutedTree.children[2].y - layoutedTree.y) * 2.5;
        const queue = [layoutedTree];
        const res = [];
        const renderLine = [];
        let lineCount = 0;

        while (queue.length > 0) {
            const cur = queue.shift();
            if (cur.parent) {
                if (cur.parent.shiftX != null) {
                    cur.shiftX = cur.parent.shiftX;
                }
                if (cur.parent.shiftY != null) {
                    cur.shiftY = cur.parent.shiftY;
                }
            }
            res.push({ id: cur.data.id, x: cur.x + cur.shiftX, y: cur.y + cur.shiftY, shiftX: cur.shiftX, shiftY: cur.shiftY });

            if (cur.depth > 1) {
                renderLine.push(new RenderHierarchyLine({ id: lineCount++, parentNodeId: cur.parent.data.id, source: { x: cur.x + cur.shiftX, y: cur.y + cur.shiftY }, target: { x: cur.x + cur.shiftX, y: (cur.parent.y + cur.y) / 2 + cur.shiftY } }));
            }
            if (cur.data.childrenVisible) {
                if (cur.children && cur.children.length > 0) {
                    let left = cur.x;
                    let right = cur.x;
                    cur.children.forEach(child => {
                        if (child.x < left) {
                            left = child.x;
                        }
                        if (child.x > right) {
                            right = child.x;
                        }
                        queue.push(child);
                    });

                    if (!cur.data.isFake) {
                        renderLine.push(new RenderHierarchyLine({ id: lineCount++, parentNodeId: cur.data.id, source: { x: cur.x + cur.shiftX, y: cur.y + cur.shiftY }, target: { x: cur.x + cur.shiftX, y: (cur.y + cur.children[0].y) / 2 + cur.shiftY }, tag: 1 }));
                        if (cur.children.length > 1 && left < right) {
                            renderLine.push(new RenderHierarchyLine({ id: lineCount++, parentNodeId: cur.data.id, source: { x: left + cur.shiftX, y: (cur.y + cur.children[0].y) / 2 + cur.shiftY }, target: { x: right + cur.shiftX, y: (cur.y + cur.children[0].y) / 2 + cur.shiftY } }));
                        }
                    }

                }
            }
        }
        this.renderLines = renderLine;
        console.log(layoutedTree);
        return res;
    }
    updateVisibleTree() {
        const queue = [this.fakeRoot];
        let maxNodeNum = 1;
        while (queue.length > 0) {
            const cur = queue.shift();
            if (cur.childrenVisible) {
                cur.visChildren();
                const children = cur.getChildren();
                if (children.length > maxNodeNum) {
                    maxNodeNum = children.length;
                }
                children.forEach(child => {
                    queue.push(child);
                })
            }
        }
        const hierarchyRoot = d3.hierarchy(this.fakeRoot);
        const dim = this.controller.canvasController.getDim();
        if (dim.width <= maxNodeNum * 80) {
            this.treeFunc = this.treeFunc.size([dim.width - 120, dim.height - 120]).nodeSize([100, 250]);
        }
        const tree = this.treeFunc(hierarchyRoot);
        const traverseRes = this.traverseLayoutedTree(tree, dim);
        traverseRes.forEach(item => {
            if (this.idMapNode.has(item.id)) {
                this.idMapNode.get(item.id).setLocation(item.x, item.y);
            } else {
                console.log(item);
                throw new Error("node id error");
            }
        });
    }
    getVisibleNodes() {
        const nodes = [];
        const queue = [this.fakeRoot];
        while (queue.length > 0) {
            const cur = queue.shift();
            nodes.push(cur);
            if (cur.childrenVisible) {
                const children = cur.getChildren();
                children.forEach(child => {
                    queue.push(child);
                })
            }
        }
        nodes.shift();
        return nodes;
    }

    _parseElements(nodeArray) {

        this.nodeRenderMap = new Map();
        this.characterSet = new Set();
        nodeArray.forEach(node => {
            const nodeRenders = {
                iconObjs: new Array(),
                backgroundObjs: new Array(),
                textObjs: new Array(),
                markObjs: new Array(),
            }
            nodeRenders.backgroundObjs.push(new RenderHierarchyBackground(node));
            nodeRenders.iconObjs.push(new RenderHierarchyIcon(node));
            nodeRenders.markObjs.push(new RenderHierarchyMarker(node));
            const renderText = new RenderHierarchyText(node);
            this._generateCharSet(renderText.text);
            nodeRenders.textObjs.push(renderText);
            if (this.nodeRenderMap.has(node.id)) {
                console.log(node.id);
                throw new Error("replicated element id");
            }
            this.nodeRenderMap.set(node.id, nodeRenders);
        });

        this._generateRenderObjs();
        this.fitView();

    }
    _generateRenderObjs() {
        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderText: new Array(),
            renderMark: new Array(),
            charSet: null,
        }
        for (const nodeIdKey of this.nodeRenderMap.keys()) {
            const nodeRenders = this.nodeRenderMap.get(nodeIdKey);
            nodeRenders.iconObjs.forEach(iconObj => {
                this.renderObject.renderIcons.push(iconObj);
            });
            nodeRenders.backgroundObjs.forEach(backgroundObj => {
                this.renderObject.renderBackgrounds.push(backgroundObj);
            });
            nodeRenders.markObjs.forEach(markObj => {
                this.renderObject.renderMark.push(markObj);
            });
            nodeRenders.textObjs.forEach(textObj => {
                this.renderObject.renderText.push(textObj);
            });
        }
        for (let i = 0; i < this.renderLines.length; i++) {
            if (this.renderLines[i].tag === 1) {
                this.renderLines[i].updateSourcePos(this.renderObject.renderIcons[0].style.iconHeight)
            }
        }
        this.renderObject.charSet = Array.from(this.characterSet);
        this.renderObject.renderLines = this.renderLines;
        let lineStyle = {};
            this.controller.styleController.styles.forEach((d) => {
                if(d.selector == "link") {
                    lineStyle = d.style;
                }
            })
            this.renderObject.renderLines.forEach((line) => {
                //console.log(line);
                line.style = lineStyle;
                line.rebuild();
            });
        this.controller.canvasController.updateRenderObject({ renderObject: this.renderObject });

    }
    _generateCharSet(str) {
        if (str) {
            for (const s of str) {
                this.characterSet.add(s);
            }
        }
    }
    showChildren(ids) {
        if (ids && ids.length > 0) {
            ids.forEach(id => {
                if (this.idMapNode.has(id)) {
                    this.idMapNode.get(id).setChildrenVisible(true);
                }
            });
            this.updateVisibleTree();
            const visibleNodes = this.getVisibleNodes();
            this.controller.styleController.mountAllStyleToElement(visibleNodes, []);
            this._parseElements(visibleNodes);
        }
    }

    hideChildren(ids) {
        if (ids && ids.length > 0) {
            ids.forEach(id => {
                if (this.idMapNode.has(id)) {
                    if (this.idMapNode.get(id).depth == 1) {
                        this.idMapNode.get(id).setChildrenVisible(false);
                    } else if (this.idMapNode.get(id).depth == 2) {
                        this.idMapNode.get(id).setChildrenVisible(false);
                        this.idMapNode.get(id).children = null;
                    }
                    //console.log(this.idMapNode.get(id));
                }
            });
            this.updateVisibleTree();
            const visibleNodes = this.getVisibleNodes();
            this.controller.styleController.mountAllStyleToElement(visibleNodes, []);
            this._parseElements(visibleNodes);
        }
    }
    fitView() {
        const zoom = this.controller.canvasController.getZoom();
        const visibleNodes = this.getVisibleNodes();
        let sumX = 0;
        let sumY = 0;
        visibleNodes.forEach(node => {
            sumX += node.x;
            sumY += node.y;
        });
        if (visibleNodes.length > 0) {
            this.controller.canvasController.fitView({ zoom, target: [sumX / visibleNodes.length, sumY / visibleNodes.length] })
        }
    }

    /**
    * 更新指定node 的状态
    * @param {id} nodeIds 
    * @param {状态} status 
    */
    updateNodeStatus(nodeIds, status) {
        if (nodeIds && nodeIds.length > 0) {
            const idsSet = new Set();
            nodeIds.forEach((id) => {
                const node = this.idMapNode.get(id);
                if (node) {
                    node.updateStatus(status);
                } else {
                    throw new Error(`cannot find node id:${id}`)
                }
                const renderObjects = this.nodeRenderMap.get(id);
                if (renderObjects) {
                    renderObjects.iconObjs.forEach((icon) => {
                        icon.updateStatus();
                    });
                    renderObjects.textObjs.forEach((text) => {
                        text.updateStatus();
                    });
                    renderObjects.backgroundObjs.forEach((border) => {
                        border.updateStatus();
                    });
                    renderObjects.markObjs.forEach(mark => {
                        mark.updateStatus();
                        // mark.reLocation()
                    });
                }
            });

        } else {
            this.nodes.forEach(node => {
                node.setStatus(status);
            });
            this._updateNodeRenderObjStatus();
        }
        this.controller.canvasController.updateRenderObject({ style: 1 });
    }
    /**
    * 更新nodeid 对应的renderobj 的状态
    * @param {id} nodeIds 
    */
    _updateNodeRenderObjStatus(nodeIds = null) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                const renderObjects = this.nodeRenderMap.get(id);
                renderObjects.iconObjs.forEach((icon) => {
                    icon.updateStatus();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.updateStatus();
                });
                renderObjects.backgroundObjs.forEach((border) => {
                    border.updateStatus();
                });
                renderObjects.markObjs.forEach(mark => {
                    mark.updateStatus();
                    mark.reLocation();
                });
            })
        } else {
            for (const key of this.nodeRenderMap.keys()) {
                const renderObjects = this.nodeRenderMap.get(key);
                renderObjects.iconObjs.forEach((icon) => {
                    icon.updateStatus();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.updateStatus();
                });
                renderObjects.backgroundObjs.forEach((border) => {
                    border.updateStatus();
                });
                renderObjects.markObjs.forEach(mark => {
                    mark.updateStatus();
                    mark.reLocation();
                });
            }
        }
    }

    updateGrpahAfterDimMidifed() {
        this.updateVisibleTree();
        const visibleNodes = this.getVisibleNodes();
        this.controller.styleController.mountAllStyleToElement(visibleNodes, []);
        this._parseElements(visibleNodes);
    }

    getNodes(ids) {
        if (Array.isArray(ids)) {
            const tempArray = [];
            ids.forEach(id => {
                const node = this.idMapNode.get(id);
                if (node && !node.isFake && node.visible) {
                    tempArray.push(node)
                }
            });
            return tempArray;
        } else {
            return this.nodes.filter(v => {
                return !v.isFake && v.visible;
            });
        }
    }
    getSelectedNodes() {
        const resArray = [];
        this.nodes.forEach(node => {
            if (node.status === 2 && !node.isFake && node.visible) {
                resArray.push(node);
            }
        });
        return resArray;
    }
    focusOnNodes(nodeIds) {
        const viewSize = this.controller.canvasController.getDim();
        const viewFitParams = autoFocusNode(this.getNodes(nodeIds), [viewSize.width, viewSize.height]);
        this.controller.canvasController.fitView(viewFitParams);
    }

    /////////////////////////////////////////////////////////////
    /**
     * 更新style
     */
    updateStyle() {
        const newNodeArray = this.nodes;
        const newLinkArray = this.links;
        this.controller.styleController.mountStyleToElement(newNodeArray, newLinkArray);
        this.updateEntityStyle();
    }

    updateEntityStyle(params = null) {
        if (params === null) {
            const {
                renderBackgrounds,
                renderIcons,
                renderLines,
                renderText,
                renderMark,
                charSet,
            } = this.renderObject;
            renderBackgrounds.forEach((RenderBackground) => {
                RenderBackground.rebuild();
            });
            renderIcons.forEach((renderIcon) => {
                renderIcon.rebuild();
            });
            renderText.forEach((reText) => {
                reText.rebuild();
            });
            renderMark.forEach(mark => {
                mark.rebuild();
            });
            let lineStyle = {};
            this.controller.styleController.styles.forEach((d) => {
                if(d.selector == "link") {
                    lineStyle = d.style;
                }
            })
            renderLines.forEach((line) => {
                //console.log(line);
                line.style = lineStyle;
                line.rebuild();
            });
        }
        if (params && params.link) {
            if (params.linkIds && params.linkIds.length > 0) {
                params.linkIds.forEach(id => {
                    if (!this.linkRenderMap.has(id)) {
                        return;
                    }
                    const { polygonObjs, textObjs, lineObjs, dashLineObjs } = this.linkRenderMap.get(id);
                    polygonObjs.forEach((polygonObj) => {
                        polygonObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    lineObjs.forEach((lineObj) => {
                        lineObj.rebuild();
                    });
                    dashLineObjs.forEach(dashLineObj => {
                        dashLineObj.rebuild();
                    });
                    this._updateRenderObjectDashLine();

                })
            } else {
                for (const key of this.nodeRenderMap.keys()) {
                    const { polygonObjs, textObjs, lineObjs, dashLineObjs } = this.linkRenderMap.get(key);
                    polygonObjs.forEach((polygonObj) => {
                        polygonObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    lineObjs.forEach((lineObj) => {
                        lineObj.rebuild();
                    });
                    dashLineObjs.forEach(dashLineObj => {
                        dashLineObj.rebuild();
                    });
                    this._updateRenderObjectDashLine();
                }
            }
        }
        if (params && params.node) {
            if (params.nodeIds && params.nodeIds.length > 0) {
                params.nodeIds.forEach(id => {
                    if (!this.nodeRenderMap.has(id)) {
                        return;
                    }
                    const { iconObjs, backgroundObjs, textObjs, groupTextObjs, markObjs, labelObjs } = this.nodeRenderMap.get(id);
                    iconObjs.forEach((iconObj) => {
                        iconObj.rebuild();
                    });
                    backgroundObjs.forEach((borderObj) => {
                        borderObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    groupTextObjs.forEach(groupTextObj => {
                        groupTextObj.rebuild();
                    })
                    markObjs.forEach(mark => {
                        mark.rebuild();
                    })
                    labelObjs.forEach(label => {
                        label.rebuild();
                    })
                })
            } else {
                for (const key of this.nodeRenderMap.keys()) {
                    const { iconObjs, backgroundObjs, textObjs, groupTextObjs, markObjs, labelObjs } = this.nodeRenderMap.get(key);
                    iconObjs.forEach((iconObj) => {
                        iconObj.rebuild();
                    });
                    backgroundObjs.forEach((borderObj) => {
                        borderObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    groupTextObjs.forEach(groupTextObj => {
                        groupTextObj.rebuild();
                    })
                    markObjs.forEach(mark => {
                        mark.rebuild();
                    })
                    labelObjs.forEach(label => {
                        label.rebuild();
                    })
                }
            }
        }
        this.controller.canvasController.updateRenderObject({ style: 1 });

    }
    /////////////////////////////////////////////////////////////

}