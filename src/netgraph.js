import DataController from './controller/datacontroller';
import StyleController from './controller/stylecontroller';
import PositionController from './controller/positioncontroller';
import CanvasController from './controller/canvascontroller';
import ElementController from './controller/elementcontroller';
import EventController from './controller/eventcontroller';
import AnimationController from "./controller/animationcontroller"
import SuperGraph from './supergraph';
//NetGraph为暴露出组件所有的功能，用户不应使用除此类中包含的其他函数
export default class NetGraph {
    constructor(props) {

        this.props = {
            boxSelect: true,
        };

        Object.assign(this.props, props);

        const eventController=new EventController();
        const dataController = new DataController(props.data);
        const positionController = new PositionController(this,{width:props.canvasProps.containerWidth,height:props.canvasProps.containerHeight});
        positionController.setLayout(props.layout)
        const styleController = new StyleController(props.style, this.dataController);
        
        this.controller = {
            dataController,
            positionController,
            styleController,
            eventController,
            elementController: null,
            canvasController: null,
            animationController:null,
        }
        this.controller.animationController=new AnimationController(this.controller);
        const canvasController = new CanvasController({...props.canvasProps,...props.constant},eventController);
        this.controller.canvasController = canvasController;
        const elementController = new ElementController(this.controller,props.data);
        this.controller.elementController = elementController;

    }

    /**
     * 添加新的数据，[nodes:[...],links:[...]]
     * @param {用户传入的data} data 
     */
    addData(data) {
        this.controller.dataController.addData(data);
        this.controller.elementController.parseNewData('add');
    }

    /**
     * 替换所有要被渲染的数据，[nodes:[...],links:[...]]
     * @param {用来替换的新数据} data 
     */
    replaceData(data) {
        this.controller.dataController.replaceData(data);
        this.controller.elementController.parseNewData('replace');
    }

   
    reloadData() {
    }

    /**
     * 重新渲染指定id的node,null重新渲染整个布局
     * @param {要被更新的node 的id} nodeIds 
     */
    updateGraph(nodeIds = null) {

    }

    /**
     * 根据给定的ids获取node,null获取所有
     * @param {nodeid} nodeIds 
     * @returns 
     */
    getNodes(nodeIds = null) {
        return this.controller.elementController.getNodes(nodeIds);

    }
    getNode(id){
        return this.controller.elementController.getNode(id);
    }
    getIdMapNode(){
        return this.controller.elementController.idMapNode;
    }
    /**
     * 根据给定的ids获取link,null获取所有
     * @param {linkid} linkIds 
     * @returns 
     */
    getLinks(linkIds = null) {
        return this.controller.elementController.getLinks(linkIds);
    }

    /**
     * 获取所有被选中的node
     * @returns 
     */
    getSelectedNodes() {
        return this.controller.elementController.getSelectedNodes();
    }

    /**
     * 根据将指定的node设置为选中状态
     * @param {nodeid} nodeIds 
     */
    setSelectNodes(nodeIds) {
        this.controller.elementController.setSelectNodes(nodeIds);
    }
    /**
     * 根据brush的区域获取node
     * @param {{startX,startY,width,height}} brushField 
     * @returns 
     */
    brushNode(brushField){
       return this.controller.elementController.pickObject(brushField);
    }

    /**
     * 
     * @param {string} nodeId 
     */
    scrollIntoView(nodeId) {
        const node=this.controller.elementController.getNodes([nodeId])[0];
        this.controller.canvasController.scrollIntoView([node.x,node.y]);
    }

    /**
     * 添加样式
     * @param {{selecter:..,style{}}} styles 
     * @param {boolean} needRender 是否立即应用样式
     */
    addStyle(styles,needRender=true) {
        this.controller.styleController.addStyle(styles);
        if(needRender){
            this.controller.elementController.updateStyle();
        }
        
    }

    /**
     * 刷新所有样式
     */
    updateStyle(){
        this.controller.elementController.updateStyle();
    }

    /**
     * 为指定id node 添加class
     * @param {nodeId Array} nodeIds 
     * @param {class Array} classes 
     */
    addClassForNode(nodeIds,classes){
        this.controller.elementController.addClassForNode(nodeIds,classes);
    }

    /**
     * 为指定id node 删除class
     * @param {nodeId Array} nodeIds 
     * @param {class Array} classes 
     */
    removeClassForNode(nodeIds,classes){
        this.controller.elementController.removeClassForNode(nodeIds,classes);
    }

    /**
     * 为指定 id link 添加 class
     * @param {linkId Array} linkIds 
     * @param {class Array} classed 
     */
    addClassForLink(linkIds,classes){
        this.controller.elementController.addClassForLink(linkIds,classes)
    }

