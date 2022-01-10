import { Deck, COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, IconLayer, LineLayer, TextLayer, PolygonLayer, SolidPolygonLayer } from '@deck.gl/layers';
import hexRgb from 'hex-rgb';

// const COlOR={
//     color1:[125,56,45],
//     colorRed:[255,0,0]
//     colorBlue
// }
const ICONDIM = 60;
export default class CanvasController {
    constructor(props, eventController) {
        this.props = props;

        this.boxSelecting = false;
        this.isAllowCanvasMove = false;
        this.elementController = null;
        this.renderObject = null;
        this.dragDoune = null;

        this.updateFlag = {
            position: 0,
            style: 0,
            icon: 0,
            iconTimer: null,
        }

        this.invalidIncons = new Map();

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
        this.onIconErrorHander = this._iconErrorHander.bind(this);
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
        this.canvas.addEventListener('mousedown', e => {
            this.eventController.fire("canvasMouseDown", [e])
            e.preventDefault();
        })
        this.canvas.addEventListener('mouseup', e => {
            this.eventController.fire("canvasMouseUp", [e])
            e.preventDefault();
        })
        this.canvas.addEventListener('mousemove', e => {
            this.eventController.fire('canvasMouseMove', [e]);
            e.preventDefault();
        })
        container.appendChild(this.canvas);
        this.gl = this.canvas.getContext('webgl2');
        if (this.deck) {
            this.deck = null;
        }
        // console.log(this.props.containerWidth, this.props.containerHeight);

        this.deck = new Deck({
            views: new OrthographicView({
                id: 'globalView',
                x: 0,
                y: 0,
                width: '100%',
                height: '100%',
                maxZoom: 50,
                minZoom: -50,
                controller: true,
            }),
            width: this.props.containerWidth,
            height: this.props.containerHeight,
            viewState: initViewState,
            onViewStateChange: this.onViewStateChange,
            gl: this.gl,
            controller: true,
            onClick: this.deckClickHandler,
            onDragStart: this.deckDragStartHandler,
            onDragEnd: this.deckDragEndHandler,
            pickingRadius: 6,
        });
        this.props.viewState.height = this.props.containerHeight;
        this.props.viewState.width = this.props.containerWidth;
        this.props.viewState.maxRotationX = 90;
        this.props.viewState.minRotationX = -90;
        this.props.viewState.orbitAxis = "Z";
        this.props.viewState.rotationOrbit = 0;
        this.props.viewState.rotationX = 0;
        this.props.viewState.minZoom = -Infinity;
        this.props.viewState.maxZoom = Infinity;
    }

    _onViewStateChange({ viewState, oldViewState, interactionState }) {
        if (this.isAllowCanvasMove && !this.boxSelecting) {

        } else {
            if (interactionState.isZooming) {
                this.props.zoom = viewState.zoom;
                // viewState.zoom=oldViewState.zoom;
                // viewState.target = oldViewState.target;
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
        const styleFlag = this.updateFlag.style;
        const positionFlag = this.updateFlag.position;
        const iconFlag = this.updateFlag.icon;
        const invalidIcon = this.invalidIncons
        const defaultUrlMap = this.props.defaultUrlMap;
        const defaultUrlFunc = this.props.defaultUrlFunc;
        const { renderBackgrounds, renderIcons, renderLines, renderTexts, renderPolygons, charSet,renderNodeLabels,renderLinkLabels,labelCharSet } = this.renderObject;
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;
        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines,
            autoHighlight: true,
            highlightColor: [lineHighlightRGB.red, lineHighlightRGB.green, lineHighlightRGB.blue, lineHighlightOpactiy * 255],
            pickable: true,
            positionFormat: 'XY',
            getWidth: d => d.style.lineWidth,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor,
            updateTriggers: {
                getSourcePosition: positionFlag,
                getTargetPosition: positionFlag,
                getColor: styleFlag,
            },
            onClick: this.lineClickHandler,
        });
        const markRGB = hexRgb(this.props.nodeHighlightColor);
        const markOpactiy = this.props.nodeHighlightOpacity;
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons,
            pickable: true,
            autoHighlight:true,
            highlightColor: [markRGB.red, markRGB.green, markRGB.blue,markOpactiy*255],
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            positionFormat: 'XY',
            sizeScale:2**zoom,
            getIcon: d => {
                let url = null;
                if (invalidIcon.has(d.url)) {
                    let type = defaultUrlFunc(d);
                    url = defaultUrlMap[type];
                } else {
                    url = d.url;
                }
                return {
                    url: url,
                    width: ICONDIM,//d.style.iconHeight,
                    height: ICONDIM,//d.style.iconHeight,
                    anchorX: 0,
                    anchorY: 0,
                }
            },
            onIconError: this.onIconErrorHander,
            getSize: d => d.style.iconSize,//this 指向问题
            updateTriggers: {
                getPosition: positionFlag,
                getIcon: iconFlag,
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        });


