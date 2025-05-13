import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';

//渲染border元素，对应着deck中的border
export default class RenderMark {
    constructor(element) {
        this.id = element.getId();
        this.origionElement = element;
        this.status = element.getStatus();
        this.backgroundPolygon = [];
        this.shapeType = 0;//0 圆形 1圆角矩形 2矩形
        this.isHover=false;
        this.style = {
            backgroundWidth: 10,
            backgroundHeight: 10,
            selcetedHoverColor:[255,255,255,125],
            selectedHoverOpacity:0.5,
            unSelectedHoverColor:[255,255,255,125],
            unSelectedHoverOpacity:0.5,
            highLightColor:[255,255,255,125],
            highLightOpacity:0.5,
            borderWidth: 0,
            width:0,
            height:0
        }
        this._generateStyle();
        this._generateBackgroundPolygon();
    }

    resetElement(element){
        this.id = element.getId();
        this.origionElement = element;
        this.status=element.getStatus();
        this.rebuild();
    }
    /**
     * 重新挂载样式和计算位置
     */
    rebuild() {
        this._generateStyle();
        this._generateBackgroundPolygon();
    }

    rebuildForCustomStyle(){
        this._generateStyle(true);
        this._generateBackgroundPolygon();
    }

    /**
     * 重新计算位置
     */
    reLocation() {
        this._generateBackgroundPolygon();
    }

    /**
     * 更新状态
     */
    updateStatus() {
        this.status = this.origionElement.getStatus();
    }


    _generateBackgroundPolygon() {
        const elementPosition = this.origionElement.getLocation();
        if (this.backgroundPolygon.length > 0) {
            this.backgroundPolygon = [];
        }
        const offset = {
            x:(this.style.backgroundWidth-this.style.width)/2+this.style.borderWidth/2,
            y: (this.style.backgroundHeight-this.style.height)/2+this.style.borderWidth/2,
        }
        if(this.status===2||this.status===4){
            const polygonBasePosition = {
                x: elementPosition.x - offset.x-10,
                y: elementPosition.y - offset.y-10
            }
            this.backgroundPolygon.push([polygonBasePosition.x, polygonBasePosition.y]);
            this.backgroundPolygon.push([polygonBasePosition.x + this.style.backgroundWidth+20, polygonBasePosition.y]);
            this.backgroundPolygon.push([polygonBasePosition.x + this.style.backgroundWidth+20, polygonBasePosition.y + this.style.backgroundHeight+20])
            this.backgroundPolygon.push([polygonBasePosition.x, polygonBasePosition.y + this.style.backgroundHeight+20]);
        }else{
            const polygonBasePosition = {
                x: elementPosition.x - offset.x,
                y: elementPosition.y - offset.y
            }
            this.backgroundPolygon.push([polygonBasePosition.x, polygonBasePosition.y]);
            this.backgroundPolygon.push([polygonBasePosition.x + this.style.backgroundWidth, polygonBasePosition.y]);
            this.backgroundPolygon.push([polygonBasePosition.x + this.style.backgroundWidth, polygonBasePosition.y + this.style.backgroundHeight])
            this.backgroundPolygon.push([polygonBasePosition.x, polygonBasePosition.y + this.style.backgroundHeight]);
            
        }
        

    }