    /**
     * 为指定 id link 删除 class
     * @param {linkId Array} linkIds linkId
     * @param {class Array} classes classed
     */
    removeClassForLink(linkIds,classes){
        this.controller.elementController.removeClassForLink(linkIds,classes);
    }


    /**
     * 将已有的所有styles经行替换
     * @param {*} styles 
     */
    replaceStyle(styles) {
        this.controller.styleController.replaceStyle(styles);
        this.controller.elementController.reParse();
    }
    /**
     * 根据id删除node
     * @param {*} nodeIds 
     */
    removeNodes(nodeIds = null) {
        this.controller.elementController.removeNodes(nodeIds);
    }
    /**
     * 根据linkid 删除link
     * @param {id} linkIds 
     */
    removeLinks(linkIds = null) {
        this.controller.elementController.removeLinks(linkIds);
    }
    /**
     * 将指定id的node隐藏
     * @param {id} nodeIds 
     */
    hideNodes(nodeIds) {

    }
    /**
     * 获取当前的zoom level
     */
    getZoom() {
       return this.controller.canvasController.getZoom();

    }
    /**
     * 设置zoom level
     * @param {number} zoom 
     */
    setZoom(zoom) {
        this.controller.canvasController.setZoom(zoom);
    }
    /**
     * 对指定node进行布局，null所有node布局
     * @param {布局name} layoutName 
     * @param {*} nodeIds 
     */
    setNodeLayout(layoutName, nodeIds = null) {
        this.controller.positionController.setLayout(layoutName);
        this.controller.elementController.updateLayout(nodeIds);

    }
    /**
     * 为NetGraph 添加监听事件
     * @param {event name}} name 
     * @param {callback func} func 
     * @returns 
     */
    addEventListener(name,func){
        return this.controller.eventController.subscribe(name,func);
    }

    /**
     * 取消订阅事件
     * @param {event token} token 
     * @returns 
     */
    removeEventListener(token){
        return this.controller.eventController.unSubscribe(token);
    }
    /**
     * 设置是否开启group拖动功能
     * @param {bool} v 
     */
    setGroupDrag(v){
        this.controller.canvasController.setGroupDrag(v);
    }

    /**
     * 开启NetGraph 内置的brush图层
     */
    showBrushArea(){
        this.controller.canvasController.showBrushArea();
    }
    /**
     * 将所有数据导出为json格式
     * @returns string
     */
    exportData() {
        return JSON.stringify(this.props.data);
    }
    exportDataAsString() {
        return JSON.stringify(this.props.data).toString();
    }
    /**
     * 将canvas 转换为base64 
     * 
     */
    exportCanvasAsBase64(){
       return this.controller.canvasController.exportCanvasAsBase64()
    }
    /**
     * 
     * @param {Oject} size Canvas Width
     */
    updateDim(size){//netGraph
        this.controller.positionController.setCanvasCenter(size);
        const oldDim=this.controller.canvasController.getDim();
        this.controller.canvasController.updateDim(size);
        this.controller.elementController.updateGrpahAfterDimMidifed(oldDim,size);
    }
    /**
     * 锁定结点
     * @param {Array<string>} nodeIds 锁定结点的id
     */
    lockNodes(nodeIds){
        this.controller.elementController.lockNodes(nodeIds)
    }
    /**
     * 解锁结点
     * @param {Array<string>} nodesIds 要解锁的结点的id
     */
    unlockNodes(nodeIds){
        this.controller.elementController.unlockNodes(nodeIds)
    }
    /**
     * 
     * @param {Array<string>} nodeIds 
     * @param {1未选中,2选中,3隐藏,4高亮} status 
     */
    updateNodeStatus(nodeIds=null,status){
        this.controller.elementController.updateNodeStatus(nodeIds,status);
    }

    /**
     * 自适应view
     * @param {Array<string>} nodeIds 
     */
    fitView(nodeIds){
        this.controller.elementController.fitView(nodeIds);
    }

    /**
     * 用户通过指定id、颜色、域id生成对应的域
     * @param {Array<Array>} nodeIdArrays node Id 数组的数组
     * @param {Array}} colors 不同域的颜色
     * @param {String} id 域的id
     * @returns 所有域的id数组
     */
    addBubbleSet(nodeIdArrays,colors,id){

        return this.controller.elementController.addBubbleSet(nodeIdArrays,colors,id);
    }
    /**
     *  删除指定的域
     * @param {Array} ids 删除域的ids
     * @returns 目前的域的ids
     */
    removeBubbleSet(ids){
        return this.controller.elementController.removeBubbleSet(ids);
    }

