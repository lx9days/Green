import Node from '../model/node';
import Link from '../model/link';
import RenderBorder from '../model/renderborder';
import RenderIcon from '../model/rendericon';
import RenderLine from '../model/renderline';
import RenderPolygon from '../model/renderpolygon';
import RenderText from '../model/rendertext';
/**
 * ElementController 主要用于创建Node Link并将style 挂载到 Node Link 上，然后计算 Node Link 的位置
 * 之后将Node Link 解析成为 RenderObject(canvas controller用来选的的对象);
 * 此外，ElementController 还维护 Node Link 与对应的 RenderObject 之间的映射，这样在 Node Link 发生变化
 * 后会将变化及时的作用到 RenderObject 上，并根据改变的种类来选择用何种方式对Canvas进行更新
 */
export default class ElementController {

    constructor(controller) {
        this._init(controller);
        this.parseNewData();
        this.controller.canvasController.mountElementController(this);
    }

    reParse(nodeIds = null) {
        if (!nodeIds) {
            this._parseParams('all');
        } else {
            this._parseParams('all', nodeIds);
        }

    }

    /**
     * 
     * 解析 Node Link
     */
    parseNewData() {
        this._parseParams('new');
    }

    _parseParams(flag, nodeIds) {
        if (flag === 'new') {
            const { newNodeArray, newLinkArray } = this._generateInternalEntity(this.controller.dataController.getNewData());
            this.controller.styleController.mountStyleToElement(newNodeArray, newLinkArray);
            this.controller.positionController.layout()(newNodeArray, this);
            this._parseElements(newNodeArray, newLinkArray, 'part');
        } else {
            if (!nodeIds) {
                const newNodeArray = this.nodes;
                const newLinkArray = this.links;
                this.controller.styleController.mountStyleToElement(newNodeArray, newLinkArray);
                this.controller.positionController.layout()(newNodeArray, this);
                this._parseElements(newNodeArray, newLinkArray, "all");
            } else {
                const newNodeArray = this.getNodes(nodeIds);
                const newLinkArray = this.links;
                this.controller.styleController.mountStyleToElement(newNodeArray, newLinkArray);
                this.controller.positionController.layout()(newNodeArray, this);
                this._parseElements(newNodeArray, newLinkArray, "part");
            }
        }

    }
    //初始化数据结构
    _init(controller) {
        this.nodes = new Array();
        this.links = new Array();
        this.controller = controller;
        this.idMapNode = new Map();//id Node 映射
        this.idMapLink = new Map();//id Link 映射
        this.nodeIdMapLinks = new Map();//node Id 映射与该node发生关联的所有的link
        this.nodeRenderMap = new Map();// node id 映射该node 对应的所有的 renderobj
        this.linkRenderMap = new Map();// link id 映射该link 对应的所有的 renderobj
        this.characterSet = new Set();//保存textlayer的字符

        this.renderObject = {
            renderBorders: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderText: new Array(),
            renderPolygon: new Array(),
            charSet: null
        }
    }
    _parseElements(nodeArray, linkArray, upateFlag = null) {
        if (!upateFlag || upateFlag === 'all') {
            this.nodeRenderMap = new Map();
            this.linkRenderMap = new Map();
            this.characterSet = new Set();
            this.renderObject = {
                renderBorders: new Array(),
                renderIcons: new Array(),
                renderLines: new Array(),
                renderText: new Array(),
                renderPolygon: new Array(),
                charSet: null
            }
            nodeArray.forEach((node) => {
                const nodeRenders = {
                    iconObjs: new Array(),
                    borderObjs: new Array(),
                    textObjs: new Array()
                }
                nodeRenders.borderObjs.push(new RenderBorder(node));
                nodeRenders.iconObjs.push(new RenderIcon(node));
                const renderText = new RenderText(node);
                this._generateCharSet(renderText.text);
                nodeRenders.textObjs.push(renderText);
                this.nodeRenderMap.set(node.getId(), nodeRenders);
            });

        } else {
            nodeArray.forEach((node) => {
                const nodeRenders = {
                    iconObjs: new Array(),
                    borderObjs: new Array(),
                    textObjs: new Array()
                }
                nodeRenders.borderObjs.push(new RenderBorder(node));
                nodeRenders.iconObjs.push(new RenderIcon(node));
                const renderText = new RenderText(node);
                this._generateCharSet(renderText.text);
                nodeRenders.textObjs.push(renderText);
                if (this.nodeRenderMap.has(node.getId())) {
                   
                    Object.assign(this.nodeRenderMap.get(node.getId()), nodeRenders);
                } else {

                    
                    this.nodeRenderMap.set(node.getId(), nodeRenders);
                }

            });

        }

        linkArray.forEach((link) => {
            const linkRenders = {
                polygonObjs: new Array(),
                textObjs: new Array(),
                lineObjs: new Array()
            }
            const sourceRenderBorder = this.nodeRenderMap.get(link.source.id).borderObjs[0];
            const targetRenderBorder = this.nodeRenderMap.get(link.target.id).borderObjs[0];
            const sourceOffset = {
                x: sourceRenderBorder.style.backgroundHeight / 2 + sourceRenderBorder.style.borderWidth / 2,
                y: sourceRenderBorder.style.backgroundHeight / 2 + sourceRenderBorder.style.borderWidth / 2,
                borderWidth: sourceRenderBorder.style.borderWidth
            }
            const targetOffset = {
                x: targetRenderBorder.style.backgroundHeight / 2 + targetRenderBorder.style.borderWidth / 2,
                y: targetRenderBorder.style.backgroundHeight / 2 + targetRenderBorder.style.borderWidth / 2,
                borderWidth: targetRenderBorder.style.borderWidth
            }
            const offset = { sourceOffset, targetOffset }
            
            const renderLine = new RenderLine(link, offset);
            linkRenders.lineObjs.push(renderLine);

            if (renderLine.style.sourceArrowShape !== 'none') {
                linkRenders.polygonObjs.push(new RenderPolygon(link, 'source', offset));
            }
            if (renderLine.style.targetArrowShape !== 'none') {
                linkRenders.polygonObjs.push(new RenderPolygon(link, 'target', offset));
            }

            const renderText = new RenderText(link, offset);
            this._generateCharSet(renderText.text);
            linkRenders.textObjs.push(renderText);
            this.linkRenderMap.set(link.getId(), linkRenders);
        });
        this._generateRenderObjs();
    }