    /**
     * 解析样式，将css样式规则解析为，当前组件可以的样式
     */
    _generateStyle(custom) {
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
                    case 'background-opacity':
                        const backgroundOpacityObj = style[item];
                        if (isFunction(backgroundOpacityObj)) {
                            this.style.backgroundOpacity = backgroundOpacityObj(this.origionElement);
                        } else {
                            this.style.backgroundOpacity = backgroundOpacityObj;
                        }
                        break;
                    case 'border-width':
                        const borderWidthObj = style[item];
                        if (isFunction(borderWidthObj)) {
                            this.style.borderWidth = borderWidthObj(this.origionElement);
                        } else {
                            this.style.borderWidth = borderWidthObj;
                        }
                        break;
                    case 'background-width':
                        const backgroundWidthObj = style[item];
                        if (isFunction(backgroundWidthObj)) {
                            this.style.backgroundWidth = backgroundWidthObj(this.origionElement);
                        } else {
                            this.style.backgroundWidth = backgroundWidthObj;
                        }
                        break;
                    case 'background-height':
                        const backgroundHeightObj = style[item];
                        if (isFunction(backgroundHeightObj)) {
                            this.style.backgroundHeight = backgroundHeightObj(this.origionElement);
                        } else {
                            this.style.backgroundHeight = backgroundHeightObj;
                        }
                        break;
                    case 'width':
                        const widthObj=style[item];
                        if(isFunction(widthObj)){
                            this.style.width=widthObj(this.origionElement);
                        }else{
                            this.style.width=widthObj;
                        }
                        break;
                    case 'height':
                        const heightObj=style[item];
                        if(isFunction(heightObj)){
                            this.style.height=heightObj(this.origionElement);
                        }else{
                            this.style.height=heightObj;
                        }
                        break;
                    case 'hover-slected-color':
                        const selectedColorObj=style[item];
                        let colorHex;
                        if(isFunction(selectedColorObj)){
                            colorHex=selectedColorObj(this.origionElement);
                        }else{
                            colorHex=selectedColorObj;
                        }
                        const colorRGB=hexRgb(colorHex);
                        this.style.selcetedHoverColor[0]=colorRGB.red;
                        this.style.selcetedHoverColor[1]=colorRGB.green;
                        this.style.selcetedHoverColor[2]=colorRGB.blue;
                        break;
                    case 'hover-unselected-color':
                        const hoverUnselectedColorObj=style[item];
                        let unSelectedColorHex;
                        if(isFunction(hoverUnselectedColorObj)){
                            unSelectedColorHex=hoverUnselectedColorObj(this.origionElement);
                        }else{
                            unSelectedColorHex=hoverUnselectedColorObj;
                        }
                        const unSelectedColorRGB=hexRgb(unSelectedColorHex);
                        this.style.unSelectedHoverColor[0]=unSelectedColorRGB.red;
                        this.style.unSelectedHoverColor[1]=unSelectedColorRGB.green;
                        this.style.unSelectedHoverColor[2]=unSelectedColorRGB.blue;
                        break;
                    case 'highlight-color':
                        const highlightColorObj=style[item];
                        let highLightColorHex;
                        if(isFunction(highlightColorObj)){
                            highLightColorHex=highlightColorObj(this.origionElement);
                        }else{
                            highLightColorHex=highlightColorObj;
                        }
                        const highLightColorRGB=hexRgb(highLightColorHex);
                        this.style.highLightColor[0]=highLightColorRGB.red;
                        this.style.highLightColor[1]=highLightColorRGB.green;
                        this.style.highLightColor[2]=highLightColorRGB.blue;
                        break;
                    case 'hover-selected-opacity':
                        const selectedOpObj=style[item];
                        if(isFunction(selectedOpObj)){
                            this.style.selectedHoverOpacity=selectedOpObj(this.origionElement);
                        }else{
                            this.style.selectedHoverOpacity=selectedOpObj;
                        }
                        break;
                    case 'hover-unselected-opacity':
                        const unSelectedOpObj=style[item];
                        if(isFunction(unSelectedOpObj)){
                            this.style.unSelectedHoverOpacity=unSelectedOpObj(this.origionElement);
                        }else{
                            this.style.unSelectedHoverOpacity=unSelectedOpObj;
                        }
                        break;
                    case 'highlight-opacity':
                        const highOpObj=style[item];
                        if(isFunction(highOpObj)){
                            this.style.highLightOpacity=highOpObj(this.origionElement);
                        }else{
                            this.style.highLightOpacity=highOpObj;
                        }
                        break;
                    case 'shape':
                        const backgroundShape = style[item];
                        if (isFunction(backgroundShape)) {
                            const backgroundType = backgroundShape(this.origionElement)
                            if (backgroundType === 'rounded_rect') {
                                this.shapeType = 1;
                            } else if (backgroundType === 'circle') {
                                this.shapeType = 0;
                            } else {
                                this.shapeType = 2;
                            }
                        } else {
                            if (backgroundShape === 'rounded_rect') {
                                this.shapeType = 1;
                            } else if (backgroundShape === 'circle') {
                                this.shapeType = 0;
                            } else {
                                this.shapeType = 2;
                            }
                        }
                        break;
                    default:
                    //console.error(`存在无法识别结点样式${item}`);

                }
            }

        });
        if(this.origionElement.useCustomStyle){
            styles.pop();
        }
        this.style.selcetedHoverColor[3]=this.style.selectedHoverOpacity*255;
        this.style.unSelectedHoverColor[3]=this.style.unSelectedHoverOpacity*255;
        this.style.highLightColor[3]=this.style.highLightOpacity*255;
        //this.style.borderColor[3] = this.style.borderOpacity * 255;
        //this.style.backgroundHeight = this.style.backgroundHeight + this.style.borderWidth;
    }
}

