import HierarchyStyleController from "./controller/hierarchy-style-controller";
import HierarchyEventController from "./controller/hierarchy-event-controller";
import HierarchyElementController from "./controller/hierarchy-element-controller";
import HierarchyCanvasController from "./controller/hierarchy-canvas-controller";


export default class HierarchyGraph {
    constructor(props) {
        this.props = {};
        Object.assign(this.props, props);
        const eventController = new HierarchyEventController();
        const styleController = new HierarchyStyleController(this.props.style);
        this.controller = {
            eventController,
            styleController,
            elementController: null,
            canvasController: null
        }
        const canvasController = new HierarchyCanvasController({ ...props.canvasProps, ...props.constant }, eventController);
        this.controller.canvasController = canvasController;
        const elementController = new HierarchyElementController(this.controller, props.data);
        this.controller.elementController = elementController;
    }

    /**
     * 将指定的id的孩子进行展开
     * @param {Array} ids 节点id
     */
    showChildren(ids) {
        if (Array.isArray(ids) && ids.length > 0) {
            this.controller.elementController.showChildren(ids);
        }
    }
    /**
     * 将指定的id的孩子进行隐藏
     * @param {Array} ids 节点id
     */
    hideChildren(ids) {
        if (Array.isArray(ids) && ids.length > 0) {
            this.controller.elementController.hideChildren(ids);
        }
    }
    replaceData(data) {
        if (data) {
            this.controller.elementController.parseNewData(data)
        }
    }
    /**
     * 添加监听事件 
     * @param {String} name 事件名
     * @param {function}} func callback
     * @returns 
     */
    addEventListener(name, func) {
        return this.controller.eventController.subscribe(name, func);
    }
    /**
     * 
     * @param {Array} ids 要更新状态的id
     * @param {number}} status 节点的状态 1 未选中 2选中
     */
    updateNodeStatus(ids = null, status) {
        if (status === 1 || status === 2) {
            this.controller.elementController.updateNodeStatus(ids, status);
        }
    }
    /**
     * 更新视图的大小
     * @param {{width,height}} size 
     */
    updateDim(size) {
        const oldDim = this.controller.canvasController.getDim();
        this.controller.canvasController.updateDim(size);
        this.controller.elementController.updateGrpahAfterDimMidifed(oldDim, size);
    }

    /**
     * 根据传入的id 数组获取节点
     * @param {Array<string>} ids
     */
    getNodes(ids = null) {
        return this.controller.elementController.getNodes(ids);
    }

    /**
     * 获取选中的节点
     * @returns Array<Node>
     */
    getSelectedNodes() {
        return this.controller.elementController.getSelectedNodes();
    }

    /**
    * 自动将视图聚焦了一组Nodes之中
    * @param {Array} ids 要聚焦的Node的数组
    */
    focusOnNodes(ids) {
        if (ids && ids.length > 0) {
            this.controller.elementController.focusOnNodes(ids);
        }
    }



    //////////////////////////////////////////////////////////////////////

    /**
         * 添加样式
         * @param {{selecter:..,style{}}} styles 
         * @param {boolean} needRender 是否立即应用样式
         */
    addStyle(styles, needRender = true) {
        this.controller.styleController.addStyle(styles);
        if(needRender){
           this.controller.elementController.updateStyle();
        }
        
    }


    //////////////////////////////////////////////////////////////////////


}