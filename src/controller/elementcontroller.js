import Node from '../model/node';
import Link from '../model/link';
import RenderBackground from '../model/renderbackground';
import RenderIcon from '../model/rendericon';
import RenderLine from '../model/renderline';
import RenderPolygon from '../model/renderpolygon';
import RenderText from '../model/rendertext';
import RenderMark from '../model/rendermark';
import RenderLabel from '../model/renderlabel';
import { autoFitView } from '../helper/util';
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
    parseNewData(flag = null) {
        if (!flag || flag === 'replace') {
            this._parseParams('new');
        } else {
            this._parseParams('add')
        }

    }

    _parseParams(flag, nodeIds) {
        this.controller.eventController.unSubscribeByName("_updateEntityPosition")
        if (flag === 'new') {
            this._init(this.controller)
            const { newNodeArray, newLinkArray } = this._generateInternalEntity(this.controller.dataController.getNewData(), 'replace');
            this.controller.styleController.mountAllStyleToElement(newNodeArray, newLinkArray);
            this.controller.positionController.layout()(newNodeArray, newLinkArray);
            this._parseElements(newNodeArray, newLinkArray, 'all');
        } else if (flag === 'add') {
            const { newNodeArray, newLinkArray } = this._generateInternalEntity(this.controller.dataController.getNewData(), 'add');
            this.controller.styleController.mountAllStyleToElement(newNodeArray, newLinkArray);
            this.controller.positionController.layout()(newNodeArray);

            // this.updateLinkPosition(newLinkArray);
            this._parseElements(newNodeArray, newLinkArray, 'part');
        } else {
            if (!nodeIds) {
                const newNodeArray = this.nodes;
                const newLinkArray = this.links;
                this.controller.styleController.mountAllStyleToElement(newNodeArray, newLinkArray);
                //this.controller.positionController.layout()(newNodeArray, this);
                this._parseElements(newNodeArray, newLinkArray, "all");
            } else {
                const newNodeArray = this.getNodes(nodeIds);
                const newLinkArray = this.links;
                this.controller.styleController.mountAllStyleToElement(newNodeArray, newLinkArray);
                //this.controller.positionController.layout()(newNodeArray, this);
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
        //this.nodeIdMapLinks = new Map();//node Id 映射与该node发生关联的所有的link
        this.nodeRenderMap = new Map();// node id 映射该node 对应的所有的 renderobj
        this.linkRenderMap = new Map();// link id 映射该link 对应的所有的 renderobj
        this.characterSet = new Set();//保存textlayer的字符

        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLabels: new Array(),
            renderLines: new Array(),
            renderText: new Array(),
            renderPolygon: new Array(),
            renderMark: new Array(),
            charSet: null
        }
    }
    _parseElements(nodeArray, linkArray, upateFlag = null) {
        if (!upateFlag || upateFlag === 'all') {
            this.nodeRenderMap = new Map();
            this.linkRenderMap = new Map();
            this.characterSet = new Set();
            this.renderObject = {
                renderBackgrounds: new Array(),
                renderIcons: new Array(),
                renderLabels: new Array(),
                renderLines: new Array(),
                renderText: new Array(),
                renderPolygon: new Array(),
                renderMark: new Array(),
                charSet: null
            }
            nodeArray.forEach((node) => {
                const nodeRenders = {
                    iconObjs: new Array(),
                    backgroundObjs: new Array(),
                    textObjs: new Array(),
                    markObjs: new Array(),
                    labelObjs: new Array(),
                }
                nodeRenders.backgroundObjs.push(new RenderBackground(node));
                nodeRenders.iconObjs.push(new RenderIcon(node));
                nodeRenders.markObjs.push(new RenderMark(node));
                const renderText = new RenderText(node);
                if (node.isLocked) {
                    nodeRenders.labelObjs.push(new RenderLabel(node))
                }
                this._generateCharSet(renderText.text);
                nodeRenders.textObjs.push(renderText);
                this.nodeRenderMap.set(node.getId(), nodeRenders);
            });

        } else {
            nodeArray.forEach((node) => {
                const nodeRenders = {
                    iconObjs: new Array(),
                    backgroundObjs: new Array(),
                    textObjs: new Array(),
                    markObjs: new Array(),
                    labelObjs: new Array(),
                }
                nodeRenders.backgroundObjs.push(new RenderBackground(node));
                nodeRenders.iconObjs.push(new RenderIcon(node));
                nodeRenders.markObjs.push(new RenderMark(node))
                if (node.isLocked) {
                    nodeRenders.labelObjs.push(new RenderLabel(node))
                }
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

            const renderLine = new RenderLine(link, offset);
            linkRenders.lineObjs.push(renderLine);

            if (renderLine.style.direct) {
                linkRenders.polygonObjs.push(new RenderPolygon(link, 'target', offset));
            } else {
                linkRenders.polygonObjs.push(new RenderPolygon(link, 'target', offset));
                linkRenders.polygonObjs.push(new RenderPolygon(link, 'source', offset));
            }

            const renderText = new RenderText(link, offset);
            this._generateCharSet(renderText.text);
            linkRenders.textObjs.push(renderText);
            this.linkRenderMap.set(link.getId(), linkRenders);
        });
        this._generateRenderObjs();
    }


    _generateRenderObjs() {
        this.renderObject = {
            renderBackgrounds: new Array(),
            renderIcons: new Array(),
            renderLabels: new Array(),
            renderLines: new Array(),
            renderText: new Array(),
            renderPolygon: new Array(),
            renderMark: new Array(),
            charSet: null
        }
        for (const nodeIdKey of this.nodeRenderMap.keys()) {
            const nodeRenders = this.nodeRenderMap.get(nodeIdKey);
            nodeRenders.iconObjs.forEach((iconObj) => {
                this.renderObject.renderIcons.push(iconObj);
            });
            nodeRenders.backgroundObjs.forEach((borderObj) => {
                this.renderObject.renderBackgrounds.push(borderObj);
            });
            nodeRenders.textObjs.forEach((textObj) => {
                this.renderObject.renderText.push(textObj);
            });
            nodeRenders.markObjs.forEach(markObj => {
                this.renderObject.renderMark.push(markObj);
            })
            nodeRenders.labelObjs.forEach(labelObj => {
                this.renderObject.renderLabels.push(labelObj);
            })
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
        this.controller.eventController.subscribe("_updateEntityPosition", (nodeIds,layout) => {
            this.updateEntityPosition(nodeIds,layout)
        });
        this.controller.eventController.subscribe("_fitView",(nodeIds=null)=>{
            this.fitView(nodeIds);
        });
        this.controller.eventController.fire("_fitView",[null]);
       
    }

    /**
     * 根据data生成 node link
     * @param {用户传入的data} newData 
     * @returns 
     */
    _generateInternalEntity(newData, flag) {
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
            } else {
                if (flag === 'replace') {
                    this.nodes = [];
                }

            }
            if (data.links && data.links.length > 0) {
                data.links.forEach((link) => {
                    const linkEntity = new Link(link.id, link);
                    if (this.idMapNode.has(linkEntity.source.id) && this.idMapNode.has(linkEntity.target.id)) {
                        newLinkArray.push(linkEntity);
                        this.links.push(linkEntity);
                        this.idMapLink.set(linkEntity.id, linkEntity);
                        const sourceNode = this.idMapNode.get(linkEntity.source.id);
                        sourceNode.addSourceLink(linkEntity);
                        linkEntity.sourceNode = sourceNode;
                        const targetNode = this.idMapNode.get(linkEntity.target.id);
                        targetNode.addTargetLink(linkEntity);
                        linkEntity.targetNode = targetNode
                    } else {
                        throw new Error(`link cannot find soure or target node`);
                    }
                });
            } else {
                if (flag === 'replace') {
                    this.links = [];
                }
            }
        } else {
            this.nodes = [];
            this.links = [];
        }
        return {
            newNodeArray: newNodeArray,
            newLinkArray: newLinkArray
        }

    }

    /**
     * 根据node 位置生成link 的起始位置
     */
    _updateAllLinkLocation() {

        if (this.nodes && this.nodes.length > 0) {
            this.nodes.forEach((node) => {
                if (node.sourceLinks && node.sourceLinks.length > 0) {
                    node.sourceLinks.forEach((link) => {
                        link.setSourceLocation(node.getLocation());
                    });
                }
                if (node.targetLinks && node.targetLinks.length > 0) {
                    node.targetLinks.forEach(link => {
                        link.setTargetLocation(node.getLocation());
                    })
                }
            })
        }
        if (this.links && this.links.length > 0) {
            return this.links.map(link => link.getId())
        }
        return null;
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
        this.updateEntityStyle();
    }

    addClassForNode(nodeIds, classes) {
        if (nodeIds && classes) {
            nodeIds.forEach(id => {
                const node = this.idMapNode.get(id);
                if (node && classes.length > 0) {
                    node.classes = [...node.classes, ...classes];
                }
            })
        }
        this.controller.styleController.mountAllStyleToElement(this.getNodes(nodeIds), []);
        this.updateEntityStyle({node:true,nodeIds})

    }

    removeClassForNode(nodeIds, classes) {
        if (nodeIds && nodeIds.length > 0 && classes) {
            nodeIds.forEach(id => {
                const node = this.idMapNode.get(id);
                if (node && classes.length > 0) {
                    node.removeClasses(classes);
                }
            })
        }
        this.controller.styleController.mountAllStyleToElement(this.getNodes(nodeIds), []);
        this.updateEntityStyle({node:true,nodeIds})
    }
    addClassForLink(linkIds, classes) {
        if (linkIds && classes) {
            linkIds.forEach(id => {
                const link = this.idMapLink.get(id);
                if (link && classes.length > 0) {
                    link.classes = [...link.classes, ...classes];
                }
            })
        }
        this.controller.styleController.mountAllStyleToElement([], this.getLinks(linkIds));
        this.updateEntityStyle({link:true,linkIds})
    }

    removeClassForLink(linkIds, classes) {
        if (linkIds && classes) {
            linkIds.forEach(id => {
                const link = this.idMapLink.get(id);
                if (link && classes.length > 0) {
                    link.removeClasses(classes);
                }
            })
        }
        this.controller.styleController.mountAllStyleToElement([], this.getLinks(linkIds));
        this.updateEntityStyle({link:true,linkIds})
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
            if (node.getStatus() === 2||node.getStatus===4) {
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
            this.removeLinks(Array.from(linkIds));

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
                renderNode.backgroundObjs.forEach((border) => {
                    const index = this.renderObject.renderBackgrounds.indexOf(border);
                    if (index >= 0) {
                        this.renderObject.renderBackgrounds.splice(index, 1);
                    }
                });
                renderNode.textObjs.forEach((text) => {
                    const index = this.renderObject.renderText.indexOf(text);
                    if (index >= 0) {
                        this.renderObject.renderText.splice(index, 1);
                    }
                });
                renderNode.markObjs.forEach(mark => {
                    const index = this.renderObject.renderMark.indexOf(mark);
                    if (index >= 0) {
                        this.renderObject.renderMark.splice(index, 1);
                    }
                })
                renderNode.labelObjs.forEach(label => {
                    const index = this.renderObject.renderLabels.indexOf(label);
                    if (index >= 0) {
                        this.renderObject.renderLabels.splice(index, 1);
                    }
                })
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
            });
            this._removeRenderObjectForLink(linkIds);
        }
        this.controller.canvasController.updateRenderObject(this.renderObject);

    }
    //隐藏node
    hideNodes(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            nodeIds.forEach((id) => {
                if (this.idMapNode.has(id)) {
                    //todo
                    const node = this.idMapNode.get(id);
                    if (node) {
                        node.setStatus(3);
                        node.sourceLinks.forEach(link => {
                            link.setStatus(3);
                        });
                        node.targetLinks.forEach(link => {
                            link.setStatus(3);
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
                    renderObjects.markObjs.forEach(mark => {
                        mark.updateStatus();
                    })
                    renderObjects.labelObjs.forEach(label => {
                        label.updateStatus();
                    })
                }
            });
            if (status === 3) {
                this.updateLinkStatus(Array.from(idsSet), status);
            }
        } else {
            this.nodes.forEach(node => {
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
            });
            this._updateNodeRenderObjStatus();
            if (status === 3) {
                this.updateLinkStatus(Array.from(idsSet), status);
            }
        }
        this.controller.canvasController.updateRenderObject();

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
                });
                renderObjects.labelObjs.forEach(label => {
                    label.updateStatus()
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
                });
                renderObjects.labelObjs.forEach(label => {
                    label.updateStatus()
                });
            }
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
            this.updateEntityPosition(nodeIds)
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
        this.updateEntityPosition(nodeIds)
    }
    /**
     * 由于布局更新，更新renderobj 的位置
     * @param {id} nodeIds 
     */
    updateLayout(nodeIds) {
        const newNodeArray = this.getNodes(nodeIds);
        if (nodeIds) {
            this.controller.positionController.layout()(newNodeArray);
        } else {
            this.controller.positionController.layout()(newNodeArray);
        }
        
        //  this.updateEntityPosition(nodeIds);
    }


    updateEntityStyle(params = null) {
        if (params === null) {
            const {
                renderBackgrounds,
                renderIcons,
                renderLines,
                renderText,
                renderPolygon,
                renderMark,
                renderLabels
            } = this.renderObject;
            renderBackgrounds.forEach((RenderBackground) => {
                RenderBackground.rebuild();
            });
            renderIcons.forEach((renderIcon) => {
                renderIcon.rebuild();
            });
            renderLines.forEach((renderLine) => {
                renderLine.rebuild();
            });
            renderText.forEach((reText) => {
                reText.rebuild();
            });
            renderPolygon.forEach((rePolygon) => {
                rePolygon.rebuild();
            })
            renderMark.forEach(mark => {
                mark.rebuild();
            });
            renderLabels.forEach(label => {
                label.rebuild();
            });
           
        }
        if(params&&params.link){
            if(params.linkIds&&params.linkIds.length>0){
                params.linkIds.forEach(id=>{
                    if(!this.linkRenderMap.has(id)){
                        return;
                    }
                    const { polygonObjs, textObjs, lineObjs } = this.linkRenderMap.get(id);
                    polygonObjs.forEach((polygonObj) => {
                        polygonObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    lineObjs.forEach((lineObj) => {
                        lineObj.rebuild();
                    })
                })
            }else{
                for( const key of this.nodeRenderMap.keys()){
                    const { polygonObjs, textObjs, lineObjs } = this.linkRenderMap.get(key);
                    polygonObjs.forEach((polygonObj) => {
                        polygonObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    lineObjs.forEach((lineObj) => {
                        lineObj.rebuild();
                    })
                }
            }
        }
        if(params&&params.node){
            if(params.nodeIds&&params.nodeIds.length>0){
                params.nodeIds.forEach(id=>{
                    if(!this.nodeRenderMap.has(id)){
                        return;
                    }
                    const {iconObjs,backgroundObjs,textObjs,markObjs,labelObjs}=this.nodeRenderMap.get(id);
                    iconObjs.forEach((iconObj) => {
                        iconObj.rebuild();
                    });
                    backgroundObjs.forEach((borderObj) => {
                        borderObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    markObjs.forEach(mark => {
                        mark.rebuild();
                    })
                    labelObjs.forEach(label => {
                        label.rebuild();
                    })
                })
            }else{
                for( const key of this.nodeRenderMap.keys()){
                    const {iconObjs,backgroundObjs,textObjs,markObjs,labelObjs}=this.nodeRenderMap.get(key);
                    iconObjs.forEach((iconObj) => {
                        iconObj.rebuild();
                    });
                    backgroundObjs.forEach((borderObj) => {
                        borderObj.rebuild();
                    });
                    textObjs.forEach((textObj) => {
                        textObj.rebuild();
                    });
                    markObjs.forEach(mark => {
                        mark.rebuild();
                    })
                    labelObjs.forEach(label => {
                        label.rebuild();
                    })
                }
            }
        }
        this.controller.canvasController.updateRenderObject();

    }

    fitView(nodeIds){
        const viewSize=this.controller.canvasController.getDim();
        const viewFitParams=autoFitView(this.getNodes(nodeIds),[viewSize.width,viewSize.height]);
        this.controller.canvasController.fitView(viewFitParams);

    }


    updateEntityPosition(nodeIds = null,layout=false) {
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
                const { iconObjs, backgroundObjs, textObjs, markObjs, labelObjs } = nodeRenders;
                iconObjs.forEach((iconObj) => {
                    iconObj.reLocation();
                });
                backgroundObjs.forEach((borderObj) => {
                    borderObj.reLocation();
                });
                textObjs.forEach((textObj) => {
                    textObj.reLocation();
                });
                markObjs.forEach(mark => {
                    mark.reLocation();
                })
                labelObjs.forEach(label => {
                    label.reLocation();
                })
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
                })
            })
        } else {
            const {
                renderBackgrounds,
                renderIcons,
                renderLines,
                renderText,
                renderPolygon,
                renderMark,
                renderLabels
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
            renderText.forEach((reText) => {
                reText.reLocation();
            });
            renderPolygon.forEach((rePolygon) => {
                rePolygon.reLocation();
            })
            renderMark.forEach(mark => {
                mark.reLocation();
            });
            renderLabels.forEach(label => {
                label.reLocation();
            });
        }
        if(!layout){
            this.controller.canvasController.updateRenderObject();
        }else{
            console.log("fit")
            this.fitView(nodeIds)
        }
        
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

    lockNodes(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            for (let i = 0; i < nodeIds.length; i++) {
                const id = nodeIds[i];
                if (this.idMapNode.has(id)) {
                    const node = this.idMapNode.get(id);
                    if (node.isLocked) {
                        continue;
                    }
                    node.lock()
                    const nodeLabel = new RenderLabel(node);
                    const { labelObjs } = this.nodeRenderMap.get(id)
                    labelObjs.push(nodeLabel);
                    this.renderObject.renderLabels.push(nodeLabel);
                }
            }

            this.controller.canvasController.updateLockNode(this.renderObject);
        }

    }

    unlockNodes(nodeIds) {
        if (nodeIds && nodeIds.length > 0) {
            for (let i = 0; i < nodeIds.length; i++) {
                const id = nodeIds[i];
                if (this.idMapNode.has(id)) {
                    const node = this.idMapNode.get(id);
                    if (!node.isLocked) {
                        continue;
                    }
                    node.unlock();
                    const { labelObjs } = this.nodeRenderMap.get(id);
                    labelObjs.forEach((label, i) => {
                        if (label.id === id) {
                            labelObjs.splice(i, 1);
                        }
                    });
                    this.renderObject.renderLabels.forEach((label, i) => {
                        if (label.id === id) {
                            this.renderObject.renderLabels.splice(i, 1);
                        }
                    })
                }
            }

            this.controller.canvasController.updateLockNode(this.renderObject);
        }
    }

}