    _updateRenderObjs(nodeIds) {


    }

    _generateRenderObjs() {
        this.renderObject = {
            renderBorders: new Array(),
            renderIcons: new Array(),
            renderLines: new Array(),
            renderText: new Array(),
            renderPolygon: new Array(),
            charSet: null
        }
        for (const nodeIdKey of this.nodeRenderMap.keys()) {
            const nodeRenders = this.nodeRenderMap.get(nodeIdKey);
            nodeRenders.iconObjs.forEach((iconObj) => {
                this.renderObject.renderIcons.push(iconObj);
            });
            nodeRenders.borderObjs.forEach((borderObj) => {
                this.renderObject.renderBorders.push(borderObj);
            });
            nodeRenders.textObjs.forEach((textObj) => {
                this.renderObject.renderText.push(textObj);
            });
        }
        for (const linkIdKey of this.linkRenderMap.keys()) {
            const linkRenders = this.linkRenderMap.get(linkIdKey);
            linkRenders.polygonObjs.forEach((polygonObj) => {
                this.renderObject.renderPolygon.push(polygonObj);
            });
            linkRenders.textObjs.forEach((textObj) => {
                this.renderObject.renderText.push(textObj);
            });
            linkRenders.lineObjs.forEach((lineObj) => {
                this.renderObject.renderLines.push(lineObj);
            });
        }
        this.renderObject.charSet = Array.from(this.characterSet);
        this.controller.canvasController.updateRenderObject(this.renderObject);
    }

