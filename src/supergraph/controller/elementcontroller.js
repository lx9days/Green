import SuperLink from "../model/superlink";
import SuperNode from "../model/supernode";
import SuperRenderBackground from "../model/superrenderbackground";
import SuperRenderIcon from "../model/superrendericon";
import SuperRenderLine from "../model/superrenderline";
import SuperRenderLinkLabel from "../model/superrenderlinklabel";
import SuperRenderNodeLabel from "../model/superrendernodelabel";
import SuperRenderPolygon from "../model/superrenderpolygon";
import SuperRenderText from "../model/superrendertext";
import { autoFitView } from "../../helper/util";

export default class ElementController {
    constructor(controller, data) {
        this._init(controller);
        this.parseNewData(data, 'new');
        this.controller.canvasController.mountElementController(this);
    }

    _init(controller) {
        this.nodes = new Array();
        this.links = new Array();
        this.controller = controller;
        this.idMapNode = new Map();
        this.idMapLink = new Map();
        this.nodeRenderMap = new Map();
        this.linkRenderMap = new Map();
        this.characterSet = new Set();
        this.labelCharacterSet=new Set();

        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderTexts: new Array(),
            renderLabels: new Array(),
            renderPolygons: new Array(),
            charSet: null,
            labelCharSet:null,
        }
    }
    parseNewData(data, flag = 'add') {
        if (flag === 'add') {
            this._parseParams(data, flag);
        } else {
            this._parseParams(data, flag);
        }
    }
    reParse(){
        this.controller.styleController.mountAllStyleToElement(this.nodes, this.links);
        this.controller.positionController.layout(this.nodes, this.links);
        this._parseElements(newNodeArray, newLinkArray,flag);
    }
    _parseParams(data, flag) {
        const { newNodeArray, newLinkArray } = this._generateInternalEntity(data, flag);
        this.controller.styleController.mountAllStyleToElement(newNodeArray, newLinkArray);
        this.controller.positionController.layout(this.nodes, this.links);
        this._parseElements(newNodeArray, newLinkArray,flag);
    }

    _generateInternalEntity(newData, flag) {
        const newLinkArray = new Array();
        const newNodeArray = new Array();

        if (newData) {
            const data = newData;
            if (data.nodes && data.nodes.length > 0) {
                if (flag === 'new' || flag === 'replace') {
                    this.nodes = [];
                }
                data.nodes.forEach(node => {
                    const nodeEntity = new SuperNode(node.id, node);
                    newNodeArray.push(nodeEntity);
                    this.nodes.push(nodeEntity);
                    this.idMapNode.set(nodeEntity.getId(), nodeEntity);
                });
            } else {
                if (flag === 'replace') {
                    this.nodes = [];
                }
            }
            if (data.links && data.links.length > 0) {
                if (flag === 'new' || flag === 'replace') {
                    this.links = [];
                }
                data.links.forEach(link => {
                    const linkEntity = new SuperLink(link.id, link);
                    if (this.idMapNode.has(linkEntity.source.id) && this.idMapNode.has(linkEntity.target.id)) {
                        newLinkArray.push(linkEntity);
                        this.links.push(linkEntity);
                        this.idMapLink.set(linkEntity.id, linkEntity);
                        const sourceNode = this.idMapNode.get(linkEntity.source.id);
                        sourceNode.addSourceLink(linkEntity);
                        linkEntity.sourceNode = sourceNode;
                        const targetNode = this.idMapNode.get(linkEntity.target.id);
                        targetNode.addTargetLink(linkEntity);
                        linkEntity.targetNode = targetNode;

                    } else {
                        throw new Error("link cannot find source or target node");
                    }
                })
            } else {
                if (flag === 'replace') {
                    this.links = [];
                }
            }
        } else {
            if (flag === 'new' || flag === 'replace') {
                this.nodes = [];
                this.links = [];
            }
        }
        return {
            newNodeArray: newNodeArray,
            newLinkArray: newLinkArray
        }
    }
    _parseElements(nodeArray, linkArray) {
        this.nodeRenderMap = new Map();
        this.linkRenderMap = new Map();
        this.characterSet = new Set();
        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderTexts: new Array(),
            renderLabels: new Array(),
            renderPolygons: new Array(),
        }
        this.nodes.forEach(node => {
            const nodeRenders = {
                iconObjs: new Array(),
                backgroundObjs: new Array(),
                textObjs: new Array(),
                labelObjs: new Array(),
            }
            nodeRenders.backgroundObjs.push(new SuperRenderBackground(node));
            nodeRenders.iconObjs.push(new SuperRenderIcon(node));
            const superNodeLabel= new SuperRenderNodeLabel(node);
            const superLinkLabel=new SuperRenderLinkLabel(node);
            this._generateLabelCharSet(superNodeLabel.text);
            this._generateLabelCharSet(superLinkLabel.text);
            nodeRenders.labelObjs.push(superNodeLabel);
            nodeRenders.labelObjs.push(superLinkLabel);
            const superRendText = new SuperRenderText(node);
            this._generateCharSet(superRendText.text);
            nodeRenders.textObjs.push(superRendText);
            this.nodeRenderMap.set(node.getId(), nodeRenders);
        });

        this.links.forEach(link => {
            const linkRenders = {
                polygonObjs: new Array(),
                textObjs: new Array(),
                lineObjs: new Array(),
            }
            const sourceRenderBackground = this.nodeRenderMap.get(link.source.id).backgroundObjs[0];
            const targetRenderBackground = this.nodeRenderMap.get(link.target.id).backgroundObjs[0];

            const sourceOffset = {
                x: sourceRenderBackground.style.backgroundWidth / 2 + sourceRenderBackground.style.borderWidth / 2,
                y: sourceRenderBackground.style.backgroundHeight / 2 + sourceRenderBackground.style.borderWidth / 2,
                width: sourceRenderBackground.style.width,
                height: sourceRenderBackground.style.height,
                borderWidth: sourceRenderBackground.style.borderWidth
            }
            const targetOffset = {
                x: targetRenderBackground.style.backgroundWidth / 2 + targetRenderBackground.style.borderWidth / 2,
                y: targetRenderBackground.style.backgroundHeight / 2 + targetRenderBackground.style.borderWidth / 2,
                width: targetRenderBackground.style.width,
                height: targetRenderBackground.style.height,
                borderWidth: targetRenderBackground.style.borderWidth
            }
            const offset = { sourceOffset, targetOffset }
            const renderLine = new SuperRenderLine(link, offset);
            linkRenders.lineObjs.push(renderLine);
            linkRenders.polygonObjs.push(new SuperRenderPolygon(link, 'target', offset));
            const superRenderText = new SuperRenderText(link, offset);
            linkRenders.textObjs.push(superRenderText);
            this._generateCharSet(superRenderText.text);
            this.linkRenderMap.set(link.getId(), linkRenders);

        });
        this._generateRenderObjs();
    }
    _generateCharSet(str) {
        if (str) {
            for (const s of str) {
                this.characterSet.add(s);
            }
        }
    }
    _generateLabelCharSet(str){
        if(str){
            for(const s of str){
                this.labelCharacterSet.add(s);
            }
        }
    }
    _generateRenderObjs() {
        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderTexts: new Array(),
            renderLabels: new Array(),
            renderPolygons: new Array(),
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
            nodeRenders.textObjs.forEach(textObj => {
                this.renderObject.renderTexts.push(textObj);
            });
            nodeRenders.labelObjs.forEach(nodeLabel=>{
                this.renderObject.renderLabels.push(nodeLabel);
            });
        }

        for (const linkIdKey of this.linkRenderMap.keys()) {
            const linkRenders = this.linkRenderMap.get(linkIdKey);
            linkRenders.polygonObjs.forEach(polygonObj => {
                this.renderObject.renderPolygons.push(polygonObj);
            });
            linkRenders.textObjs.forEach(textObj => {
                this.renderObject.renderTexts.push(textObj);
            });
            linkRenders.lineObjs.forEach(lineObj => {
                this.renderObject.renderLines.push(lineObj);
            });
        }
        this.renderObject.charSet = Array.from(this.characterSet);
        this.renderObject.labelCharSet=Array.from(this.labelCharacterSet);
        this.controller.canvasController.updateRenderObject({ renderObject: this.renderObject });
    }

    updateEntityPosition(nodeIds = null) {
        if (nodeIds) {
            const needUpdateLinks = [];
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    const node = this.idMapNode.get(id)
                    node.sourceLinks.forEach(link => {
                        needUpdateLinks.push(link)
                    })
                    node.targetLinks.forEach(link => {
                        needUpdateLinks.push(link)
                    })
                } else {
                    throw new Error("cannot find node id:" + id)
                }
                const nodeRenders = this.nodeRenderMap.get(id);
                const { iconObjs, backgroundObjs, textObjs ,labelObjs} = nodeRenders;
                iconObjs.forEach((iconObj) => {
                    iconObj.reLocation();
                });
                backgroundObjs.forEach((borderObj) => {
                    borderObj.reLocation();
                });
                textObjs.forEach((textObj) => {
                    textObj.reLocation();
                });
                labelObjs.forEach(nodeLabelObj=>{
                    nodeLabelObj.reLocation();
                });
            });
           
            needUpdateLinks.forEach(link => {
                const linkRenders = this.linkRenderMap.get(link.id);
                const { polygonObjs, textObjs, lineObjs } = linkRenders;
                polygonObjs.forEach((polygonObj) => {
                    polygonObj.reLocation();
                });
                textObjs.forEach((textObj) => {
                    textObj.reLocation();
                });
                lineObjs.forEach((lineObj) => {
                    lineObj.reLocation();
                });
            });

        } else {
            const {
                renderBackgrounds,
                renderIcons,
                renderLines,
                renderTexts,
                renderPolygons,
                renderLabels,
            } = this.renderObject;
            renderBackgrounds.forEach((RenderBackground) => {
                RenderBackground.reLocation();
            });
            renderIcons.forEach((renderIcon) => {
                renderIcon.reLocation();
            });
            renderLines.forEach((renderLine) => {
                renderLine.reLocation();
            });
            renderTexts.forEach((reText) => {
                reText.reLocation();
            });
            renderPolygons.forEach((rePolygon) => {
                rePolygon.reLocation();
            });
            renderLabels.forEach(nodeLabel=>{
                nodeLabel.reLocation();
            });
        }
        this.controller.canvasController.updateRenderObject({ position: 1 });
    }


    /**
 * 更新node 的位置
 * @param {id} nodeIds 
 * @param {增量} delta 
 */
    updateNodeLocationDelta(nodeIds, delta) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    const node = this.idMapNode.get(id);
                    node.x += delta.x;
                    node.y += delta.y;
                }
            });

            this.updateEntityPosition(nodeIds)
        }
    }

    getSelectedNodes() {
        const selectedNodeArray = new Array();

        this.nodes.forEach((node) => {
            if (node.getStatus() === 2) {
                selectedNodeArray.push(node);
            }
        });
        return selectedNodeArray;
    }


    /**
 * 更新node 位置
 * @param {id} nodeIds 
 * @param {位置} position 
 * @param {是否群组移动} isGroup 
 * @returns 
 */
    updateNodeLocation(nodeIds, position, isGroup) {
        if (!isGroup) {
            if (this.idMapNode.has(nodeIds[0])) {
                const node = this.idMapNode.get(nodeIds[0]);

                node.x = position.x;
                node.y = position.y;


            }
        } else {
            if (this.idMapNode.has(nodeIds[0])) {
                const node = this.idMapNode.get(nodeIds[0]);
                if (node.status !== 2) {
                    return;
                }
                const deltaX = position.x - node.x;
                const deltaY = position.y - node.y;
                const selectedNodes = this.getSelectedNodes();
                nodeIds = new Array();
                selectedNodes.forEach((selectedNode) => {
                    nodeIds.push(selectedNode.getId());
                    selectedNode.x += deltaX;
                    selectedNode.y += deltaY;
                });
            }
        }
        this.updateEntityPosition(nodeIds);
    }

    /**
    * 更新指定node 的状态
    * @param {id} nodeIds 
    * @param {状态} status 
    */
    updateNodeStatus(nodeIds, status) {
        if (nodeIds && nodeIds.length > 0) {
            const idsSet = new Set();
            // if (status === 2) {
            //     this.nodes.forEach((node) => {
            //         node.setStatus(1);
            //     })
            //     this._updateNodeRenderObjStatus();
            // }
            nodeIds.forEach((id) => {
                const node = this.idMapNode.get(id);
                if (node) {
                    node.setStatus(status);
                    if (status === 3) {
                        const sourceLinks = node.getSourceLinks();
                        const targetLinks = node.getTargetLinks();
                        sourceLinks.forEach(link => {
                            idsSet.set(link.getId());
                        });
                        targetLinks.forEach(link => {
                            idsSet.set(link.getId());
                        });
                    }
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
                    renderObjects.labelObjs.forEach(labelObj=>{
                        labelObj.updateStatus();
                    })
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
            }
        }
    }

    removeNodes(nodeIds, update = true) {
        if (nodeIds && nodeIds.length > 0) {
            const linkIds = new Set();
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    const node = this.idMapNode.get(id);
                    const index = this.nodes.indexOf(node);

                    this.nodes.splice(index, 1);

                    this.idMapNode.delete(id);
                    const sourceLinks = node.sourceLinks;
                    const targetLinks = node.targetLinks;
                    sourceLinks.forEach(link => {
                        linkIds.add(link.getId());
                        const targetNode = this.idMapNode.get(link.target.id);
                        if (targetNode) {
                            targetNode.removeTargetLink(link);
                        }
                    });
                    targetLinks.forEach(link => {
                        linkIds.add(link.getId());
                        const sourceNode = this.idMapNode.get(link.source.id);
                        if (sourceNode) {
                            sourceNode.removeSourceLink(link);
                        }
                    })
                }
            });
            this._removeRenderObjectForNode(nodeIds);
            if (update) {
                this.removeLinks(Array.from(linkIds));
            }
        }
    }

    _removeRenderObjectForNode(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                const renderNode = this.nodeRenderMap.get(id);
                if(!renderNode){
                    return
                }
                renderNode.iconObjs.forEach((icon) => {
                    const index = this.renderObject.renderIcons.indexOf(icon);
                    if (index >= 0) {
                        this.renderObject.renderIcons.splice(index, 1)
                    }
                });
                renderNode.backgroundObjs.forEach((border) => {
                    const index = this.renderObject.renderBackgrounds.indexOf(border);
                    if (index >= 0) {
                        this.renderObject.renderBackgrounds.splice(index, 1);
                    }
                });
                renderNode.textObjs.forEach((text) => {
                    const index = this.renderObject.renderTexts.indexOf(text);
                    if (index >= 0) {
                        this.renderObject.renderTexts.splice(index, 1);
                    }
                });
                renderNode.labelObjs.forEach(nodeLabel => {
                    const index = this.renderObject.renderLabels.indexOf(nodeLabel);
                    if (index >= 0) {
                        this.renderObject.renderLabels.splice(index, 1);
                    }
                });
                this.nodeRenderMap.delete(id);
            });
        }
    }

    removeLinks(linkIds, update = true) {
        if (linkIds && linkIds.length > 0) {
            const deletedLinks = new Array();
            linkIds.forEach((id) => {
                const link = this.idMapLink.get(id);
                if (link) {
                    const sourceNode = this.idMapNode.get(link.source.id);
                    if (sourceNode) {
                        sourceNode.removeSourceLink(link);
                    }
                    const targetNode = this.idMapNode.get(link.target.id);
                    if (targetNode) {
                        targetNode.removeTargetLink(link);
                    }
                    const index = this.links.indexOf(link);
                    deletedLinks.push(link);
                    this.links.splice(index, 1);
                    this.idMapLink.delete(id);
                }
            });
            this._removeRenderObjectForLink(deletedLinks.map(link => link.id));
        }
        if (update) {
            this.controller.canvasController.updateRenderObject({ renderObject: this.renderObject });
        }
    }

    _removeRenderObjectForLink(linkIds) {
        if (linkIds && linkIds.length > 0) {
            linkIds.forEach((id) => {
                const renderLink = this.linkRenderMap.get(id);
                renderLink.lineObjs.forEach((line) => {
                    const index = this.renderObject.renderLines.indexOf(line);
                    if (index >= 0) {
                        this.renderObject.renderLines.splice(index, 1);
                    }
                });
                renderLink.polygonObjs.forEach((polygon) => {
                    const index = this.renderObject.renderPolygons.indexOf(polygon);
                    if (index >= 0) {
                        this.renderObject.renderPolygons.splice(index, 1);
                    }
                });
                renderLink.textObjs.forEach((text) => {
                    const index = this.renderObject.renderTexts.indexOf(text);
                    if (index >= 0) {
                        this.renderObject.renderTexts.splice(index, 1);
                    }
                });
                this.linkRenderMap.delete(id);
            });
        }
    }

    updateLayout(name){
        if(name!=='vertical'&&name!=='horizontal'){
            return 
        }
        this.controller.positionController
        this.controller.positionController.layout(this.nodes, this.links,name);
        this.updateEntityPosition();
    }
    getNodes(ids){
        const nodeArray=[];
        if(ids&&ids.length>0){
            ids.forEach(id=>{
                if(this.idMapNode.has(id)){
                    nodeArray.push(this.idMapNode.get(id));
                }
            })
        }else{
            return this.nodes;
        }
    }
    getLinks(ids){
        const linkArray=[]
        if(ids&&ids.length>0){
            ids.forEach(id=>{
                if(this.idMapLink.has(id)){
                    linkArray.push(this.idMapLink.get(id));
                }
            });
        }else{
            return this.links;
        }
    }

    fitView() {
        const viewSize = this.controller.canvasController.getDim();
        const viewFitParams = autoFitView(this.getNodes(), [viewSize.width, viewSize.height]);
        this.controller.canvasController.fitView(viewFitParams);

    }

    updateGrpahAfterDimMidifed(oldDim, newDim) {
        const xFactor = newDim.width / oldDim.width;
        const yFactor = newDim.height / oldDim.height;
        const newNodeArray = this.getNodes();

        newNodeArray.forEach(node => {
            node.x = node.x * xFactor;
            node.y = node.y * yFactor;
        });
        this.updateEntityPosition()
    }

}

