import CanvasController from "./controller/canvascontroller";
import ElementController from "./controller/elementcontroller";
import { PositionController } from "./controller/positioncontroller";
import StyleController from "./controller/stylecontroller";
import EventController from "../controller/eventcontroller";


export default class SuperGraph {
    constructor(props) {
        this.props = {};
        Object.assign(this.props, props);
        const eventController = new EventController();
        const positionController = new PositionController(this, this.props.layout,[parseInt(this.props.canvasProps.containerWidth),parseInt(this.props.canvasProps.containerHeight)]);
        const styleController = new StyleController(this.props.style);
        this.controller = {
            eventController,
            positionController,
            styleController,
            elementController: null,
            canvasController: null
        }
        const canvasController = new CanvasController({ ...props.canvasProps, ...props.constant }, eventController);
        this.controller.canvasController = canvasController;
        const elementController = new ElementController(this.controller, props.data);
        this.controller.elementController = elementController;
    }
    addData(data) {
        if (data) {
            this.controller.elementController.parseNewData(data, 'add')
        }

    }
    replaceData(data) {
        if (data) {
            this.controller.elementController.parseNewData(data, 'replace')
        }
    }

    addEventListener(name, func) {
        return this.controller.eventController.subscribe(name, func);
    }
    updateNodeStatus(ids, status) {
        this.controller.elementController.updateNodeStatus(ids, status);
    }
    removeNodes(ids) {
        this.controller.elementController.removeNodes(ids);
    }
    getNodes(ids) {
        return this.controller.elementController.getNodes(ids);

    }
    layout(name) {
        this.controller.elementController.updateLayout(name);
    }
    fitView(){
        this.controller.elementController.fitView();
    }

}