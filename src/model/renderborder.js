import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';

//渲染border元素，对应着deck中的border
export default class RenderBorder {
    constructor(element) {
        this.id = element.getId();
        this.position = [0,0];
        this.origionElement = element;
        this.status=element.getStatus();
        this.shapeType=0;//0 圆形 1圆角矩形
        this.style = {
            backgroundWidth: 10,
            backgroundHeight: 10,
            backgroundColor: [255, 255, 255, 255],
            backgroundOpacity: 1,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: [255, 255, 255, 255],
            borderOpacity: 1,

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
     * 重新挂载样式和计算位置
     */
    rebuild() {
        this._generateStyle();
        this._generatePosition();
    }

    rebuildForCustomStyle(){
        this._generateStyle(true);
        this._generatePosition();
    }

    /**
     * 重新计算位置
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

    /**
     * 计算位置
     */
    _generatePosition() {
        const elementPosition=this.origionElement.getLocation();
        this.position[0] =elementPosition.x+ this.style.backgroundHeight / 2;
        this.position[1] =elementPosition.y+ this.style.backgroundHeight / 2;
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
                    case 'width':
                        const backgroundWidthObj = style[item];
                        if (isFunction(backgroundWidthObj)) {
                            this.style.backgroundWidth = backgroundWidthObj(this.origionElement);
                        } else {
                            this.style.backgroundWidth = backgroundWidthObj;
                        }
                        break;
                    case 'height':
                        const backgroundHeightObj = style[item];
                        if (isFunction(backgroundHeightObj)) {
                            this.style.backgroundHeight = backgroundHeightObj(this.origionElement);
                        } else {
                            this.style.backgroundHeight = backgroundHeightObj;
                        }
                        break;
                    case 'shape':
                        const backgroundShape=style[item];
                        if(isFunction(backgroundShape)){
                            if(backgroundShape(this.origionElement)==='rect'){
                                this.shapeType=1;
                            }else {
                                this.shapeType=0;
                            }
                        }else{
                            if(backgroundShape==='rect'){
                                this.shapeType=1;
                            }else{
                                this.shapeType=0;
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
        this.style.backgroundHeight=this.style.backgroundHeight+this.style.borderWidth
    }
}

