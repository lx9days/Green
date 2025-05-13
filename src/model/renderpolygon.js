import hexRgb from 'hex-rgb';
import { isFunction, computePolygon } from '../helper/util';
//渲染polygon对应deck中的polygon
export default class RenderPolygon {
    constructor(element, type,offset) {
        this.offset=offset;
        this.polygon = [];
        this.polygonType = type;
        this.origionElement = element;
        this.status=element.getStatus();
        this.style = {
            polygonColor: [255, 255, 255, 255],
            polygonShape: 'triangle',
            polygonFill: 'filled',
            polygonScale: 1,
            polygonFillColor: [255, 255, 255, 255],
            polygonOpacity:1
        }
        this._generateStyle();
        this._generatePolygon();
    }

    resetElement(element){
        this.id = element.getId();
        this.origionElement = element;
        this.status=element.getStatus();
        this.rebuild();
    }

    /**
     * 重构style and position
     */
    rebuild(){
        this._generateStyle();
        this._generatePolygon();
    }

    rebuildForCustomStyle(){
        this._generateStyle(true);
        this._generatePolygon();
    }

    /**
     * 重构位置
     */
    reLocation(){
        this._generatePolygon(this.origionElement,this.style.polygonShape,this.polygonType,this.offset);
    }

    /**
     * 更新状态
     */
    updateStatus(){
        this.status=this.origionElement.getStatus();
    }

    _generatePolygon(){
        this.polygon=computePolygon(this.origionElement,this.style.polygonShape,this.polygonType,this.offset);
    }
    _generateStyle(custom=false) {
        let styles;
        if(custom){
            if(!this.origionElement.useCustomStyle){
                return
            }
            styles=[this.origionElement.customStyle];
        }else{
            styles = this.origionElement.getStyles();
            if(this.origionElement.useCustomStyle){
                styles.push(this.origionElement.customStyle);
            }
        }

        if (this.polygonType === 'source') {
            styles.forEach((style) => {
                for (const item in style) {
                    switch (item.toLowerCase()) {
                        case 'from-arrow-color':
                            // const sourceArrowColorObj = style[item];
                            // let sourceArrowColorHex;
                            // if (isFunction(sourceArrowColorHex)) {
                            //     sourceArrowColorHex = sourceArrowColorObj(this.origionElement);
                            // } else {
                            //     sourceArrowColorHex = sourceArrowColorObj;
                            // }
                            // const sourceArrowColorRGB = hexRgb(sourceArrowColorHex);
                            // this.style.polygonColor[0] = sourceArrowColorRGB.red;
                            // this.style.polygonColor[1] = sourceArrowColorRGB.green;
                            // this.style.polygonColor[2] = sourceArrowColorRGB.blue;
                            break;
                        case 'from-arrow-shape':
                            const sourceArrowShapeObj = style[item];
                            if (isFunction(sourceArrowShapeObj)) {
                                this.style.polygonShape = sourceArrowShapeObj(this.origionElement);
                            } else {
                                this.style.polygonShape = sourceArrowShapeObj;
                            }
                            break;
                        case 'from-arrow-fill':
                            const sourceArrowFillObj = style[item];
                            if (isFunction(sourceArrowFillObj)) {
                                this.style.polygonFill = sourceArrowFillObj(this.origionElement);
                            } else {
                                this.style.polygonFill = sourceArrowFillObj;
                            }
                            break;
                        case 'from-arrow-scale':
                            const sourceArrowScaleObj = style[item];
                            if (isFunction(sourceArrowScaleObj)) {
                                this.style.polygonScale = sourceArrowScaleObj(this.origionElement);
                            } else {
                                this.style.polygonScale = sourceArrowScaleObj;
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
                            const sourceArrowColorObj = style[item];
                            let sourceArrowColorHex;
                            if (isFunction(sourceArrowColorHex)) {
                                sourceArrowColorHex = sourceArrowColorObj(this.origionElement);
                            } else {
                                sourceArrowColorHex = sourceArrowColorObj;
                            }
                            const sourceArrowColorRGB = hexRgb(sourceArrowColorHex);
                            this.style.polygonColor[0] = sourceArrowColorRGB.red;
                            this.style.polygonColor[1] = sourceArrowColorRGB.green;
                            this.style.polygonColor[2] = sourceArrowColorRGB.blue;
                            break;
                        default:
                            break;
                    }
                }
            });
        } else {
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
        }
        if(this.origionElement.useCustomStyle){
            styles.pop();
        }
        this.style.polygonColor[3]=this.style.polygonOpacity*255;
        if (this.style.polygonFill === 'filled') {
            this.style.polygonFillColor = this.style.polygonColor;
        } else {
            this.style.polygonFillColor = [255, 255, 255, 0];
        }
    }
}