    /**
     * 根据data生成 node link
     * @param {用户传入的data} newData 
     * @returns 
     */
    _generateInternalEntity(newData) {
        const newLinkArray = new Array();
        const newNodeArray = new Array();
        if (newData) {
            const data = newData;
            if (data.nodes && data.nodes.length > 0) {
                data.nodes.forEach((node) => {
                    const nodeEntity = new Node(node.id, node);
                    newNodeArray.push(nodeEntity);
                    this.nodes.push(nodeEntity);
                    this.idMapNode.set(nodeEntity.getId(), nodeEntity);
                });
            }
            if (data.links && data.links.length > 0) {
                data.links.forEach((link) => {
                    const linkEntity = new Link(link.id, link);
                    newLinkArray.push(linkEntity);
                    this.links.push(linkEntity);
                    if (this.idMapLink.has(linkEntity.getId())) {
                        linkEntity.id = 'a' + linkEntity.id;
                        this.idMapLink.set(linkEntity.getId(), linkEntity);
                    } else {
                        this.idMapLink.set(linkEntity.getId(), linkEntity);
                    }
                });
            }
        }

        this._addLinksToNodeIdMapLinks(newLinkArray);
        return {
            newNodeArray: newNodeArray,
            newLinkArray: newLinkArray
        }

    }

    /**
     * 生成node id 到与该node 关联的link 的map
     */
    _generateNodeIdMapLinks() {
        this.links.forEach((link) => {
            const sourceNodeId = link.source.id;
            const targetNodeId = link.target.id;
            if (this.nodeIdMapLinks.has(sourceNodeId)) {
                const sourceLinks = this.nodeIdMapLinks.get(sourceNodeId).sourceLinks;
                if (sourceLinks && sourceLinks.indexOf(link) === -1) {
                    sourceLinks.push(link);
                }
            } else {
                let tempObj = {
                    sourceLinks: new Array(),
                    targetLinks: new Array(),
                }
                tempObj.sourceLinks.push(link);
                this.nodeIdMapLinks.set(sourceNodeId, tempObj);
            }

            if (this.nodeIdMapLinks.has(targetNodeId)) {
                const targetLinks = this.nodeIdMapLinks.get(targetNodeId).targetLinks;
                if (targetLinks && targetLinks.indexOf(link) === -1) {
                    targetLinks.push(link);
                }
            } else {
                let tempObj = {
                    sourceLinks: new Array(),
                    targetLinks: new Array(),
                }
                tempObj.targetLinks.push(link);
                this.nodeIdMapLinks.set(targetNodeId, tempObj);
            }
        });
    }
    /**
     * 将最新的link 添加到map 中
     * @param {最新的link} newLinks 
     */
    _addLinksToNodeIdMapLinks(newLinks) {
        if (newLinks) {
            newLinks.forEach((link) => {
                const sourceNodeId = link.source.id;
                const targetNodeId = link.target.id;
                if (this.nodeIdMapLinks.has(sourceNodeId)) {
                    const sourceLinks = this.nodeIdMapLinks.get(sourceNodeId).sourceLinks;
                    if (sourceLinks && sourceLinks.indexOf(link) === -1) {
                        sourceLinks.push(link);
                    }
                } else {
                    let tempObj = {
                        sourceLinks: new Array(),
                        targetLinks: new Array(),
                    }
                    tempObj.sourceLinks.push(link);
                    this.nodeIdMapLinks.set(sourceNodeId, tempObj);
                }
                if (this.nodeIdMapLinks.has(targetNodeId)) {
                    const targetLinks = this.nodeIdMapLinks.get(targetNodeId).targetLinks;
                    if (targetLinks && targetLinks.indexOf(link) === -1) {
                        targetLinks.push(link);
                    }
                } else {
                    let tempObj = {
                        sourceLinks: new Array(),
                        targetLinks: new Array(),
                    }
                    tempObj.targetLinks.push(link);
                    this.nodeIdMapLinks.set(targetNodeId, tempObj);
                }
            })
        }
    }

