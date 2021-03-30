import { Deck, COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, IconLayer, LineLayer, TextLayer, PolygonLayer } from '@deck.gl/layers';
import RoundedRectangleLayer from '../compositelayer/RoundedRectangleLayer';
import BrushCanvas from '../helper/brushCanvas';

export default class CanvasController {
    constructor(props, eventController) {
        this.props = props;

        this.boxSelecting = false;
        this.isAllowCanvasMove = false;
        this.elementController = null;
        this.renderObject = null;
        this.groupDrag = false;
        this.eventController = eventController;

        this.nodeClickHandler = this._nodeClickHandler.bind(this);
        this.nodeDragStartHandler = this._nodeDragStartHandler.bind(this);
        this.nodeDragingHandler = this._nodeDragingHandler.bind(this);
        this.nodeDragEndHandler = this._nodeDragEndHandler.bind(this);
        this.deckClickHandler = this._deckClickHandler.bind(this);
        this.deckDragStartHandler = this._deckDragStartHandler.bind(this);
        this.deckDragingHandler = this._deckDragingHandler.bind(this);
        this.deckDragEndHandler = this._deckDragEndHandler.bind(this);
        this.onViewStateChange = this._onViewStateChange.bind(this);
        this._brushInfoCallBack = this._brushInfoCallBack.bind(this);
        this._initializeCanvas();
    }

    _initializeCanvas() {
        const initViewState = {
            target: [this.props.containerWidth / 2, this.props.containerHeight / 2, 0],
            rotationX: 0,
            rotationOrbit: 0,
            zoom: this.props.zoom,
        }
        this.props.viewState = initViewState;
        this.props.initTarget = initViewState.target;
        const container = document.getElementById(this.props.container);
        this.canvas = document.createElement('canvas');
        container.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl2');
        if (this.deck) {
            this.deck = null;
        }
        
        this.deck = new Deck({
            views: new OrthographicView({
                id: 'globalView',
                x: 0,
                y: 0,
                width: this.props.containerWidth,
                height: this.props.containerHeight,
                maxZoom: this.props.maxZoom,
                minZoom: this.props.minZoom,
                controller: true,

            }),
            initialViewState: initViewState,
            onViewStateChange: this.onViewStateChange,
            gl: this.gl,
            controller: true,
            onClick: this.deckClickHandler,
            onDragStart: this.deckDragStartHandler,
            onDragEnd: this.deckDragEndHandler
        });
    }

    _onViewStateChange({ viewState, oldViewState, interactionState }) {

        if (this.isAllowCanvasMove && !this.boxSelecting) {

        } else {
            if (interactionState.isZooming) {
                this.props.zoom = viewState.zoom;
                this.updateRenderGraph();
            } else {
                viewState.target = oldViewState.target;
            }
        }
        this.props.viewState = viewState;
        this.deck.setProps({ viewState });
    }

    _deckClickHandler(info, e) {
        if (!e.leftButton) {
            if (this.props.backgroundRightClick) {
                this.props.backgroundRightClick(info, e);
            }
            return;
        }

    }

    _deckDragStartHandler(info, e) {
        this.isAllowCanvasMove = true;

    }

    _deckDragingHandler(info, e) {

    }

    _deckDragEndHandler(info, e) {
        this.isAllowCanvasMove = false;
    }

