import { Deck, COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';

//用于Brush状态下在原始Canvas 上创建一层新的canvas用户进行brush交互
export default class BrushCanvas {
    constructor(props) {
        this.props = {};
        Object.assign(this.props, props);
        this._onDrag = this._onDrag.bind(this);
        this._onDragStart = this._onDragStart.bind(this);
        this._onDragEnd = this._onDragEnd.bind(this);
        this._initBackgrounPolygon();
        this._initContext();
    }



    _initBackgrounPolygon() {
        this.offX = (this.props.viewState.target[0] - this.props.width / 2 * (2 ** -this.props.zoom));
        this.offY = (this.props.viewState.target[1] - this.props.height / 2 * (2 ** -this.props.zoom));
        let x1 = 0;
        let x2 = this.props.width * (2 ** -this.props.zoom);
        let y1 = 0;
        let y2 = this.props.height * (2 ** -this.props.zoom);
        x1 = (x1 + this.offX);
        x2 = (x2 + this.offX);
        y1 = (y1 + this.offY);
        y2 = (y2 + this.offY);
        this.backgroundPolygonData = [{ polygon: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]] }];
    }
    /**
     * init 用于brush的Canvas
     */
    _initContext() {
        if (!this.isContextInit) {
            this.canvas = document.createElement('canvas');
            this.gl = this.canvas.getContext('webgl2');
            this.isContextInit = true;
        }else{
            this.canvas.width = this.props.width;
            this.canvas.height = this.props.height;
        }

    }

    showBrushArea(props) {
        Object.assign(this.props,props);
        this._initBackgrounPolygon();
        this._initContext();
        const container = document.getElementById(this.props.container);
        container.appendChild(this.canvas);
        const viewState = this.props.viewState;
        this.backgrounPolygonLayer = new PolygonLayer({
            id: 'brush_backgroun_polygon_layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: this.backgroundPolygonData,
            pickable: true,
            filled: true,
            stroked: false,
            opacity: 0.1,
            getPolygon: d => {
                return d.polygon;
            },
            getFillColor: [0, 20, 0],
            onDragStart: this._onDragStart,
            onDragEnd: this._onDragEnd,
            onDrag: this._onDrag
        });

        this.deck = new Deck({
            views: new OrthographicView({
                x: 0,
                y: 0,
                id: 'globalView',
                width: '100%',
                height: '100%',
            }),
            width: this.props.width,
            height: this.props.height,
            controller: false,
            initialViewState: viewState,
            getCursor: () => "crosshair",
            gl: this.gl,
        });
        this.deck.setProps({
            layers: [this.backgrounPolygonLayer]
        });
    }

    _onDrag(info, e) {
        this.width = e.offsetCenter.x * (2 ** -this.props.zoom) + this.offX - this.startX
        this.height = e.offsetCenter.y * (2 ** -this.props.zoom) + this.offY - this.startY
        const tempPolygonData = [{ polygon: [[this.startX, this.startY], [this.startX + this.width, this.startY], [this.startX + this.width, this.startY + this.height], [this.startX, this.startY + this.height]] }];
        this._renderBrushPolygon(tempPolygonData);
    }

    _onDragStart(info, e) {
        this.startX = e.offsetCenter.x * (2 ** -this.props.zoom) + this.offX;
        this.startY = e.offsetCenter.y * (2 ** -this.props.zoom) + this.offY;
    }

    _onDragEnd(info, e) {
        let brushInfo;
        this.startX = this.startX * (2 ** this.props.zoom) - this.offX * (2 ** this.props.zoom);
        this.startY = this.startY * (2 ** this.props.zoom) - this.offY * (2 ** this.props.zoom);
        this.width = this.width * (2 ** this.props.zoom);
        this.height = this.height * (2 ** this.props.zoom);
        if (this.width <= 0 && this.height <= 0) {
            brushInfo = {
                startX: this.startX + this.width,
                startY: this.startY + this.height,
                width: Math.abs(this.width),
                height: Math.abs(this.height)
            }
        } else if (this.width <= 0) {
            brushInfo = {
                startX: this.startX + this.width,
                startY: this.startY,
                width: Math.abs(this.width),
                height: this.height
            }
        } else if (this.height <= 0) {
            brushInfo = {
                startX: this.startX,
                startY: this.startY - this.height,
                width: this.width,
                height: Math.abs(this.height)
            }
        } else {
            brushInfo = {
                startX: this.startX,
                startY: this.startY,
                width: this.width,
                height: this.height
            }
        }

        this.props.eventController.fire('_brushend', [brushInfo]);
        this.canvas.remove()
    }

    _renderBrushPolygon(tempPolygonData) {
        const brushPolygonLayer = new PolygonLayer({
            id: 'brush_polygon_layer',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            data: tempPolygonData,
            pickable: true,
            filled: true,
            stroked: false,
            opacity: 0.3,
            getPolygon: d => {
                return d.polygon;
            },
            getFillColor: [100, 100, 0]
        });
        this.deck.setProps({ layers: [this.backgrounPolygonLayer, brushPolygonLayer] });
    }
}