    /**
     * 从map 中删除link
     * @param {删除的link}} deletedLinks 
     */
    _removeLinksFromNodeIdMapLinks(deletedLinks) {
        if (deletedLinks && deletedLinks.length > 0) {
            deletedLinks.forEach((link) => {
                const sourceLinks = this.nodeIdMapLinks.get(link.source.id).sourceLinks;
                const sourceIndex = sourceLinks.indexOf(link);
                if (sourceIndex >= 0) {
                    sourceLinks.splice(sourceIndex, 1);
                }
                const targetLinks = this.nodeIdMapLinks.get(link.target.id).targetLinks;
                const targetIndex = targetLinks.indexOf(link);
                if (targetIndex >= 0) {
                    targetLinks.splice(targetIndex, 1);
                }
            });
        }
    }
    /**
     * 从map 中删除node
     * @param {id} nodeIds 
     */
    _removeNodesFromNodeIdMapLinks(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                if (this.nodeIdMapLinks.has(id)) {
                    this.nodeIdMapLinks.delete(id);
                }
            })
        }
    }
    /**
     * 根据node 位置生成link 的起始位置
     */
    _generateLinkLocation() {
        const nodeLocationMap = new Map();
        this.nodes.forEach((v) => {
            nodeLocationMap.set(v.id, v);
        });
        this.links.forEach((link) => {
            const sourceNode = nodeLocationMap.get(link.source.id);
            link.setSourceLocation(sourceNode.getLocation());
            const targetNode = nodeLocationMap.get(link.target.id);
            link.setTargetLocation(targetNode.getLocation());
        });


    }

    _generateCharSet(str) {
        if (str) {
            for (const s of str) {
                this.characterSet.add(s);
            }
        }
    }
    /**
     * 更新style
     */
    updateStyle() {
        const newNodeArray = this.nodes;
        const newLinkArray = this.links;
        this.controller.styleController.mountStyleToElement(newNodeArray, newLinkArray);
        this._parseElements(newNodeArray, newLinkArray, "all");
    }

    /**
     * 对位置发生变化的node 更新其对应的 link 的位置
     * @param {id} nodeIds 
     * @returns 
     */
    updateLinkPosition(nodeIds = null) {
        let linkIdSet = new Set();
        if (nodeIds) {
            nodeIds.forEach((nodeId) => {
                const node = this.idMapNode.get(nodeId);
                if (node && this.nodeIdMapLinks.has(nodeId)) {
                    const links = this.nodeIdMapLinks.get(nodeId);
                    const sourceLinks = links.sourceLinks;
                    const targetLinks = links.targetLinks;
                    sourceLinks.forEach((sourceLink) => {
                        sourceLink.setSourceLocation(node.getLocation());
                        linkIdSet.add(sourceLink.getId());
                    });
                    targetLinks.forEach((targetLink) => {
                        targetLink.setTargetLocation(node.getLocation());
                        linkIdSet.add(targetLink.getId());
                    });
                }
            });
            return Array.from(linkIdSet);

        } else {
            this._generateLinkLocation();
        }
        return null;
    }
    /**
     * 更新renderObj的位置
     */
    updateRenderObjLocation() {
        const renderObjects = this.nodeRenderMap.get(nodeId);
        renderObjects.iconObjs.forEach((icon) => {
            icon.reLocation();
        });
        renderObjects.textObjs.forEach((text) => {
            text.reLocation();
        });
        renderObjects.borderObjs.forEach((border) => {
            border.reLocation();
        });
        const links = this.nodeIdMapLinks.get(id);
        const sourceLinks = links.sourceLinks;
        const targetLinks = links.targetLinks;
        sourceLinks.forEach((link) => {
            idsSet.add(link.getId());
        });
        targetLinks.forEach((link) => {
            idsSet.add(link.getId());
        });
        this._updateRenderLinkObjLocation(Array.from(idsSet));
    }
    /**
     * 根据id 获取 node
     * @param {id} nodeIds 
     * @returns 
     */
    getNodes(nodeIds = null) {
        if (nodeIds && nodeIds.length > 0) {
            const nodesArray = new Array();
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    nodesArray.push(this.idMapNode.get(id));
                }
            });
            return nodesArray;
        } else {
            return this.nodes;
        }
    }


    getLinks(linkIds = null) {
        if (linkIds && linkIds.length > 0) {
            const linksArray = new Array();

            linkIds.forEach((id) => {
                if (this.idMapLink.has(id)) {
                    linksArray.push(this.idMapLink.get(id));
                }
            });
            return linksArray;
        } else {
            return this.links;
        }
    }

    getGraph() {
        return {
            nodes: this.nodes,
            links: this.links
        }
    }

    getMaps() {
        return {
            idMapLink: this.idMapLink,
            idMapNode: this.idMapNode
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

    setSelectedNodes(nodeIds) {
        if (!nodeIds || nodeIds.length <= 0) {
            return;
        }

        nodeIds.forEach((id) => {
            if (this.idMapNode.has(id)) {
                this.idMapNode.get(id).setStatus(2);
            }
        });
        this.updateNodeStatus(nodeIds, 2);
        this.controller.canvasController.updateRenderObject();
    }
    /**
     * 根据node id 删除 node
     * @param {id} nodeIds 
     */
    removeNodes(nodeIds) {
        
        if (nodeIds && nodeIds.length > 0) {
            const linkIds = new Set();
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    const node = this.idMapNode.get(id);
                    const index = this.nodes.indexOf(node);
                   
                    this.nodes.splice(index, 1);
                   
                    this.idMapNode.delete(id);
                    if (this.nodeIdMapLinks.has(id)) {
                        const links = this.nodeIdMapLinks.get(id);
                        links.sourceLinks.forEach((link) => {
                            linkIds.add(link.getId());
                        });
                        links.targetLinks.forEach((link) => {
                            linkIds.add(link.getId());
                        })
                    }
                }
            });
            this._removeRenderObjectForNode(nodeIds);
            this.removeLinks(Array.from(linkIds));
            this._removeNodesFromNodeIdMapLinks(nodeIds);

        }
    }
    /**
     * 删除对应于node 的 renderobj
     * @param {id} nodeIds 
     */
    _removeRenderObjectForNode(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                const renderNode = this.nodeRenderMap.get(id);
                renderNode.iconObjs.forEach((icon) => {
                    const index = this.renderObject.renderIcons.indexOf(icon);
                    if (index >= 0) {
                        this.renderObject.renderIcons.splice(index, 1)
                    }
                });
                renderNode.borderObjs.forEach((border) => {
                    const index = this.renderObject.renderBorders.indexOf(border);
                    if (index >= 0) {
                        this.renderObject.renderBorders.splice(index, 1);
                    }
                });
                renderNode.textObjs.forEach((text) => {
                    const index = this.renderObject.renderText.indexOf(text);
                    if (index >= 0) {
                        this.renderObject.renderText.splice(index, 1);
                    }
                });
                this.nodeRenderMap.delete(id);
            });
        }
    }
    /**
     * 删除对应于link 的 renderobj
     * @param {id} linkIds 
     */
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
                    const index = this.renderObject.renderPolygon.indexOf(polygon);
                    if (index >= 0) {
                        this.renderObject.renderPolygon.splice(index, 1);
                    }
                });
                renderLink.textObjs.forEach((text) => {
                    const index = this.renderObject.renderText.indexOf(text);
                    if (index >= 0) {
                        this.renderObject.renderText.splice(index, 1);
                    }
                });
                this.linkRenderMap.delete(id);
            })
        }
    }

    /**
     * 根据范围获取node
     * @param {filed} pickField 
     * @returns 
     */
    pickObject(pickField) {
        if (pickField) {
            return this.controller.canvasController.pickObject(pickField);
        }
        return null;
    }
    //删除 link
    removeLinks(linkIds) {
        if (linkIds && linkIds.length > 0) {
            const deletedLinks = new Array();
            linkIds.forEach((id) => {
                const link = this.idMapLink.get(id);
                const index = this.links.indexOf(link);
                deletedLinks.push(link);
                this.links.splice(index, 1);
                this.idMapLink.delete(id);
            });
            this._removeRenderObjectForLink(linkIds);
            this._removeLinksFromNodeIdMapLinks(deletedLinks);
        }
        this.controller.canvasController.updateRenderObject(this.renderObject);
        
    }
    //隐藏node
    hideNodes(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    //todo
                    this.idMapNode.get(id).setStatus(3);
                    if (this.nodeIdMapLinks.has(id)) {
                        const linkObj = this.nodeIdMapLinks.get(id);

                        linkObj.sourceLinks.forEach((sourceLink) => {
                            sourceLink.setStatus(3);
                        });

                        linkObj.targetLinks.forEach((targetLink) => {
                            targetLink.setStatus(3);
                        })
                    }
                }
            })
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
            if (status === 2) {
                this.nodes.forEach((node) => {
                    node.setStatus(1);
                })
                this._updateNodeRenderObjStatus();
            }
            nodeIds.forEach((id) => {

                if (this.idMapNode.has(id)) {
                    this.idMapNode.get(id).setStatus(status);
                }

                const renderObjects = this.nodeRenderMap.get(id);
                renderObjects.iconObjs.forEach((icon) => {
                    icon.updateStatus();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.updateStatus();
                });
                renderObjects.borderObjs.forEach((border) => {
                    border.updateStatus();
                });
                if (status === 3) {
                    const links = this.nodeIdMapLinks.get(id);
                    const sourceLinks = links.sourceLinks;
                    const targetLinks = links.targetLinks;
                    sourceLinks.forEach((link) => {
                        idsSet.add(link.getId());
                    });
                    targetLinks.forEach((link) => {
                        idsSet.add(link.getId());
                    });

                }
            });
            if (status === 3) {
                this.updateLinkStatus(Array.from(idsSet), status);
            }
            this.controller.canvasController.updateRenderObject();
        }

    }
    /**
     * 更新指定link状态
     * @param {id} linkIds 
     * @param {状态} status 
     */
    updateLinkStatus(linkIds, status) {
        if (linkIds && linkIds.length > 0) {
            linkIds.forEach((id) => {
                if (this.idMapLink.has(id)) {
                    this.idMapLink.get(id).setStatus(status);
                }
                const renderObjects = this.linkRenderMap.get(id);
                renderObjects.lineObjs.forEach((line) => {
                    line.updateStatus();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.updateStatus();
                });
                renderObjects.polygonObjs.forEach((polygon) => {
                    polygon.updateStatus();
                });
            })
        }
    }
    /**
     * 更新nodeid 对应的renderobj 的状态
     * @param {id} nodeIds 
     */
    _updateNodeRenderObjStatus(nodeIds = null) {
        if (nodeIds && nodeIds.length < 0) {
            nodeIds.forEach((id) => {
                const renderObjects = this.nodeRenderMap.get(id);
                renderObjects.iconObjs.forEach((icon) => {
                    icon.updateStatus();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.updateStatus();
                });
                renderObjects.borderObjs.forEach((border) => {
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
                renderObjects.borderObjs.forEach((border) => {
                    border.updateStatus();
                });
            }
        }
    }
    /**
     * 更新link 对应的renderobj 的位置
     * @param {id} linkIds 
     */
    _updateRenderLinkObjLocation(linkIds = null) {
        if (linkIds && linkIds.length > 0) {
            linkIds.forEach((id) => {
                const renderObjects = this.linkRenderMap.get(id);
                renderObjects.lineObjs.forEach((line) => {
                    line.reLocation();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.reLocation();
                });
                renderObjects.polygonObjs.forEach((polygon) => {
                    polygon.reLocation();
                });
            })
        } else {
            const { renderLines, renderPolygon } = this.renderObject;
            renderLines.forEach((line) => {
                line.reLocation();
            });
            renderPolygon.forEach((polygon) => {

                polygon.reLocation();
            });
        }
    }
    /**
     * 更新node 对应的renderobj的位置
     * @param {id} nodeIds 
     */
    _updateRenderNodeObjLocation(nodeIds = null) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                const renderObjects = this.nodeRenderMap.get(id);
                renderObjects.borderObjs.forEach((border) => {
                    border.reLocation();
                });
                renderObjects.textObjs.forEach((text) => {
                    text.reLocation();
                });
                renderObjects.iconObjs.forEach((icon) => {
                    icon.reLocation();
                });
            })
        } else {
            const { renderText, renderIcons, renderBorders } = this.renderObject;
            renderText.forEach((text) => {
                text.reLocation();
            });
            renderIcons.forEach((icon) => {
                icon.reLocation();
            });
            renderBorders.forEach((border) => {
                border.reLocation();
            })
        }
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
            const linkIdArray = this.updateLinkPosition(nodeIds);
            this._updateRenderNodeObjLocation(nodeIds);

            this._updateRenderLinkObjLocation(linkIdArray);
            this.controller.canvasController.updateRenderObject();
        }

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
        const linkIdArray = this.updateLinkPosition(nodeIds);
        this._updateRenderNodeObjLocation(nodeIds);
        this._updateRenderLinkObjLocation(linkIdArray);
        this.controller.canvasController.updateRenderObject();
    }
    /**
     * 由于布局更新，更新renderobj 的位置
     * @param {id} nodeIds 
     */
    updateLayout(nodeIds) {
        if (nodeIds) {
            const newNodeArray = this.getNodes(nodeIds);
            const linkIds = this.controller.positionController.layout()(newNodeArray, this);
            nodeIds.forEach((id) => {
                const nodeRenders = this.nodeRenderMap.get(id);
                const { iconObjs, borderObjs, textObjs } = nodeRenders;
                iconObjs.forEach((iconObj) => {
                    iconObj.reLocation();
                });
                borderObjs.forEach((borderObj) => {
                    borderObj.reLocation();
                });
                textObjs.forEach((textObj) => {
                    textObj.reLocation();
                });
            });
            linkIds.forEach((id) => {
                const linkRenders = this.linkRenderMap.get(id);
                const { polygonObjs, textObjs, lineObjs } = linkRenders;
                polygonObjs.forEach((polygonObj) => {
                    polygonObj.reLocation();
                });
                textObjs.forEach((textObj) => {
                    textObj.reLocation();
                });
                lineObjs.forEach((lineObj) => {
                    lineObj.reLocation();
                })
            })
        } else {
            const newNodeArray = this.getNodes();
            this.controller.positionController.layout()(newNodeArray, this);
            const {
                renderBorders,
                renderIcons,
                renderLines,
                renderText,
                renderPolygon,
            } = this.renderObject;
            renderBorders.forEach((renderBorder) => {
                renderBorder.reLocation();
            });
            renderIcons.forEach((renderIcon) => {
                renderIcon.reLocation();
            });
            renderLines.forEach((renderLine) => {
                renderLine.reLocation();
            });
            renderText.forEach((reText) => {
                reText.reLocation();
            });
            renderPolygon.forEach((rePolygon) => {
                rePolygon.reLocation();
            })
        }
        this.controller.canvasController.updateRenderObject();
    }


}