        const rectBackgroundLayer = new PolygonLayer({
            id: 'rect-background-layer',
            data: renderBackgrounds,
            opacity: 1,
            getFillColor: (d) => {
                if (d.status === 2) {
                    return d.style.backgroundColor;
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getPolygon: (d) => {
                return d.backgroundPolygon;
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor;
                } else {
                    return [255, 255, 255.0];
                }
            },
            getLineWidth: (d) => {
                if (d.status === 2) {
                    return d.style.borderWidth;
                } else {
                    return 0;
                }
            },
            filled: true,
            stroked: true,
            positionFormat: 'XY',
            updateTriggers: {
                getPolygon: positionFlag,
                getFillColor: styleFlag,
            }
        });

        const textLayer = new TextLayer({
            id: 'text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderTexts,
            maxWidth: 300,
            wordBreak: 'break-all',
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize * (2 ** zoom),
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: charSet,
            getColor: (d) => d.style.textColor,
            updateTriggers: {
                getPosition: positionFlag,
                getColor: styleFlag
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygons,
            filled: true,
            stroked: true,
            getLineWidth: 1,
            getLineColor: d => d.style.polygonFillColor,
            getPolygon: d => {
                return d.polygon;
            },
            positionFormat: 'XY',
            getFillColor: (d) => d.style.polygonFillColor,
            updateTriggers: {
                getPolygon: positionFlag,
                getFillColor: styleFlag,
                getLineColor: styleFlag,
            }
        });
        const nodelabelLayer=new TextLayer({
            id: 'node-label-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderNodeLabels,
            background:true,
            backgroundPadding:[3,2,3,2],
            sizeScale:2**zoom,
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: labelCharSet,
            getColor: (d) => d.style.textColor,
            getBackgroundColor:(d)=>{
                return d.style.labelBackground;
            },
            updateTriggers: {
                getPosition: positionFlag,
                getColor: styleFlag
            }
        });
        const linkLabelLayer=new TextLayer({
            id: 'link-label-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderLinkLabels,
            background:true,
            backgroundPadding:[3,2,3,2],
            sizeScale:2**zoom,
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: labelCharSet,
            getColor: (d) => d.style.textColor,
            getBackgroundColor:(d)=>{
                return d.style.labelBackground;
            },
            updateTriggers: {
                getPosition: positionFlag,
                getColor: styleFlag
            }
        })

        this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, arrowLayer, rectBackgroundLayer, iconLayer, textLayer,nodelabelLayer,linkLabelLayer] });
    }


    renderGraph() {
        
        const zoom = this.props.zoom;
        const invalidIcon = this.invalidIncons;
        const { renderBackgrounds, renderIcons, renderLines, renderTexts, renderPolygons, charSet,renderNodeLabels,renderLinkLabels,labelCharSet } = this.renderObject;
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;

        const styleFlag = this.updateFlag.style;
        const positionFlag = this.updateFlag.position;
        const iconFlag = this.updateFlag.icon;

        const defaultUrlMap = this.props.defaultUrlMap;
        const defaultUrlFunc = this.props.defaultUrlFunc;


        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines.filter(() => true),
            autoHighlight: true,
            highlightColor: [lineHighlightRGB.red, lineHighlightRGB.green, lineHighlightRGB.blue, lineHighlightOpactiy * 255],
            pickable: true,
            getWidth: d => d.style.lineWidth,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor,
            updateTriggers: {
                getSourcePosition: positionFlag,
                getTargetPosition: positionFlag,
                getColor: styleFlag,
            },
            onClick: this.lineClickHandler,
        });
        const markRGB = hexRgb(this.props.nodeHighlightColor);
        const markOpactiy = this.props.nodeHighlightOpacity;
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons.filter(() => true),
            pickable: true,
            autoHighlight:true,
            highlightColor:[markRGB.red, markRGB.green, markRGB.blue,markOpactiy*255],
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            getIcon: d => {
                let url = null;
                if (invalidIcon.has(d.url)) {
                    let type = defaultUrlFunc(d);
                    url = defaultUrlMap[type];
                } else {
                    url = d.url;
                }
                return {
                    url: url,
                    width: ICONDIM,//d.style.iconHeight,
                    height: ICONDIM,//d.style.iconHeight,
                    anchorX: 0,
                    anchorY: 0,
                }
            },
            getSize: d => d.style.iconSize * (2 ** zoom),//this 指向问题
            getColor: d => d.style.iconColor,

            updateTriggers: {
                getPosition: positionFlag,
                getSize: zoom,
                getIcon: iconFlag,
            },
            onIconError: this.onIconErrorHander,
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        });



        const rectBackgroundLayer = new PolygonLayer({
            id: 'rect-background-layer',
            data: renderBackgrounds.filter(() => true),
            opacity: 1,
            positionFormat: 'XY',
            getFillColor: (d) => {
                if (d.status === 2) {
                    return d.style.backgroundColor;
                } else {
                    return [255, 255, 255, 0];
                }
            },
            getPolygon: (d) => {
                return d.backgroundPolygon;
            },
            getLineColor: (d) => {
                if (d.status === 2) {
                    return d.style.borderColor;
                } else {
                    return [255, 255, 255.0];
                }
            },
            getLineWidth: (d) => {
                if (d.status === 2) {
                    return d.style.borderWidth;
                } else {
                    return 0;
                }
            },
            filled: true,
            stroked: true,
            updateTriggers: {
                getPolygon: positionFlag,
                getFillColor: styleFlag,
            }
        });


        const textLayer = new TextLayer({
            id: 'text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderTexts.filter(() => true),
            pickable: true,
            maxWidth: 300,
            wordBreak: 'break-all',
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize * (2 ** zoom),
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: charSet,
            getColor: (d) => d.style.textColor,
            updateTriggers: {
                getPosition: positionFlag,
                getSize: zoom + styleFlag,
                getColor: styleFlag
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygons.filter(() => true),
            filled: true,
            stroked: true,
            positionFormat: 'XY',
            getLineWidth: 1,
            getLineColor: d => d.style.polygonFillColor,
            getPolygon: d => {
                return d.polygon;
            },
            getFillColor: (d) => d.style.polygonFillColor,
            updateTriggers: {
                getFillColor: styleFlag,
            }
        });
        const nodelabelLayer=new TextLayer({
            id: 'node-label-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderNodeLabels.filter(() => true),
            fontFamily: 'Microsoft YaHei',
            background:true,
            backgroundPadding:[3,2,3,2],
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize * (2 ** zoom),
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: labelCharSet,
            getColor: (d) => d.style.textColor,
            getBackgroundColor:(d)=>{
                return d.style.labelBackground;
            },
            updateTriggers: {
                getPosition: positionFlag,
                getSize: zoom + styleFlag,
                getColor: styleFlag
            }
        });
        const linkLabelLayer=new TextLayer({
            id: 'link-label-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderLinkLabels.filter(() => true),
            fontFamily: 'Microsoft YaHei',
            background:true,
            backgroundPadding:[3,2,3,2],
            getPosition: d => {
                return d.position;
            },
            getText: d => d.text,
            getSize: d => d.style.textSize * (2 ** zoom),
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: labelCharSet,
            getColor: (d) => d.style.textColor,
            getBackgroundColor:(d)=>{
                return d.style.labelBackground;
            },
            updateTriggers: {
                getPosition: positionFlag,
                getSize: zoom + styleFlag,
                getColor: styleFlag
            }
        });
        this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, arrowLayer, rectBackgroundLayer, iconLayer, textLayer,nodelabelLayer,linkLabelLayer] });
    }

    _nodeClickHandler(info, e) {

        if (!e.leftButton) {
            this.eventController.fire('nodeRightClick', [info, e]);
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
    _iconErrorHander({ url }) {
        this.invalidIncons.set(url, true);
        if (this.updateFlag.iconTimer) {
            clearTimeout(this.updateFlag.iconTimer);
            this.updateFlag.iconTimer = null;
        }
        this.updateFlag.iconTimer = setTimeout(() => {
            this.updateFlag.icon = Math.random();
            this.updateRenderGraph()
        }, 1000);

    }


    _nodeDragingHandler(info, e) {
        if (info.object.origionElement.isLocked) {
            return true
        }
        if (!this.dragDoune) {

            this.dragDoune = true;
            this.elementController.updateNodeLocation([info.object.id], { x: parseFloat((e.offsetCenter.x - info.object.style.backgroundWidth / 2) * (2 ** -this.props.zoom) + (this.props.viewState.target[0] - this.props.initTarget[0] * (2 ** -this.props.zoom))), y: parseFloat((e.offsetCenter.y - info.object.style.backgroundHeight / 2) * (2 ** -this.props.zoom) + (this.props.viewState.target[1] - this.props.initTarget[1] * (2 ** -this.props.zoom))) }, this.groupDrag);

            this.eventController.fire('nodeDraging', [info, e]);
            setTimeout(() => {
                this.dragDoune = false;
            }, 100)
        }

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


    pickObject(pickField) {
        const pickedObjects = this.deck.pickObjects({ x: pickField.startX, y: pickField.startY, width: pickField.width, height: pickField.height, layerIds: ['mark-layer'] });
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
            this.viewState = viewState;
            this.deck.setProps({ viewState });
            this.updateRenderGraph();
        }
    }
    getZoom() {
        return this.props.zoom;
    }


    updateRenderObject({ renderObject, position, style, bubble }) {
        if (renderObject) {
            this.renderObject = renderObject;
            this.renderObject.charSet.push('.')
            this.renderGraph();
        } else {
            if (position) {
                this.updateFlag.position = Math.random();
            }

            if (style) {
                this.updateFlag.style = Math.random();
            }
            if (bubble) {
                this.updateFlag.bubble = Math.random();
            }
            this.updateRenderGraph();
        }
    }

    mountElementController(elementController) {
        this.elementController = elementController;
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

    fitView(params) {
        if (params.zoom < this.props.minZoom) {
            params.zoom = this.props.minZoom;
        }
        let isNeedUpdate = false;
        if (params.zoom !== this.props.zoom) {
            isNeedUpdate = true;
        }
        this.props.viewState.target = [params.target[0], params.target[1], 0];
        this.props.viewState.zoom = params.zoom;
        this.props.zoom = params.zoom;
        let viewStat = JSON.parse(JSON.stringify(this.props.viewState));
        viewStat.minZoom = -1000;
        viewStat.maxZoom = 1000 + Math.random();
        this.props.viewState = viewStat;
        this.deck.setProps({ viewState: viewStat });
        if (isNeedUpdate) {
            this.updateRenderGraph();
        }
    }



}