import { Deck, COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, IconLayer, LineLayer, TextLayer, PolygonLayer } from '@deck.gl/layers';
import hexRgb from 'hex-rgb';
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
        this.lineClickHandler = this._lineClickHandler.bind(this);
        this.deckClickHandler = this._deckClickHandler.bind(this);
        this.deckDragStartHandler = this._deckDragStartHandler.bind(this);
        this.deckDragingHandler = this._deckDragingHandler.bind(this);
        this.deckDragEndHandler = this._deckDragEndHandler.bind(this);
        this.onViewStateChange = this._onViewStateChange.bind(this);
        this._brushInfoCallBack = this._brushInfoCallBack.bind(this);
        this.lastHoverElement = null;
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
        if (!this.props.containerWidth || !this.props.containerHeight) {

            throw Error('please setup container dimension');

        }
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.props.containerWidth;
        this.canvas.height = this.props.containerHeight;
        this.canvas.addEventListener('contextmenu', (e) => {

            this.eventController.fire("canvasRightClick", [e]);
            e.preventDefault();
        })
        container.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl2');
        if (this.deck) {
            this.deck = null;
        }
        console.log(this.props.containerWidth, this.props.containerHeight);

        this.deck = new Deck({
            views: new OrthographicView({
                id: 'globalView',
                x: 0,
                y: 0,
                width: '100%',
                height: '100%',
                maxZoom: this.props.maxZoom,
                minZoom: this.props.minZoom,
                controller: true,
            }),
            width: this.props.containerWidth,
            height: this.props.containerHeight,
            initialViewState: initViewState,
            onViewStateChange: this.onViewStateChange,
            gl: this.gl,
            controller: true,
            onClick: this.deckClickHandler,
            onDragStart: this.deckDragStartHandler,
            onDragEnd: this.deckDragEndHandler,
            pickingRadius: 6,
            //getCursor:({isDragging,isHovering}) => isHovering ? 'grabbing' : 'grab'
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
        if (e.leftButton) {
            this.eventController.fire('emptyClick', [info, e]);
        }
        return true;

    }

    _deckDragStartHandler(info, e) {
        this.isAllowCanvasMove = true;

    }

    _deckDragingHandler(info, e) {

    }

    _deckDragEndHandler(info, e) {
        this.isAllowCanvasMove = false;
    }

    updateRenderGraph() {
        const zoom = this.props.zoom;
        const { renderBackgrounds, renderIcons, renderLines, renderText, renderPolygon, charSet, renderMark } = this.renderObject;
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;
        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines,
            autoHighlight: true,
            highlightColor: [lineHighlightRGB.red, lineHighlightRGB.green, lineHighlightRGB.blue, lineHighlightOpactiy * 255],
            pickable: true,
            getWidth: d => d.style.lineWidth || 2,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor || [255, 255, 255, 255],
            updateTriggers: {
                getSourcePosition: d => d.sourcePosition,
                getTargetPosition: d => d.targetPosition,
            },
            onClick: this.lineClickHandler,
        });
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons,
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize * (2 ** zoom),//this 指向问题
            getColor: d => d.style.iconColor,

            updateTriggers: {
                getPosition: d => {
                    return d.position;
                },
                getSize: d => d.style.iconSize * (2 ** zoom),
            }
        });

        const circleEdge = new ScatterplotLayer({
            id: 'circleedge-layer',
            data: renderBackgrounds.filter((v) => v.shapeType === 0),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            pickable: true,
            opacity: 1,
            stroked: true,
            filled: true,
            autoHighlight: false,
            getFillColor: (d) => {
                return d.style.backgroundColor || [255, 255, 255, 255];
            },
            getRadius: (d) => {
                return d.style.circleHeight / 2;
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
                return d.style.width;
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,

        });
        const roundedEdge = new RoundedRectangleLayer({
            id: 'rounded',
            data: renderBackgrounds.filter((v) => v.shapeType === 1),
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
        const rectBackgroundLayer = new PolygonLayer({
            id: 'rect-background-layer',
            data: renderBackgrounds.filter(v => v.shapeType === 2),
            opacity: 1,
            getFillColor: (d) => {
                if (d.status === 2) {
                    return d.style.backgroundColor || [255, 255, 255, 255]
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getPolygon: (d) => {
                return d.backgroundPolygon || [];
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor || [255, 255, 255, 255];
                } else {
                    return [255, 255, 255.0];
                }
            },
            getLineWidth: (d) => {
                if (d.status === 2) {
                    return d.style.borderWidth || 0;
                } else {
                    return 0;
                }
            },
            filled: true,
            stroked: true,
            updateTriggers: {
                getPolygon: d => {
                    return d.backgroundPolygon;
                },
                getFillColor: (d) => {
                    if (d.status === 2) {
                        return d.style.backgroundColor || [255, 255, 255, 255]
                    } else {
                        return [255, 255, 255, 0];
                    }
                },
            }
        });

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
            updateTriggers: {
                getPosition: d => {
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
            updateTriggers: {
                getPolygon: d => {
                    return d.polygon;
                }
            }
        });
        const markRGB = hexRgb(this.props.nodeHighlightColor);
        const markOpactiy = this.props.nodeHighlightOpacity;
        const markLayer = new PolygonLayer({
            id: "mark-layer",
            opacity: 1,
            data: renderMark,
            pickable: true,
            filled: true,
            stroked: false,
            autoHighlight: true,
            highlightColor: [markRGB.red, markRGB.green, markRGB.blue, markOpactiy * 255],
            getPolygon: d => d.backgroundPolygon,
            getFillColor: (d) => {
                if (d.status === 4) {
                    return d.style.highLightColor;
                } else {
                    return [255, 255, 255, 0];
                }
            },
            updateTriggers: {
                getFillColor: (d) => {
                    if (d.status === 4) {
                        return d.style.highLightColor;
                    } else {
                        return [255, 255, 255, 0];
                    }
                },
                getPolygon: d => d.backgroundPolygon,
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        })
        this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, arrowLayer, circleEdge, roundedEdge, rectBackgroundLayer, iconLayer, textLayer, markLayer] });
    }

    renderGraph() {

        const zoom = this.props.zoom;
        const { renderBackgrounds, renderIcons, renderLines, renderText, renderPolygon, charSet, renderMark } = this.renderObject;
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;
        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines.filter(() => true),
            autoHighlight: true,
            highlightColor: [lineHighlightRGB.red, lineHighlightRGB.green, lineHighlightRGB.blue, lineHighlightOpactiy * 255],
            pickable: true,
            getWidth: d => d.style.lineWidth || 2,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor || [255, 255, 255, 255],
            updateTriggers: {
                getSourcePosition: d => d.sourcePosition,
                getTargetPosition: d => d.targetPosition,
            },
            onClick: this.lineClickHandler,
        });
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons.filter(() => true),
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize * (2 ** zoom),//this 指向问题
            getColor: d => d.style.iconColor,

            updateTriggers: {
                getPosition: d => {
                    return d.position;
                }
            }
        });

        const circleEdge = new ScatterplotLayer({
            id: 'circleedge-layer',
            data: renderBackgrounds.filter((v) => v.shapeType === 0),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            pickable: true,
            opacity: 1,
            stroked: true,
            filled: true,
            autoHighlight: false,
            getFillColor: (d) => {
                return d.style.backgroundColor || [255, 255, 255, 255];
            },
            getRadius: (d) => {
                return d.style.circleHeight / 2;
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
            data: renderBackgrounds.filter((v) => v.shapeType === 1 && v.status === 1),
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

        const rectBackgroundLayer = new PolygonLayer({
            id: 'rect-background-layer',
            data: renderBackgrounds.filter(v => v.shapeType === 2),
            opacity: 1,
            getFillColor: (d) => {
                if (d.status === 2) {
                    return d.style.backgroundColor || [255, 255, 255, 255]
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getPolygon: (d) => {
                return d.backgroundPolygon || [];
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor || [255, 255, 255, 255];
                } else {
                    return [255, 255, 255.0];
                }
            },
            getLineWidth: (d) => {
                if (d.status === 2) {
                    return d.style.borderWidth || 0;
                } else {
                    return 0;
                }
            },
            filled: true,
            stroked: true,
            updateTriggers: {
                getPolygon: d => {
                    return d.backgroundPolygon;
                },
                getFillColor: (d) => {
                    if (d.status === 2) {
                        return d.style.backgroundColor || [255, 255, 255, 255]
                    } else {
                        return [255, 255, 255, 0];
                    }
                },
            }
        });


        const textLayer = new TextLayer({
            id: 'text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderText.filter(() => true),
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
            updateTriggers: {
                getPosition: d => {
                    return d.position;
                }
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygon.filter(() => true),
            pickable: true,
            filled: true,
            stroked: true,
            getLineWidth: 1,
            getLineColor: d => d.style.polyonColor,
            getPolygon: d => {
                return d.polygon;
            },
            getFillColor: (d) => d.style.polygonFillColor,
            updateTriggers: {
                getPolygon: d => {
                    return d.polygon;
                }
            }
        });
        const markRGB = hexRgb(this.props.nodeHighlightColor);
        const markOpactiy = this.props.nodeHighlightOpacity;
        const markLayer = new PolygonLayer({
            id: "mark-layer",
            opacity: 1,
            data: renderMark,
            pickable: true,
            filled: true,
            stroked: false,
            autoHighlight: true,
            highlightColor: [markRGB.red, markRGB.green, markRGB.blue, markOpactiy * 255],
            getPolygon: d => d.backgroundPolygon,
            getFillColor: (d) => {
                if (d.status === 4) {
                    return d.style.highLightColor;
                } else {
                    return [255, 255, 255, 0];
                }
            },
            updateTriggers: {
                getFillColor: (d) => {
                    if (d.status === 4) {
                        return d.style.highLightColor;
                    } else {
                        return [255, 255, 255, 0];
                    }
                },
                getPolygon: d => d.backgroundPolygon,
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        });
        this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, arrowLayer, circleEdge, roundedEdge, rectBackgroundLayer, iconLayer, textLayer, markLayer] });
    }

    _nodeClickHandler(info, e) {

        if (!e.leftButton) {
            this.eventController.fire('nodeLeftClick', [info, e]);
            if (this.props.nodeRightClick) {
                this.props.nodeRightClick(info, e);
            }
            return true;
        }
        if (e.srcEvent.ctrlKey) {
            this.eventController.fire('nodeClickWithCtrl', [info, e]);
            return true;
        }
        this.eventController.fire('nodeClick', [info, e]);
        // if (info.object.status === 1) {
        //     this.elementController.updateNodeStatus([info.object.id], 2);
        // } else if (info.object.status === 2) {
        //     this.elementController.updateNodeStatus([info.object.id], 1);
        // }
        return true;
    }

    _nodeDragStartHandler(info, e) {
        this.eventController.fire('nodeDragStart', [info, e]);
        return true;
    }

    _nodeDragingHandler(info, e) {
        this.elementController.updateNodeLocation([info.object.id], { x: parseFloat((e.offsetCenter.x-info.object.style.backgroundWidth/2) * (2 ** -this.props.zoom) + (this.props.viewState.target[0] - this.props.initTarget[0] * (2 ** -this.props.zoom))), y: parseFloat((e.offsetCenter.y-info.object.style.backgroundHeight/2) * (2 ** -this.props.zoom) + (this.props.viewState.target[1] - this.props.initTarget[1] * (2 ** -this.props.zoom))) }, this.groupDrag);
        this.eventController.fire('nodeDraging', [info, e]);
        return true;
    }

    _nodeDragEndHandler(info, e) {
        //this.elementController.updateNodeLocation([info.object.id], { x: parseInt(e.deltaX) * (2 ** -this.props.zoom), y: parseInt(e.deltaY) * (2 ** -this.props.zoom) });
        this.eventController.fire('nodeDragEnd', [info, e]);
        return true;
    }
    _nodeHoverHandler(info, e) {
        return true;
    }


    _lineClickHandler(info, e) {
        if (e.srcEvent.ctrlKey) {
            this.eventController.fire('lineClickWithCtrl', [info, e]);
            return true;
        }
        this.eventController.fire('lineClick', [info, e]);
        return true;
    }
    _lineHoverHandler(info, e) {
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
        } else {
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
            zoom: this.props.zoom,
            eventController: this.eventController
        }

        new BrushCanvas(brushProps);
        this.eventController.subscribe('_brushend', this._brushInfoCallBack)
    }

    _brushInfoCallBack(brushInfo) {


        let nodeIds = this.pickObject(brushInfo);
        //this.elementController.updateNodeStatus(nodeIds, 2);

        this.eventController.fire('brush', [nodeIds]);
        this.eventController.unSubscribeByName('_brushend');
    }

    exportCanvasAsBase64() {
        this.deck.redraw(true);
        return this.deck.canvas.toDataURL();
    }

    updateDim({ width, height }) {
        this.props.containerWidth = width;
        this.props.containerHeight = height;
        const initViewState = {
            target: [this.props.containerWidth / 2, this.props.containerHeight / 2, 0],
            rotationX: 0,
            rotationOrbit: 0,
            zoom: this.props.zoom,
        }
        this.props.viewState = initViewState;
        this.props.initTarget = initViewState.target;
        this.deck.setProps({
            width: width, height: height, viewState: this.viewState, views: new OrthographicView({
                id: 'globalView',
                x: 0,
                y: 0,
                width: '100%',
                height: '100%',
                maxZoom: this.props.maxZoom,
                minZoom: this.props.minZoom,
                controller: true,
            }),
            viewState: this.props.viewState,
        })

        this.deck.redraw(true);

    }
    getDim() {
        return {
            width: this.props.containerWidth,
            height: this.props.containerHeight,
        }
    }



}