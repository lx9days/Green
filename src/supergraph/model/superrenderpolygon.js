import hexRgb from 'hex-rgb';
import { isFunction, computePolygon } from '../helper/util';
//渲染polygon对应deck中的polygon
export default class SuperRenderPolygon {
    constructor(element, type, offset) {
        this.offset = offset;
        this.polygon = [];
        this.polygonType = type;
        this.origionElement = element;
        this.status = element.getStatus();
        this.style = {
            polygonColor: [255, 255, 255, 255],
            polygonShape: 'triangle',
            polygonFill: 'filled',
            polygonScale: 1,
            polygonFillColor: [255, 255, 255, 255],
            polygonOpacity: 1
        }
        this._generateStyle();
        this._generatePolygon();
    }

    /**
     * 重构style and position
     */
    rebuild() {
        this._generateStyle();
        this._generatePolygon();
    }

    /**
     * 重构位置
     */
    reLocation() {
        this._generatePolygon(this.origionElement, this.style.polygonShape, this.polygonType, this.offset);
    }

    /**
     * 更新状态
     */
    updateStatus() {
        this.status = this.origionElement.getStatus();
    }

    _generatePolygon() {
        this.polygon = computePolygon(this.origionElement, this.style.polygonShape, this.polygonType, this.offset);
    }
    _generateStyle() {

        const styles = this.origionElement.getStyles();


        styles.forEach((style) => {
            for (const item in style) {
                switch (item.toLowerCase()) {
                    case 'to-arrow-color':
                        // const targetArrowColorObj = style[item];
                        // let targetArrowColorHex;
                        // if (isFunction(targetArrowColorHex)) {
                        //     targetArrowColorHex = targetArrowColorObj(this.origionElement);
                        // } else {
                        //     targetArrowColorHex = targetArrowColorObj;
                        // }
                        // const targetArrowColorRGB = hexRgb(targetArrowColorHex);
                        // this.style.polygonColor[0] = targetArrowColorRGB.red;
                        // this.style.polygonColor[1] = targetArrowColorRGB.green;
                        // this.style.polygonColor[2] = targetArrowColorRGB.blue;
                        break;
                    case 'to-arrow-shape':
                        const targetArrowShapeObj = style[item];
                        if (isFunction(targetArrowShapeObj)) {
                            this.style.polygonShape = targetArrowShapeObj(this.origionElement);
                        } else {
                            this.style.polygonShape = targetArrowShapeObj;
                        }
                        break;
                    case 'to-arrow-fill':
                        const targetArrowFillObj = style[item];
                        if (isFunction(targetArrowFillObj)) {
                            this.style.polygonFill = targetArrowFillObj(this.origionElement);
                        } else {
                            this.style.polygonFill = targetArrowFillObj;
                        }
                        break;
                    case 'to-arrow-scale':
                        const targetArrowScaleObj = style[item];
                        if (isFunction(targetArrowScaleObj)) {
                            this.style.polygonScale = targetArrowScaleObj(this.origionElement);
                        } else {
                            this.style.polygonScale = targetArrowScaleObj;
                        }
                        break;
                    case 'line-opacity':
                        const lineOpacityObj = style[item];
                        if (isFunction(lineOpacityObj)) {
                            this.style.polygonOpacity = lineOpacityObj(this.origionElement);
                        } else {
                            this.style.polygonOpacity = lineOpacityObj;
                        }
                        break;
                    case 'line-color':
                        const targetArrowColorObj = style[item];
                        let targetArrowColorHex;
                        if (isFunction(targetArrowColorHex)) {
                            targetArrowColorHex = targetArrowColorObj(this.origionElement);
                        } else {
                            targetArrowColorHex = targetArrowColorObj;
                        }
                        const targetArrowColorRGB = hexRgb(targetArrowColorHex);
                        this.style.polygonColor[0] = targetArrowColorRGB.red;
                        this.style.polygonColor[1] = targetArrowColorRGB.green;
                        this.style.polygonColor[2] = targetArrowColorRGB.blue;
                        break;
                    default:
                        break;
                }
            }
        })


        this.style.polygonColor[3] = this.style.polygonOpacity * 255;
        if (this.style.polygonFill === 'filled') {
            this.style.polygonFillColor = this.style.polygonColor;
        } else {
            this.style.polygonFillColor = [255, 255, 255, 0];
        }
    }
}