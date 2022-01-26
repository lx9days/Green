import HierarchyNode from "../model/hierarchy-node";
import * as d3 from "d3";
import RenderHierarchyLine from "../model/render-hierarchy-line";
import RenderHierarchyBackground from "../model/render-hierarchy-background";
import RenderHierarchyIcon from "../model/render-hierarchy-icon";
import RenderHierarchyMarker from "../model/render-hierarchy-marker";
import RenderHierarchyText from "../model/render-hierarchy-text";

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
            const dim=this.controller.canvasController.getDim();
            this.treeFunc = d3.tree().size([dim.width-120, dim.height-150]).separation(function (a, b) { return (a.parent == b.parent ? 1 : 2); });
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
    traverseLayoutedTree(layoutedTree) {
        const queue = [layoutedTree];
        const res = [];
        const renderLine = [];
        let lineCount = 0;

        while (queue.length > 0) {
            const cur = queue.shift();
            res.push({ id: cur.data.id, x: cur.x, y: cur.y });
            if (cur.depth > 1) {
                renderLine.push(new RenderHierarchyLine({ id: lineCount++, parentNodeId: cur.parent.data.id, source: { x: cur.x, y: cur.y }, target: { x: cur.x, y: (cur.parent.y + cur.y) / 2 } }));

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
                        renderLine.push(new RenderHierarchyLine({ id: lineCount++, parentNodeId: cur.data.id, source: { x: cur.x, y: cur.y }, target: { x: cur.x, y: (cur.y + cur.children[0].y) / 2 } }));
                        if (cur.children.length>1&&left < right) {
                            renderLine.push(new RenderHierarchyLine({ id: lineCount++, parentNodeId: cur.data.id, source: { x: left, y: (cur.y + cur.children[0].y) / 2 }, target: { x: right, y: (cur.y + cur.children[0].y) / 2 } }));
                        }
                    }

                }
            }
        }
        this.renderLines = renderLine;
        return res;
    }
    updateVisibleTree() {
        const queue = [this.fakeRoot];
        let maxNodeNum=1;
        while (queue.length > 0) {
            const cur = queue.shift();
            if (cur.childrenVisible) {
                cur.visChildren();
                const children = cur.getChildren();
                if(children.length>maxNodeNum){
                    maxNodeNum=children.length;
                }
                children.forEach(child => {
                    queue.push(child);
                })
            }
        }
        const hierarchyRoot = d3.hierarchy(this.fakeRoot);
        const dim=this.controller.canvasController.getDim();
        if(dim.width<=maxNodeNum*80){
            this.treeFunc=this.treeFunc.size([dim.width-120,dim.height-120]).nodeSize([60,120]);
        }
        const tree = this.treeFunc(hierarchyRoot);
        const traverseRes = this.traverseLayoutedTree(tree);
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
            if(this.nodeRenderMap.has(node.id)){
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
        this.renderObject.charSet = Array.from(this.characterSet);
        this.renderObject.renderLines = this.renderLines;
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
                    this.idMapNode.get(id).setChildrenVisible(false);
                }
            });
            this.updateVisibleTree();
            const visibleNodes = this.getVisibleNodes();
            this.controller.styleController.mountAllStyleToElement(visibleNodes, []);
            this._parseElements(visibleNodes);
        }
    }
    fitView(){
        const zoom=this.controller.canvasController.getZoom();
        const visibleNodes=this.getVisibleNodes();
        let sumX=0;
        let sumY=0;
        visibleNodes.forEach(node=>{
            sumX+=node.x;
            sumY+=node.y;
        });
        if(visibleNodes.length>0){
            this.controller.canvasController.fitView({zoom,target:[sumX/visibleNodes.length,sumY/visibleNodes.length]})
        }
        
    }
}