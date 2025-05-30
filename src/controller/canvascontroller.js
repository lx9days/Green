import { Deck, COORDINATE_SYSTEM, OrthographicView, Viewport, FlyToInterpolator, LinearInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, IconLayer, LineLayer, TextLayer, PolygonLayer, SolidPolygonLayer } from '@deck.gl/layers';
import hexRgb from 'hex-rgb';
import RoundedRectangleLayer from '../compositelayer/RoundedRectangleLayer';
import BrushCanvas from '../helper/brushCanvas';
// const COlOR={
//     color1:[125,56,45],
//     colorRed:[255,0,0]
//     colorBlue
// }
const ICONDIM = 60;
export default class CanvasController {
    constructor(props, eventController) {
        this.props = props;
        console.log(props)

        this.boxSelecting = false;
        this.isAllowCanvasMove = false;
        this.elementController = null;
        this.renderObject = null;
        this.groupDrag = false;
        this.dragDoune = null;
        this.isJustDraged=false;

        this.updateFlag = {
            position: 0,
            style: 0,
            bubble: 0,
            icon: 0,
            iconTimer: null,
        }
        this.animationData = [];

        this.invalidIncons = new Map();

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
        });
        this.canvas.addEventListener('dblclick',e=>{
            this.eventController.fire('canvasDoubleClick',[e]);
            e.preventDefault();
        });
      
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
                width: '100%',
                height: '100%',
                maxZoom: this.props.maxZoom,
                minZoom: this.props.minZoom,
                controller: true,
                doubleClickZoom:false,
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
            getTooltip: ({ object }) => {
                if (object && object.origionElement && object.origionElement.data.metaType === 'nodeSet' && object.origionElement.data.statistics && Object.keys(object.origionElement.data.statistics).length > 0) {
                    let html = '';
                    for (const key in object.origionElement.data.statistics) {
                        html += `<div>${key}:${object.origionElement.data.statistics[key]}</div>`
                    }
                    return {
                        html: `<div>${html}</div>`,
                        style: {
                            backgroundColor: '#d9d9d9',

                        }
                    }
                }
            }
            //getCursor:({isDragging,isHovering}) => isHovering ? 'grabbing' : 'grab'
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
        this.isJustDraged=true
        setTimeout(()=>{
            this.isJustDraged=false
        },4000)
        this.isAllowCanvasMove = true;
    }

    _deckDragingHandler(info, e) {

    }

    _deckDragEndHandler(info, e) {
        this.isAllowCanvasMove = false;
    }


    updateRenderGraph(viewStat = null) {
        const zoom = this.props.zoom;
        const styleFlag = this.updateFlag.style;
        const positionFlag = this.updateFlag.position;
        const bubbleFlag = this.updateFlag.bubble;
        const iconFlag = this.updateFlag.icon;
        const invalidIcon = this.invalidIncons
        const defaultUrlMap = this.props.defaultUrlMap;
        const defaultUrlFunc = this.props.defaultUrlFunc;
        const { renderBackgrounds, renderIcons, renderLines, renderText, renderPolygon, charSet, renderMark, renderLabels, renderBubble, renderDashLine, renderGroupTexts, groupTextSet } = this.renderObject;
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;
        let bubbleLayer = null
        if (renderBubble.length > 0) {
            bubbleLayer = new SolidPolygonLayer({
                id: 'bubble-layer',
                data: renderBubble,
                positionFormat: 'XY',
                opacity:0.5,
                getPolygon: d => d.polygon,
                getFillColor: d => d.color,
                updateTriggers: {
                    getPolygon: positionFlag + bubbleFlag,

                },
            });

        }
        let animationLayer = null;
        if (this.animationData.length > 0) {
            let animationTrigger = Math.random();
            animationLayer = new ScatterplotLayer({
                id: 'animation-layer',
                data: this.animationData,
                stroked: false,
                filled: true,
                getPosition: d => d.currentPos,
                getRadius: d => d.radius,
                getFillColor: d => d.color,
                updateTriggers: {
                    getPosition: animationTrigger,
                }
            })
        }
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
        const dashLineLayer = new LineLayer({
            id: 'dash-line-layer',
            data: renderDashLine.filter(() => true),
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
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons,
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            sizeScale: 2 ** zoom,
            getPosition: d => d.position,
            positionFormat: 'XY',
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
            getSize: d => d.style.iconSize ,// * (2 ** zoom),//this 指向问题
            updateTriggers: {
                getPosition: positionFlag,
                getIcon: iconFlag,
            }
        });

        const circleEdge = new ScatterplotLayer({
            id: 'circleedge-layer',
            data: renderBackgrounds.filter((v) => v.shapeType === 0),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
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
        // const roundedEdge = new RoundedRectangleLayer({
        //     id: 'rounded',
        //     data: renderBackgrounds.filter((v) => v.shapeType === 1),
        //     opacity: 1,
        //     getFillColor: (d) => {
        //         return d.style.backgroundColor || [255, 255, 255, 255];
        //     },
        //     getLineColor: (d) => {
        //         if (d.status === 2) {
        //             return d.style.borderColor
        //         } else {
        //             return [255, 255, 255, 0];
        //         }
        //     },
        //     getLineWidth: (d) => {
        //         if (d.status === 2) {
        //             return d.style.borderWidth || 4
        //         } else {
        //             return 0;
        //         }
        //     },
        //     getFirstScatterPosition: (d) => {
        //         return d.position;
        //     },
        //     getSecondScatterPosition: (d) => {
        //         return [d.position[0] + d.style.backgroundWidth, d.position[1]];
        //     },
        //     getPolygon: (d) => {
        //         return [[d.position[0], d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] - d.style.backgroundHeight / 2], [d.position[0], d.position[1] - d.style.backgroundHeight / 2]];
        //     },
        //     getFirstPath: (d) => {
        //         return [[d.position[0] - d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2]];
        //     },
        //     getSecondPath: (d) => {
        //         return [[d.position[0] - d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2]];
        //     },
        //     getCircleRadius: (d) => {
        //         return d.style.backgroundHeight / 2;
        //     }
        // })
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
                //getPolygon: positionFlag,
                getFillColor: styleFlag,
                getPolygon: styleFlag + positionFlag,
            }
        });
        const textLayer = new TextLayer({
            id: 'text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderText,
            fontFamily: 'Microsoft YaHei',
            sizeScale: 2 ** zoom,
            getPosition: d => {
                return [d.position[0]+5, d.position[1]+15];
            },
            getText: d => d.text,
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: charSet,
            getColor: (d) => d.style.textColor,
            updateTriggers: {
                getPosition: positionFlag,
                getSize: styleFlag,
                getColor: styleFlag
            }
        });
        const groupTextLayer = new TextLayer({
            id: 'group-text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderGroupTexts,
            maxWidth: 360,
            wordBreak: 'break-all',
            fontFamily: 'Microsoft YaHei',
            sizeScale: 2 ** zoom,
            getPosition: d => {
                return d.position;
            },
            getText: d => {
                return d.text;
            },
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: groupTextSet,
            getColor: (d) => d.style.textColor,
            updateTriggers: {
                getPosition: positionFlag,
                getSize: styleFlag,
                getColor: styleFlag
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygon,
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
            positionFormat: 'XY',
            getPolygon: d => {
                return d.backgroundPolygon
                return [
                    [d.backgroundPolygon[0][0],d.backgroundPolygon[0][1]],
                    [d.backgroundPolygon[1][0]+d.style.borderWidth*2,d.backgroundPolygon[1][1]],
                    [d.backgroundPolygon[2][0]+d.style.borderWidth * 2,d.backgroundPolygon[2][1]+d.style.borderWidth * 2],
                    [d.backgroundPolygon[3][0],d.backgroundPolygon[3][1]+d.style.borderWidth * 2]
            ]
            // return resolveBorder
            },
            getFillColor: (d) => {
                if (d.status === 4) {
                    return d.style.highLightColor;
                } else {
                    return [255, 255, 255, 0];
                }
            },
            updateTriggers: {
                getFillColor: styleFlag,
                getPolygon: positionFlag + styleFlag,
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        });
        const labelLayer = new IconLayer({
            id: 'label-layer',
            data: renderLabels,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            sizeScale: 2 ** zoom,
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize,//this 指向问题
            updateTriggers: {
                getPosition: positionFlag,
            }
        });
        const nodelabelLayer = new TextLayer({
            id: 'node-label-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderGroupTexts,
            background: true,
            backgroundPadding: [5, 2, 5, 2],
            sizeScale: 2 ** zoom,
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return [d.position[0] + d.style.backgroundWidth/4, d.position[1] - d.style.backgroundHeight];
            },
            getText: d => "节点数:10",
            getSize: d => 15,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: ['节','点','数',':','1','0'],
            getColor: (d) => [50, 65, 137, 255],
            getBackgroundColor: (d) => {
                return [255,140,0,255];
            },
            updateTriggers: {
                getPosition: positionFlag,
                getColor: styleFlag
            }
        });
        if (viewStat === null) {
            if (renderBubble.length > 0 && this.animationData.length > 0) {
                this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [bubbleLayer, lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, animationLayer, markLayer,
                nodelabelLayer] });
            } else if (renderBubble.length > 0) {
                this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [bubbleLayer, lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, markLayer,
                    nodelabelLayer] });
            } else if (this.animationData.length > 0) {
                this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, animationLayer, markLayer,
                    nodelabelLayer] });
            } else {
                this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, markLayer,
                    nodelabelLayer] });
            }
        } else {
            if (renderBubble.length > 0 && this.animationData.length > 0) {
                this.deck.setProps({ viewState: viewStat, width: this.props.containerWidth, height: this.props.containerHeight, layers: [bubbleLayer, lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, animationLayer, markLayer,
                    nodelabelLayer] });
            } else if (renderBubble.length > 0) {
                this.deck.setProps({ viewState: viewStat, width: this.props.containerWidth, height: this.props.containerHeight, layers: [bubbleLayer, lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, markLayer,
                    nodelabelLayer] });
            } else if (this.animationData.length > 0) {
                this.deck.setProps({ viewState: viewStat, width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, animationLayer, markLayer,
                    nodelabelLayer] });
            } else {
                this.deck.setProps({ viewState: viewStat, width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, markLayer,
                    nodelabelLayer] });
            }
        }





        //this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight,viewState:viewState, layers: [lineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, textLayer, markLayer] });
    }

    renderLockNode() {
        const zoom = this.props.zoom;
        const { renderBackgrounds, renderIcons, renderLines, renderText, renderPolygon, charSet, renderMark, renderLabels, renderDashLine } = this.renderObject;
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;
        const invalidIcon = this.invalidIncons;
        const defaultUrlMap = this.props.defaultUrlMap;
        const defaultUrlFunc = this.props.defaultUrlFunc;
        const styleFlag = this.updateFlag.style;
        const positionFlag = this.updateFlag.position;
        const bubbleFlag = this.updateFlag.bubble;
        const iconFlag = this.updateFlag.icon;

        const lineLayer = new LineLayer({
            id: 'line-layer',
            data: renderLines,
            autoHighlight: true,
            highlightColor: [lineHighlightRGB.red, lineHighlightRGB.green, lineHighlightRGB.blue, lineHighlightOpactiy * 255],
            pickable: true,
            getWidth: d => d.style.lineWidth,
            getSourcePosition: d => d.sourcePosition,
            getTargetPosition: d => d.targetPosition,
            getColor: d => d.style.lineColor,
            updateTriggers: {
                getSourcePosition: d => d.sourcePosition,
                getTargetPosition: d => d.targetPosition,
            },
            onClick: this.lineClickHandler,
        });
        const dashLineLayer = new LineLayer({
            id: 'dash-line-layer',
            data: renderDashLine.filter(() => true),
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
                url: invalidIcon.has(d.url) ? function (d) {
                    return defaultUrlMap[defaultUrlFunc(d)];
                }(d) : d.url,
                width: ICONDIM,//d.style.iconHeight,
                height: ICONDIM,//d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize,//this 指向问题
            updateTriggers: {
                getPosition: d => {
                    return d.position;
                },
                getSize: d => d.style.iconSize * (2 ** zoom),

            },
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
                getPolygon: d => {
                    return d.backgroundPolygon;
                },
                getFillColor: (d) => {
                    if (d.status === 2) {
                        return d.style.backgroundColor;
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
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => {
                const len = d.text.length;
                if (len > 10) {
                    let temp = d.text.slice(0, 7);
                    temp += temp + '..'
                    return temp;
                } else {
                    return d.text;
                }
            },
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
            data: renderPolygon,
            filled: true,
            stroked: true,
            getLineWidth: 1,
            getLineColor: d => d.style.polyonColor,
            getPolygon: d => {
                return d.polygon;
            },
            positionFormat: 'XY',
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
            positionFormat: 'XY',
            getPolygon: d => {
                return [
                    [d.backgroundPolygon[0][0],d.backgroundPolygon[0][1]],
                    [d.backgroundPolygon[1][0]+d.style.borderWidth*2,d.backgroundPolygon[1][1]],
                    [d.backgroundPolygon[2][0]+d.style.borderWidth * 2,d.backgroundPolygon[2][1]+d.style.borderWidth * 2],
                    [d.backgroundPolygon[3][0],d.backgroundPolygon[3][1]+d.style.borderWidth * 2]
            ]
            },
            getFillColor: (d) => {
                if (d.status === 4) {
                    return d.style.highLightColor;
                } else {
                    return [255, 255, 255, 0];
                }
            },
            updateTriggers: {
                getFillColor: styleFlag,
                getPolygon: styleFlag + positionFlag,
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        });
        const labelLayer = new IconLayer({
            id: 'label-layer',
            data: renderLabels.filter(() => true),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            getPosition: d => d.position,
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize,
            updateTriggers: {
                getPosition: d => {
                    return d.position;
                },
            },
            onIconError: () => {
                console.log(arguments)
            }
        })

        this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, textLayer, markLayer] });
    }
    renderGraph() {


        const zoom = this.props.zoom;
        const invalidIcon = this.invalidIncons;
        const { renderBackgrounds, renderIcons, renderLines, renderText, renderPolygon, charSet, renderMark, renderLabels, renderDashLine, renderBubble, renderGroupTexts, groupTextSet } = this.renderObject;
        
        const lineHighlightRGB = hexRgb(this.props.lineHighlightColor);
        const lineHighlightOpactiy = this.props.lineHighlightOpacity;

        const styleFlag = this.updateFlag.style;
        const positionFlag = this.updateFlag.position;
        const iconFlag = this.updateFlag.icon;
        const bubbleFlag = this.updateFlag.bubble;

        const defaultUrlMap = this.props.defaultUrlMap;
        const defaultUrlFunc = this.props.defaultUrlFunc;

        let bubbleLayer = null
        if (renderBubble.length > 0) {
            bubbleLayer = new SolidPolygonLayer({
                id: 'bubble-layer',
                data: renderBubble,
                positionFormat: 'XY',
                getPolygon: d => d.polygon,
                getFillColor: d => d.color,
                updateTriggers: {
                    getPolygon: positionFlag + bubbleFlag,

                },
            });

        }

        let animationLayer = null;
        if (this.animationData.length > 0) {
            animationLayer = new ScatterplotLayer({
                id: 'animation-layer',
                data: this.animationData,
                stroked: false,
                filled: true,
                getPosition: d => d.currentPos,
                getRadius: d => d.radius,
                getFillColor: d => d.color,
                updateTriggers: {
                    getPosition: Math.random(),
                }
            })
        }
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
        const dashLineLayer = new LineLayer({
            id: 'dash-line-layer',
            data: renderDashLine.filter(() => true),
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
        const iconLayer = new IconLayer({
            id: 'icon-layer',
            data: renderIcons.filter(() => true),
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            sizeScale: 2 ** zoom,
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
            getSize: d => d.style.iconSize,//this 指向问题
            getColor: d => d.style.iconColor,

            updateTriggers: {
                getPosition: positionFlag,
                getIcon: iconFlag,
            },
            onIconError: this.onIconErrorHander,
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



        // const roundedEdge = new RoundedRectangleLayer({
        //     id: 'rounded',
        //     data: renderBackgrounds.filter((v) => v.shapeType === 1 && v.status === 1),
        //     opacity: 1,
        //     getFillColor: (d) => {
        //         return d.style.backgroundColor || [255, 255, 255, 255];
        //     },
        //     getLineColor: (d) => {
        //         if (d.status === 2) {
        //             return d.style.borderColor
        //         } else {
        //             return [255, 255, 255, 0];
        //         }
        //     },
        //     getLineWidth: (d) => {
        //         if (d.status === 2) {
        //             return d.style.borderWidth || 4
        //         } else {
        //             return 0;
        //         }
        //     },
        //     getFirstScatterPosition: (d) => {
        //         return d.position;
        //     },
        //     getSecondScatterPosition: (d) => {
        //         return [d.position[0] + d.style.backgroundWidth, d.position[1]];
        //     },
        //     getPolygon: (d) => {
        //         return [[d.position[0], d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth, d.position[1] - d.style.backgroundHeight / 2], [d.position[0], d.position[1] - d.style.backgroundHeight / 2]];
        //     },
        //     getFirstPath: (d) => {
        //         return [[d.position[0] - d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] - d.style.backgroundHeight / 2]];
        //     },
        //     getSecondPath: (d) => {
        //         return [[d.position[0] - d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2], [d.position[0] + d.style.backgroundWidth + d.style.borderWidth / 2, d.position[1] + d.style.backgroundHeight / 2]];
        //     },
        //     getCircleRadius: (d) => {
        //         return d.style.backgroundHeight / 2;
        //     }
        // })

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
            data: renderText.filter(() => true),
            sizeScale: 2 ** zoom,
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
                getPosition: positionFlag,
                getSize: styleFlag,
                getColor: styleFlag
            }
        });
        const groupTextLayer = new TextLayer({
            id: 'group-text-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderGroupTexts.filter(() => true),
            pickable: true,
            maxWidth: 360,
            sizeScale: 2 ** zoom,
            wordBreak: 'break-all',
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return d.position;
            },
            getText: d => {
                return d.text;
            },
            getSize: d => d.style.textSize,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: groupTextSet,
            getColor: (d) => d.style.textColor,
            updateTriggers: {
                getPosition: positionFlag,
                getSize: styleFlag,
                getColor: styleFlag
            }
        });

        const arrowLayer = new PolygonLayer({
            id: 'arrow-layer',
            opacity: 1,
            data: renderPolygon.filter(() => true),
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
        const markRGB = hexRgb(this.props.nodeHighlightColor);
        const markOpactiy = this.props.nodeHighlightOpacity;
        const markLayer = new PolygonLayer({
            id: "mark-layer",
            opacity: 1,
            data: renderMark.filter(() => true),
            pickable: true,
            filled: true,
            stroked: false,
            autoHighlight: true,
            positionFormat: 'XY',
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
                getFillColor: styleFlag,
                getPolygon: styleFlag + positionFlag,
            },
            onDrag: this.nodeDragingHandler,
            onClick: this.nodeClickHandler,
            onDragStart: this.nodeDragStartHandler,
            onDragEnd: this.nodeDragEndHandler,
        });
        const labelLayer = new IconLayer({
            id: 'label-layer',
            data: renderLabels.filter(() => true),
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            sizeScale: 2 ** zoom,
            getPosition: d => d.position,
            getIcon: d => ({
                url: d.url,
                width: d.style.iconHeight,
                height: d.style.iconHeight,
                anchorX: 0,
                anchorY: 0,
            }),
            getSize: d => d.style.iconSize,//this 指向问题
            updateTriggers: {
                getPosition: positionFlag,
            },
            onIconError: () => {
                console.log(arguments)
            }
        });
        const nodelabelLayer = new TextLayer({
            id: 'node-label-layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: renderGroupTexts.filter(() => true),
            background: true,
            backgroundPadding: [5, 2, 5, 2],
            sizeScale: 2 ** zoom,
            fontFamily: 'Microsoft YaHei',
            getPosition: d => {
                return [d.position[0] + d.style.backgroundWidth/4, d.position[1] - d.style.backgroundHeight];
            },
            getText: d => "节点数:10",
            getSize: d => 15,
            getAngle: 0,
            getTextAnchor: d => d.style.textAnchor,
            getAlignmentBaseline: d => d.style.textAlignmentBaseline,
            characterSet: ['节','点','数',':','1','0'],
            getColor: (d) => [50, 65, 137, 255],
            getBackgroundColor: (d) => {
                return [255,140,0,255];
            },
            updateTriggers: {
                getPosition: positionFlag,
                getSize: styleFlag,
                getColor: styleFlag
            }
        });

        if (renderBubble.length > 0 && this.animationData.length > 0) {
            this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [bubbleLayer, lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, animationLayer, markLayer,
                 nodelabelLayer] });
        } else if (renderBubble.length > 0) {
            this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [bubbleLayer, lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, markLayer, 
                nodelabelLayer] });
        } else if (this.animationData.length > 0) {
            this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, animationLayer, markLayer, 
                nodelabelLayer] });
        } else {
            this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer, dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, groupTextLayer, textLayer, markLayer, 
                nodelabelLayer] });
        }
        // if (this.animationData.length > 0) {
        //     this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer,dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, textLayer, animationLayer, markLayer] });
        // } else {
        //     this.deck.setProps({ width: this.props.containerWidth, height: this.props.containerHeight, layers: [lineLayer,dashLineLayer, arrowLayer, rectBackgroundLayer, circleEdge,  labelLayer, iconLayer, textLayer, markLayer] });
        // }


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
    /**
     * 当前画布的缩放级别
     * @returns number
     */
    getZoom() {
        return this.props.zoom;
    }

    /**
     * 控制多个结点同时拖拽
     * @param {boolean} v 
     */
    setGroupDrag(v) {
        if (typeof v === 'boolean') {
            this.groupDrag = v;
        }
    }

    /**
     * 更新渲染对象并在画布重新绘制改变的元素
     * @param {{rederObject,position,style,bubble}} param0 更新的渲染对象和更新的原因
     */
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
    /**
     * 实时更新动画
     */
    updateAmination() {
        this.updateRenderGraph();
    }

    /**
     * 更新锁定的结点
     * @param {Object} renderObject 渲染对象
     */
    updateLockNode(renderObject) {
        this.renderObject = renderObject;
        this.renderLockNode();
    }
    /**
     * 将ElementController 挂载到CanvasController
     * @param {ElementController} elementController y
     */
    mountElementController(elementController) {
        this.elementController = elementController;
    }
    /**
     * 开启Brush 区域
     */
    showBrushArea() {
        let brushProps = {
            width: this.props.containerWidth,
            height: this.props.containerHeight,
            viewState: this.props.viewState,
            container: this.props.container,
            zoom: this.props.zoom,
            eventController: this.eventController
        }

        if (this.brushCanvas) {
            this.brushCanvas.showBrushArea(brushProps);
        } else {
            this.brushCanvas = new BrushCanvas(brushProps);
            this.brushCanvas.showBrushArea(brushProps);
        }
        this.eventController.subscribe('_brushend', this._brushInfoCallBack)
    }

    /**
     * bush 结果回调
     * @param {{x:number,y:number,width:number,height:numebr}} brushInfo 
     */
    _brushInfoCallBack(brushInfo) {


        let nodeIds = this.pickObject(brushInfo);
        //this.elementController.updateNodeStatus(nodeIds, 2);
        this.eventController.fire('brush', [nodeIds]);
        this.eventController.unSubscribeByName('_brushend');
    }
    /**
     * 将画布导出为Base64
     * @returns base64
     */
    exportCanvasAsBase64() {
        this.deck.redraw(true);
        return this.deck.canvas.toDataURL();
    }

    /**
     * 更新画布的尺寸
     * @param {{width,height}} param0 Canvas 宽度和高度
     */
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
                doubleClickZoom:false,
            }),
            viewState: this.props.viewState,
        })

        this.deck.redraw(true);

    }
    /**
     * 获取当前画布的宽度和高度
     * @returns {width,height}
     */
    getDim() {
        return {
            width: this.props.containerWidth,
            height: this.props.containerHeight,
        }
    }
    /**
     * 调整画布的聚焦点和缩放层级
     * @param {{target:Array<number>,zoom:number}} params 视图状态参数
     * @returns 
     */
    fitView(params) {
        if(this.isJustDraged){
            return
        }
        try {
            if (Number.isNaN(params.target[0]) || params.target === undefined) {
                params.target[0] = this.props.viewState.target[0];
            }
            if (Number.isNaN(params.target[1]) || params.target === undefined) {
                params.target[1] = this.props.viewState.target[1];
            }
            if (Number.isNaN(params.zoom) || params.zoom === undefined) {
                params.zoom = this.props.zoom;
            }
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
            // let viewStat = JSON.parse(JSON.stringify(this.props.viewState));
            let viewStat = Object.assign({}, this.props.viewState);
            viewStat.minZoom = -4;
            viewStat.maxZoom = 4 + Math.random();
            if (!viewStat) {
                return
            }
            this.props.viewState = viewStat;

           // if (isNeedUpdate) {
                this.updateRenderGraph(viewStat);
          //  }
        } catch (err) {
            console.log(params, this.viewState);
            throw err;
        }

    }

    /**
     * 移动canvas的聚焦位置到某一个点
     * @param {Array<number>} target 移动到的canvas的具体的位置
     */
    scrollIntoView(target) {

        this.props.viewState.target = [target[0], target[1], 0];
        const viewStat = JSON.parse(JSON.stringify(this.props.viewState))
        viewStat.minZoom = -Infinity;
        viewStat.maxZoom = Infinity;
        this.deck.setProps({ viewState: viewStat })
    }
    /**
     * 更新动画数据
     * @param {Array} animationData 动画控制数据
     */
    updateAnimationData(animationData) {

        this.animationData = animationData;
        if (this.animationData.length <= 0) {
            this.updateRenderGraph();
        }
    }
    /**
     * 为错误url指定默认url
     * @param {Object} defaultUrlMap type 到 url 映射
     */
    replaceDefaultUrlMap(defaultUrlMap) {
        this.props.defaultUrlMap = defaultUrlMap;
        this.renderGraph();
    }


    updateConstantParams(params){
        if(params.nodeHighlightColor){
            this.props.nodeHighlightColor=params.nodeHighlightColor;
        }
        if(params.nodeHighlightOpacity){
            this.props.nodeHighlightOpacity=params.nodeHighlightOpacity;
        }
        if(params.lineHighlightColor){
            this.props.lineHighlightColor=params.lineHighlightColor;
        }
        if(params.lineHighlightOpactiy){
            this.props.lineHighlightOpacity=params.lineHighlightOpacity;
        }
        this.renderGraph();
    }
}