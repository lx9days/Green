import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';

//渲染border元素，对应着deck中的border
export default class RenderBackground {
    constructor(element) {
        this.id = element.getId();
        this.origionElement = element;
        this.status=element.getStatus();
        this.backgroundPolygon=[];
        this.position=[0,0];
        this.shapeType=0;//0 圆形 1圆角矩形 2矩形
        this.style = {
            backgroundWidth: 10,
            backgroundHeight: 10,
            backgroundColor: [255, 255, 255, 255],
            backgroundOpacity: 1,
            borderWidth: 20,
            borderStyle: 'solid',
            borderColor: [255, 255, 255, 255],
            borderOpacity: 1,
            width:8,
            height:8,
            circleHeight:20,

        }
        this._generateStyle();
        if(this.shapeType===2){
            this._generateBackgroundPolygon();
        }else{
            this._generatePosition();
        }
        
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
        if(this.shapeType===2){
            this._generateBackgroundPolygon();
        }else{
            this._generatePosition();
        }
    }
    rebuildForCustomStyle(){
        this._generateStyle(true);
        if(this.shapeType===2){
            this._generateBackgroundPolygon();
        }else{
            this._generatePosition();
        }
    }

    /**
     * 重新计算位置
     */
    reLocation(){
        if(this.shapeType===2){
            this._generateBackgroundPolygon();
        }else{
            this._generatePosition();
        }
    }

    /**
     * 更新状态
     */
    updateStatus(){
        this.status=this.origionElement.getStatus();
    }

    /**
     * 计算位置
     */
     _generatePosition() {
        const elementPosition=this.origionElement.getLocation();
        this.position[0] =elementPosition.x+ this.style.circleHeight / 2;
        this.position[1] =elementPosition.y+ this.style.circleHeight / 2;
    }

  

    _generateBackgroundPolygon(){
        const elementPosition=this.origionElement.getLocation();
        if(this.backgroundPolygon.length>0){
            this.backgroundPolygon=[];
        }
        const offset={
            x:(this.style.backgroundWidth-this.style.width)/2,
            y:(this.style.backgroundHeight-this.style.height)/2,
        }
        const polygonBasePosition={
            x:elementPosition.x-offset.x,
            y:elementPosition.y-offset.y
        }
        this.position[0]=polygonBasePosition.x;
        this.position[1]=polygonBasePosition.y;
        this.backgroundPolygon.push([polygonBasePosition.x,polygonBasePosition.y]);
        this.backgroundPolygon.push([polygonBasePosition.x+this.style.backgroundWidth,polygonBasePosition.y]);
        this.backgroundPolygon.push([polygonBasePosition.x+this.style.backgroundWidth,polygonBasePosition.y+this.style.backgroundHeight])
        this.backgroundPolygon.push([polygonBasePosition.x,polygonBasePosition.y+this.style.backgroundHeight]);
        
    }

    /**
     * 解析样式，将css样式规则解析为，当前组件可以的样式
     */
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
                    case 'background-color':
                        const backgroundColorObj = style[item];
                        let backgroundColorHex;
                        if (isFunction(backgroundColorObj)) {
                            backgroundColorHex = backgroundColorObj(this.origionElement);
                        } else {
                            backgroundColorHex = backgroundColorObj;
                        }
                        const backgroundColorRGB = hexRgb(backgroundColorHex);
                        this.style.backgroundColor[0] = backgroundColorRGB.red;
                        this.style.backgroundColor[1] = backgroundColorRGB.green;
                        this.style.backgroundColor[2] = backgroundColorRGB.blue;
                        break;
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
                    case 'border-color':
                        const borderColorObj = style[item];
                        let borderColorHex;
                        if (isFunction(borderColorObj)) {
                            borderColorHex = borderColorObj(this.origionElement);
                        } else {
                            borderColorHex = borderColorObj;
                        }
                        const borderColorRGB = hexRgb(borderColorHex);
                        this.style.borderColor[0] = borderColorRGB.red;
                        this.style.borderColor[1] = borderColorRGB.green;
                        this.style.borderColor[2] = borderColorRGB.blue;
                        break;
                    case 'border-opacity':
                        const borderOpacityObj = style[item];
                        if (isFunction(borderOpacityObj)) {
                            this.style.borderOpacity = borderOpacityObj(this.origionElement);
                        } else {
                            this.style.borderOpacity = borderOpacityObj;
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
                            this.style.circleHeight=heightObj(this.origionElement);
                        }else{
                            this.style.height=heightObj;
                            this.style.circleHeight=heightObj;
                        }
                        break;
                    case 'shape':
                        const backgroundShape=style[item];
                        if(isFunction(backgroundShape)){
                            const backgroundType=backgroundShape(this.origionElement)
                            if(backgroundType==='rounded_rect'){
                                this.shapeType=1;
                            }else if(backgroundType==='circle'){
                                this.shapeType=0;
                            }else{
                                this.shapeType=2;
                            }
                        }else{
                            if(backgroundShape==='rounded_rect'){
                                this.shapeType=1;
                            }else if(backgroundShape==='circle'){
                                this.shapeType=0;
                            }else{
                                this.shapeType=2;
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
        this.style.backgroundColor[3] = this.style.backgroundOpacity * 255;
        this.style.borderColor[3] = this.style.borderOpacity * 255;
        this.style.backgroundHeight=this.style.backgroundHeight+this.style.borderWidth;
        this.style.circleHeight=this.style.circleHeight+this.style.borderWidth;
    }
}