    /**
     * 自动将每个域进行矩形布局
     */
    layoutBubbleSet(ids){
        if(Array.isArray(ids)){
            this.controller.elementController.layoutBubbleSet(ids);
        }else{
            this.controller.elementController.layoutBubbleSet(null);
        }
        
    }

    /**
     * 添加动画
     * @param {Array} animations 动画数组
     */
    addFlowAnimation(animations){
        this.controller.animationController.addFlowAnimation(animations);
    }

    /**
     * 根据流的id来删除动画,没有参数删除所有
     * @param {Array} flowIds 流动画id数组
     */
    removeFlowAnimation(flowIds){
        if(Array.isArray(flowIds)){
            this.controller.animationController.removeFlowAnimation(flowIds);
        }else{
            this.controller.animationController.removeFlowAnimation(null);
        }
    }

    /**
     * 暂停流动画,没有参数暂停所有
     * @param {Array} flowIds 流动画id数组
     */
    pauseFlowAnimation(flowIds){
        if(Array.isArray(flowIds)){
            this.controller.animationController.pauseFlowAnimation(flowIds);
        }else{
            this.controller.animationController.pauseFlowAnimation(null);
        }
    }

    /**
     * 根据id重新启动动画,没有参数重启所有
     * @param {Array} flowIds 流动画id数组
     */
    restartFlowAnimation(flowIds){
        if(Array.isArray(flowIds)){
            this.controller.animationController.restartFlowAnimation(flowIds);
        }else{
            this.controller.animationController.restartFlowAnimation(null);
        }
    }

    /**
     * 根据状态获取流动画的id,没有参数获取所有
     * @param {'pause','running'} status 流动画的状态
     * @returns id 数组
     */
    getFlowAnimationIdByStatus(status){
        return this.controller.animationController.getAnimationIdByStatus(status)

    }

    /**
     * 创建消融动画 
     * @param {Object} data 用户生成消融动画的数据
     */
    addFusionAnimation(data){
        if(data){
            this.controller.animationController.addFusionAnimation(data);
        }
    }

    /**
     * 替换默认url映射
     * @param {Map} defalutUrlMap 默认UrlMap
     */
    replaceDefaultUrlMap(defalutUrlMap){
        if(defalutUrlMap){
            this.controller.canvasController.replaceDefaultUrlMap(defalutUrlMap);
        }
    }

    /**
     * 
     * @param {Array} nodes 要修改样式的Node
     * @param {Objec} style 要添加的样式
     */
    updateNodeCustomStyle(nodes,style){
        if(Array.isArray(nodes)&&nodes.length>0){
            this.controller.elementController.updateNodeCustomStyle(nodes,style);
        }
    }
    /**
     * 
     * @param {Array} links 要修改的样式的Link
     * @param {Objec} style 要添加的样式
     */
    updateLinkCustomStyle(links,style){
        if(Array.isArray(links)&&links.length>0){
            this.controller.elementController.updateLinkCustomStyle(nodes,style);
        }
    }
    /**
     * 自动将视图聚焦了一组Nodes之中
     * @param {Array} ids 要聚焦的Node的数组
     */
    focusOnNodes(ids){
        if(ids&&ids.length>0){
            this.controller.elementController.focusOnNodes(ids);
        }
    }

    updateConstantParams(params){
        if(params){
            this.controller.canvasController.updateConstantParams(params)
        }
    }

