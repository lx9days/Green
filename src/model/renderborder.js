import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';


export default class RenderBorder {
    constructor(element) {
        this.id = element.getId();
        this.position = [0,0];
        this.origionElement = element;
        this.status=2;
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

    rebuild() {
        this._generateStyle();
        this._generatePosition();
    }

    reLocation(){
        this._generatePosition();
    }

    updateStatus(){
        this.status=this.origionElement.getStatus();
    }

    _generatePosition() {
        const elementPosition=this.origionElement.getLocation();
        this.position[0] =elementPosition.x+ this.style.backgroundHeight / 2;
        this.position[1] =elementPosition.y+ this.style.backgroundHeight / 2;
    }

    _generateStyle() {
        const styles = this.origionElement.getStyles();

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
                    default:
                        //console.error(`存在无法识别结点样式${item}`);

                }
                if(this.style.backgroundWidth>0){
                    this.shapeType=1;
                }else{
                    this.shapeType=0;
                }
            }

        });
        this.style.backgroundColor[3] = this.style.backgroundOpacity * 255;
        this.style.borderColor[3] = this.style.borderOpacity * 255;
        this.style.backgroundHeight=this.style.backgroundHeight+this.style.borderWidth
    }
}