    updateRenderGraph(){
        const zoom = this.props.zoom;
        const { renderBorders, renderIcons, renderLines, renderText, renderPolygon, charSet } = this.renderObject;
        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines,
            autoHightlight: true,
            getWidth: d => d.style.lineWidth || 1,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor || [255, 255, 255, 255],
            updateTriggers:{
                getSourcePosition:d => d.sourcePosition,
                getTargetPosition: d => d.targetPosition,
            }
        });
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons,
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            autoHighlight: false,
            autoHightlightColor: [255, 0, 0],
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize * (2 ** zoom),//this 指向问题
            getColor: d => d.style.iconColor,
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
            updateTriggers:{
                getPosition:d=>{
                    return d.position;
                },
                getSize: d => d.style.iconSize * (2 ** zoom),
            }
        });

        const circleEdge = new ScatterplotLayer({
            id: 'circleedge-layer',
            data: renderBorders.filter((v) => v.shapeType === 0),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            pickable: true,
            opacity: 1,
            stroked: true,
            filled: true,
            autoHighlight: true,
            getFillColor: (d) => {
                return d.style.backgroundColor || [255, 255, 255, 255];
            },
            getRadius: (d) => {
                return d.style.backgroundHeight / 2;
            },
            getPosition: (d) => {
                return d.position;
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getLineWidth: (d) => {
                return d.style.borderWidth || 4;
            },
            getWidth: (d) => {
                return d.style.backgroundWidth;
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
            
        });



        const roundedEdge = new RoundedRectangleLayer({
            id: 'rounded',
            data: renderBorders.filter((v) => v.shapeType === 1),
            opacity: 1,
            getFillColor: (d) => {
                return d.style.backgroundColor || [255, 255, 255, 255];
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getLineWidth: (d) => {
                if (d.status === 2) {
                    return d.style.borderWidth || 4
                } else {
                    return 0;
                }
            },
            getFirstScatterPosition: (d) => {
                return d.position;
            },
            getSecondScatterPosition: (d) => {
                return [d.position[0] + d.style.backgroundWidth, d.position[1]];
            },
            getPolygon: (d) => {
                return [[d.position[0], d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] - d.style.backgroundHeight / 2], [d.position[0], d.position[1] - d.style.backgroundHeight / 2]];
            },
            getFirstPath: (d) => {
                return [[d.position[0] - d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2]];
            },
            getSecondPath: (d) => {
                return [[d.position[0] - d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2]];
            },
            getCircleRadius: (d) => {
                return d.style.backgroundHeight / 2;
            }
        })

        const textLayer = new TextLayer({
            id: 'text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderText,
            pickable: true,
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: charSet,
            getColor: (d) => d.style.textColor,
            updateTriggers:{
                getPosition:d=>{
                    return d.position;
                }
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygon,
            pickable: true,
            filled: true,
            stroked: true,
            getLineWidth: 1,
            getLineColor: d => d.style.polyonColor,
            getPolygon: d => {
                return d.polygon;
            },
            getFillColor: (d) => d.style.polygonFillColor,
            updateTriggers:{
                getPolygon:d=>{
                    return d.polygon;
                }
            }
        });
        this.deck.setProps({ layers: [lineLayer, arrowLayer, circleEdge, roundedEdge, iconLayer, textLayer] });
    }

    renderGraph() {
        const zoom = this.props.zoom;
        const { renderBorders, renderIcons, renderLines, renderText, renderPolygon, charSet } = this.renderObject;
        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines.filter(()=>true),
            autoHightlight: true,
            getWidth: d => d.style.lineWidth || 1,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor || [255, 255, 255, 255],
            updateTriggers:{
                getSourcePosition:d => d.sourcePosition,
                getTargetPosition: d => d.targetPosition,
            }
        });
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons.filter(()=>true),
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            autoHighlight: true,
            autoHightlightColor: [255, 0, 0],
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize * (2 ** zoom),//this 指向问题
            getColor: d => d.style.iconColor,
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
            updateTriggers:{
                getPosition:d=>{
                    return d.position;
                }
            }
        });

        const circleEdge = new ScatterplotLayer({
            id: 'circleedge-layer',
            data: renderBorders.filter((v) => v.shapeType === 0),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            pickable: true,
            opacity: 1,
            stroked: true,
            filled: true,
            autoHighlight: true,
            getFillColor: (d) => {
                return d.style.backgroundColor || [255, 255, 255, 255];
            },
            getRadius: (d) => {
                return d.style.backgroundHeight / 2;
            },
            getPosition: (d) => {
                return d.position;
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getLineWidth: (d) => {
                return d.style.borderWidth || 4;
            },
            getWidth: (d) => {
                return d.style.backgroundWidth;
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
            
        });



        const roundedEdge = new RoundedRectangleLayer({
            id: 'rounded',
            data: renderBorders.filter((v) => v.shapeType === 1),
            opacity: 1,
            getFillColor: (d) => {
                return d.style.backgroundColor || [255, 255, 255, 255];
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getLineWidth: (d) => {
                if (d.status === 2) {
                    return d.style.borderWidth || 4
                } else {
                    return 0;
                }
            },
            getFirstScatterPosition: (d) => {
                return d.position;
            },
            getSecondScatterPosition: (d) => {
                return [d.position[0] + d.style.backgroundWidth, d.position[1]];
            },
            getPolygon: (d) => {
                return [[d.position[0], d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] - d.style.backgroundHeight / 2], [d.position[0], d.position[1] - d.style.backgroundHeight / 2]];
            },
            getFirstPath: (d) => {
                return [[d.position[0] - d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2]];
            },
            getSecondPath: (d) => {
                return [[d.position[0] - d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2]];
            },
            getCircleRadius: (d) => {
                return d.style.backgroundHeight / 2;
            }
        })

        const textLayer = new TextLayer({
            id: 'text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderText.filter(()=>true),
            pickable: true,
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: charSet,
            getColor: (d) => d.style.textColor,
            updateTriggers:{
                getPosition:d=>{
                    return d.position;
                }
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygon.filter(()=>true),
            pickable: true,
            filled: true,
            stroked: true,
            getLineWidth: 1,
            getLineColor: d => d.style.polyonColor,
            getPolygon: d => {
                return d.polygon;
            },
            getFillColor: (d) => d.style.polygonFillColor,
            updateTriggers:{
                getPolygon:d=>{
                    return d.polygon;
                }
            }
        });
        this.deck.setProps({ layers: [lineLayer, arrowLayer, circleEdge, roundedEdge, iconLayer, textLayer] });
    }

    _nodeClickHandler(info, e) {
        if (!e.leftButton) {
            this.eventController.fire('nodeLeftClick', info, e);
            if (this.props.nodeRightClick) {
                this.props.nodeRightClick(info, e);
            }
            return true;
        }
        this.eventController.fire('nodeClick', info, e);
        if (info.object.status === 1) {
            this.elementController.updateNodeStatus([info.object.id], 2);
        } else if (info.object.status === 2) {
            this.elementController.updateNodeStatus([info.object.id], 1);
        }
        return true;
    }

    _nodeDragStartHandler(info, e) {
        this.eventController.fire('nodeDragStart', info, e);
        return true;
    }

    _nodeDragingHandler(info, e) {
        this.elementController.updateNodeLocation([info.object.id], { x: parseFloat(e.offsetCenter.x* (2 ** -this.props.zoom) + (this.props.viewState.target[0] - this.props.initTarget[0]* (2 ** -this.props.zoom))) , y: parseFloat(e.offsetCenter.y * (2 ** -this.props.zoom) + (this.props.viewState.target[1] - this.props.initTarget[1] * (2 ** -this.props.zoom))) }, this.groupDrag);
        this.eventController.fire('nodeDraging', info, e);
        return true;
    }

    _nodeDragEndHandler(info, e) {
        //this.elementController.updateNodeLocation([info.object.id], { x: parseInt(e.deltaX) * (2 ** -this.props.zoom), y: parseInt(e.deltaY) * (2 ** -this.props.zoom) });
        this.eventController.fire('nodeDragEnd', info, e);
        return true;
    }
    _nodeHoverHandler(info, e) {
        return true;
    }


    _linkClickHandler(info, e) {
        return true;
    }
    _linkHoverHandler(info, e) {
        return true;
    }

    pickObject(pickField) {
        const pickedObjects = this.deck.pickObjects({ x: pickField.startX, y: pickField.startY, width: pickField.width, height: pickField.height, layerIds: ['icon-layer'] });
        const nodeIds = new Set();
        if (pickedObjects && pickedObjects.length > 0) {
            pickedObjects.forEach((obj) => {
                nodeIds.add(obj.object.id);
            });
        }
        return Array.from(nodeIds);
    }

    setZoom(zoom) {
        if (zoom >= this.props.minZoom && zoom <= this.props.maxZoom) {
            let viewState = {
                target: this.props.viewState.target,
                rotationX: 0,
                rotationOrbit: 0,
                zoom: zoom,
            }
            this.props.zoom = zoom;
            this.deck.setProps({ viewState });
            this.renderGraph();
        }
    }

    setGroupDrag(v) {
        if (typeof v === 'boolean') {
            this.groupDrag = v;
        }
    }


    updateRenderObject(renderObject = null) {
        if (renderObject) {
            this.renderObject = renderObject;
            this.renderGraph();
        }else{
            this.updateRenderGraph();
        }
        

    }
    mountElementController(elementController) {
        this.elementController = elementController;
    }

    showBrushArea() {
        let brushProps = {
            width: this.props.containerWidth,
            height: this.props.containerHeight,
            viewState: this.props.viewState,
            container: this.props.container,
            zoom:this.props.zoom,
            eventController: this.eventController
        }

        new BrushCanvas(brushProps);
        this.eventController.subscribe('_brushend', this._brushInfoCallBack)
    }

    _brushInfoCallBack(brushInfo) {
       
       
        let nodeIds = this.pickObject(brushInfo);
        this.elementController.updateNodeStatus(nodeIds, 2);
        
        this.eventController.fire('brush', nodeIds);
        this.eventController.unSubscribeByName('_brushend');
    }



}