    /**
     * 设置用于展开的树状数据
     * @param {Object} data
     */
    setRawData(data) {
        // const nodes = data.nodes;
        // const links = data.links;
      
        // const idToNode = Object.fromEntries(nodes.map(n => [n.id, n]));
        // const leafSet = new Set(nodes.filter(n => n.isLeaf).map(n => n.id));
      
        // // === 辅助函数：获取所有非叶子祖先节点（包括多级向上） ===
        // function getAllNonLeafAncestors(id) {
        //   const result = new Set();
        //   let current = idToNode[id];
        //   while (current && current.parent) {
        //     const parent = idToNode[current.parent];
        //     if (parent && !parent.isLeaf) {
        //       result.add(parent.id);
        //     }
        //     current = parent;
        //   }
        //   return result;
        // }
      
        // // === 辅助函数：获取最近非叶子祖先（用于叶子→最近父边） ===
        // function getClosestNonLeafAncestor(id) {
        //   let current = idToNode[id];
        //   while (current && current.parent) {
        //     const parent = idToNode[current.parent];
        //     if (parent && !parent.isLeaf) {
        //       return parent.id;
        //     }
        //     current = parent;
        //   }
        //   return null;
        // }
      
        // const syntheticLinks = [];
        // const syntheticEdgeSet = new Set();  // 避免重复添加 synthetic 高层边
        // const supportEdgeSet = new Set();    // 避免重复添加 leaf→root 辅助边
      
        // // === 遍历原始边，生成祖先传播边 ===
        // links.forEach(link => {
        //   const { source, target } = link;
      
        //   if (!leafSet.has(source) || !leafSet.has(target)) return; // 仅处理叶子间边
      
        //   const ancestorsA = getAllNonLeafAncestors(source); // a 的所有非叶子祖先
        //   const ancestorsB = getAllNonLeafAncestors(target); // b 的所有非叶子祖先
      
        //   // === 添加: a → Bi ===
        //   for (const bAncestor of ancestorsB) {
        //     const key = `${source}->${bAncestor}`;
        //     if (!supportEdgeSet.has(key)) {
        //       syntheticLinks.push({
        //         source: source,
        //         target: bAncestor,
        //         synthetic: true,
        //         // type: "leaf-to-root"
        //       });
        //       supportEdgeSet.add(key);
        //     }
        //   }
      
        //   // === 添加: Ai → b ===
        //   for (const aAncestor of ancestorsA) {
        //     const key = `${aAncestor}->${target}`;
        //     if (!supportEdgeSet.has(key)) {
        //       syntheticLinks.push({
        //         source: aAncestor,
        //         target: target,
        //         synthetic: true,
        //         // type: "root-to-leaf"
        //       });
        //       supportEdgeSet.add(key);
        //     }
        //   }
      
        //   // === 添加: Ai -- Bj ===
        //   for (const aAncestor of ancestorsA) {
        //     for (const bAncestor of ancestorsB) {
        //       if (aAncestor === bAncestor) continue; // 忽略自身连接
        //       const key = aAncestor < bAncestor ? `${aAncestor}--${bAncestor}` : `${bAncestor}--${aAncestor}`;
        //       if (!syntheticEdgeSet.has(key)) {
        //         syntheticLinks.push({
        //           source: aAncestor,
        //           target: bAncestor,
        //           synthetic: true,
        //         //   type: "highlevel"
        //         });
        //         syntheticEdgeSet.add(key);
        //       }
        //     }
        //   }
      
        //   // === （可选）添加 a → 最近祖先，最近祖先 → b 辅助方向边 ===
        //   const aRoot = getClosestNonLeafAncestor(source);
        //   const bRoot = getClosestNonLeafAncestor(target);
      
        //   if (aRoot) {
        //     const key = `${source}->${aRoot}`;
        //     if (!supportEdgeSet.has(key)) {
        //       syntheticLinks.push({
        //         source: source,
        //         target: aRoot,
        //         synthetic: true,
        //         // type: "leaf-to-root"
        //       });
        //       supportEdgeSet.add(key);
        //     }
        //   }
      
        //   if (bRoot) {
        //     const key = `${bRoot}->${target}`;
        //     if (!supportEdgeSet.has(key)) {
        //       syntheticLinks.push({
        //         source: bRoot,
        //         target: target,
        //         synthetic: true,
        //         // type: "root-to-leaf"
        //       });
        //       supportEdgeSet.add(key);
        //     }
        //   }
        // });
      
        // // === 添加树结构边（父 → 子） ===
        // nodes.forEach(node => {
        //   if (node.parent !== "") {
        //     syntheticLinks.push({
        //       source: node.parent,
        //       target: node.id,
        //       isHierarchy: true
        //     });
        //   }
        // });
      
        // // === 最终汇总所有边 ===
        // const allLinks = [...links, ...syntheticLinks];
      
        // // === 统一设置 from/to/id 属性 ===
        // allLinks.forEach((link, i) => {
        //   link.id = i;
        //   link.from = link.source;
        //   link.to = link.target;
        // });
      
        // // === 保存到控制器 ===
        // data.links = allLinks;
        // console.log(data);

        const nodes = data.nodes;
        const originalLinks = data.links; // 保留原始图结构边
        const links = [];
      
        // === 补充树结构边（父 → 子） ===
        nodes.forEach(node => {
          if (node.parent !== "") {
            links.push({
              source: node.parent,
              target: node.id,
              isHierarchy: true // 标记为树边
            });
          }
        });
      
        // === 合并原始图边 + 补充的树边
        const allLinks = [...originalLinks, ...links];
      
        // === 给所有边统一设置 id/from/to 属性
        allLinks.forEach((link, i) => {
          link.id = i;
          link.from = link.source;
          link.to = link.target;
        });
      
        // === 更新到 controller
        data.links = allLinks;
        console.log(data);

        this.controller.dataController.tree = data;
      }
      
    getRawData(){
        return this.controller.dataController.tree;
    }
}
export {SuperGraph}

