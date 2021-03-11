import DataController from './controller/datacontroller';
import StyleController from './controller/stylecontroller';
import PositionController from './controller/positioncontroller';
import CanvasController from './controller/canvascontroller';
import ElementController from './controller/elementcontroller';
import EventController from './controller/eventcontroller';


export default class NetGraph {
    constructor(props) {

        this.props = {
            boxSelect: true,
        };

        Object.assign(this.props, props);

        const eventController=new EventController();
        const dataController = new DataController(props.data);
        const positionController = new PositionController(this);
        const styleController = new StyleController(props.style, this.dataController);
        this.controller = {
            dataController,
            positionController,
            styleController,
            eventController,
            elementController: null,
            canvasController: null
        }
        const canvasController = new CanvasController(this.props.canvasProps,eventController);
        this.controller.canvasController = canvasController;
        const elementController = new ElementController(this.controller);
        this.controller.elementController = elementController;

    }

    addData(data) {
        this.controller.dataController.addData(data);
        this.controller.elementController.parseNewData();

    }

    replaceData(data) {
        this.controller.dataController.replaceData(data);
        this.controller.elementController.reParse();
    }

    reloadData() {
    }

    updateGraph(nodeIds = null) {

    }

    getNodes(nodeIds = null) {
        return this.controller.elementController.getNodes(nodeIds);

    }
    getLinks(linkIds = null) {
        return this.controller.elementController.getLinks(linkIds);
    }

    getSelectedNodes() {
        return this.controller.elementController.getSelectedNodes();

    }

    setSelectNodes(nodeIds) {
        this.controller.elementController.setSelectNodes(nodeIds);
    }

    brushNode(brushField){
       return this.controller.elementController.pickObject(brushField);
    }

    scrollIntoView(nodeIds = null) {

    }

    addStyle(styles) {
        this.controller.styleController.addStyle(styles);
        this.controller.elementController.updateStyle();
    }

    replaceStyle(styles) {
        this.controller.styleController.replaceStyle(styles);
        this.controller.elementController.reParse();
    }

    removeNodes(nodeIds = null) {
        this.controller.elementController.removeNodes(nodeIds);
    }

    removeLinks(linkIds = null) {
        this.controller.elementController.removeLinks(linkIds);
    }

    hideNodes(nodeIds) {

    }

    getZoom() {
        this.controller.canvasController.getZoom();

    }

    setZoom(zoom) {
        this.controller.canvasController.setZoom(zoom);
    }

    setNodeLayout(layoutName, nodeIds = null) {
        this.controller.positionController.setLayout(layoutName);
        this.controller.elementController.updateLayout(nodeIds);

    }

    addEventListener(name,func){
        return this.controller.eventController.subscribe(name,func);
    }

    removeEventListener(token){
        return this.controller.eventController.unSubscribe(token);
    }

    setGroupDrag(v){
        this.controller.canvasController.setGroupDrag(v);
    }

    showBrushArea(){
        this.controller.canvasController.showBrushArea();
    }


    exportData() {
        return JSON.stringify(this.props.data);
    }

    exportDataAsString() {
        return JSON.stringify(this.props.data).toString();
    }
}
