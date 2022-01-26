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
    showChildren(ids){
        if(Array.isArray(ids)&&ids.length>0){
            this.controller.elementController.showChildren(ids);
        }
    }
    hideChildren(ids){
        if(Array.isArray(ids)&&ids.length>0){
            this.controller.elementController.hideChildren(ids);
        }
    }
    replaceData(data) {
        if (data) {
            this.controller.elementController.parseNewData(data)
        }
    }

    addEventListener(name, func) {
        return this.controller.eventController.subscribe(name, func);
    }
   
    // fitView() {
    //     this.controller.elementController.fitView();
    // }
    // updateDim(size) {
    //     this.controller.positionController.updateViewSize(size);
    //     const oldDim = this.controller.canvasController.getDim();
    //     this.controller.canvasController.updateDim(size);
    //     this.controller.elementController.updateGrpahAfterDimMidifed(oldDim, size);
    // }

    // /**
    // * 将已有的所有styles经行替换
    // * @param {*} styles 
    // */
    // replaceStyle(styles) {
    //     this.controller.styleController.replaceStyle(styles);
    //     this.controller.elementController.reParse();
    // }

}