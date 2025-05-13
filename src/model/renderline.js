import hexRgb from 'hex-rgb';
import { isFunction,generateLinkLocation} from '../helper/util';


//渲染line 对应deck中的linelayer
export default class RenderLine {
    constructor(element,offset) {
        this.id = element.getId();
        this.sourcePosition = [0, 0];
        this.targetPosition = [0, 0];
        this.origionElement = element;
        this.origionElement._line=this;
        this.offset=offset;
        this.status=element.getStatus();
        this.style = {
            lineWidth: 1,
            lineColor: [255, 255, 255, 255],
            lineStyle: 'solid',
            lineOpacity: 1,
            sourceArrowColor: [255, 255, 255, 255],
            sourceArrowShape: 'none',
            sourceArrowFill: 'filled',
            sourceArrowScale: 1,
            targetArrowColor: [255, 255, 255, 255],
            targetArrowShape: 'none',
            targetArrowFill: 'filled',
            targetArrowScale: 1,
            direct:true,
        }
        this._generateStyle();
        this._generatePosition();
    }

    resetElement(element){
        this.id = element.getId();
        this.origionElement = element;
        this.status=element.getStatus();
        this.rebuild();
    }

    /**
     * 重构style和position
     */
    rebuild(){
        this._generateStyle();
        this._generatePosition();
    }

    rebuildForCustomStyle(){
        this._generateStyle(true);
        this._generatePosition();
    }

    /**
     * 重构position
     */
    reLocation(){
        this._generatePosition();
    }
    
    /**
     * 更新状态
     */
    updateStatus(){
        this.status=this.origionElement.getStatus();
    }

    _generatePosition(){
        generateLinkLocation(this.origionElement,this.offset,this);
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

        styles.forEach((style) => {
            for (const item in style) {
                switch (item.toLowerCase()) {
                    case 'width':
                        const lineWidthObj = style[item];
                        if (isFunction(lineWidthObj)) {
                            this.style.lineWidth = lineWidthObj(this.origionElement);
                        } else {
                            this.style.lineWidth = lineWidthObj;
                        }
                        break;
                    case 'line-color':
                        const lineColorObj = style[item];
                        let lineColorHex;
                        if (isFunction(lineColorObj)) {
                            lineColorHex = lineColorObj(this.origionElement);
                        } else {
                            lineColorHex = lineColorObj;
                        }
                        const lineColorRGB = hexRgb(lineColorHex);
                        this.style.lineColor[0] = lineColorRGB.red;
                        this.style.lineColor[1] = lineColorRGB.green;
                        this.style.lineColor[2] = lineColorRGB.blue;
                        break;
                    case 'line-opacity':
                        const lineOpacityObj = style[item];
                        if (isFunction(lineOpacityObj)) {
                            this.style.lineOpacity = lineOpacityObj(this.origionElement);
                        } else {
                            this.style.lineOpacity = lineOpacityObj;
                        }
                        break;
                    case 'line-style':
                        const lineStyleObj=style[item];
                        if(isFunction(lineStyleObj)){
                            this.style.lineStyle=lineStyleObj(this.origionElement);
                        }else{
                            this.style.lineStyle=lineStyleObj;
                        }
                        break;
                    case 'from-arrow-color':
                        const sourceArrowColorObj = style[item];
                        let sourceArrowColorHex;
                        if (isFunction(sourceArrowColorHex)) {
                            sourceArrowColorHex = sourceArrowColorObj(this.origionElement);
                        } else {
                            sourceArrowColorHex = sourceArrowColorObj;
                        }
                        const sourceArrowColorRGB = hexRgb(sourceArrowColorHex);
                        this.style.sourceArrowColor[0] = sourceArrowColorRGB.red;
                        this.style.sourceArrowColor[1] = sourceArrowColorRGB.green;
                        this.style.sourceArrowColor[2] = sourceArrowColorRGB.blue;
                        break;
                    case 'from-arrow-shape':
                        const sourceArrowShapeObj = style[item];
                        if (isFunction(sourceArrowShapeObj)) {
                            this.style.sourceArrowShape = sourceArrowShapeObj(this.origionElement);
                        } else {
                            this.style.sourceArrowShape = sourceArrowShapeObj;
                        }
                        break;
                    case 'from-arrow-fill':
                        const sourceArrowFillObj = style[item];
                        if (isFunction(sourceArrowFillObj)) {
                            this.style.sourceArrowFill = sourceArrowFillObj(this.origionElement);
                        } else {
                            this.style.sourceArrowFill = sourceArrowFillObj;
                        }
                        break;
                    case 'from-arrow-scale':
                        break;
                    case 'to-arrow-color':
                        const targetArrowColorObj = style[item];
                        let targetArrowColorHex;
                        if (isFunction(targetArrowColorHex)) {
                            targetArrowColorHex = targetArrowColorObj(this.origionElement);
                        } else {
                            targetArrowColorHex = targetArrowColorObj;
                        }
                        const targetArrowColorRGB = hexRgb(targetArrowColorHex);
                        this.style.targetArrowColor[0] = targetArrowColorRGB.red;
                        this.style.targetArrowColor[1] = targetArrowColorRGB.green;
                        this.style.targetArrowColor[2] = targetArrowColorRGB.blue;
                        break;
                    case 'to-arrow-shape':
                        const targetArrowShapeObj = style[item];
                        if (isFunction(targetArrowShapeObj)) {
                            this.style.targetArrowShape = targetArrowShapeObj(this.origionElement);
                        } else {
                            this.style.targetArrowShape = targetArrowShapeObj;
                        }
                        break;
                    case 'to-arrow-fill':
                        const targetArrowFillObj = style[item];
                        if (isFunction(targetArrowFillObj)) {
                            this.style.targetArrowFill = targetArrowFillObj(this.origionElement);
                        } else {
                            this.style.targetArrowFill = targetArrowFillObj;
                        }
                        break;
                    case 'to-arrow-scale':
                        break;
                    case 'direct':
                        const directObj=style[item];
                        if(isFunction(directObj)){
                            this.style.direct=directObj(this.origionElement)
                        }else{
                            this.style.direct=true;
                        }
                        break;
                    default:
                        break;

                }
            }
        });
        if(this.origionElement.useCustomStyle){
            styles.pop();
        }
        this.style.lineColor[3]=this.style.lineOpacity*255;
    }
}