import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';
import Link from './link';
//
export default class RenderGroupText {
    constructor(element, offset) {
        this.id = element.getId();
        this.position = [0, 0];
        this.origionElement = element;
        this.text = '';
        this.status = element.getStatus();
        if (element instanceof Link) {
            this.offset = offset;
        }
        this.style = {
            textColor: [255, 255, 255, 255],
            textSize: 10,
            textOpacity: 1,
            shape: 'horizontal_rect',
            height: 0,
            textAnchor: 'middle',
            backgroundHeight: 0,
            backgroundWidth: 0,
            textAlignmentBaseline: 'top',
            borderWidth: 0
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

    rebuild() {
        this._generateStyle();
        this._generatePosition();
    }

    rebuildForCustomStyle() {
        this._generateStyle(true);
        this._generatePosition();
    }

    reLocation() {
        this._generatePosition();
    }

    updateStatus() {
        this.status = this.origionElement.getStatus();
    }

    _generatePosition() {
        //设计优化
        const elementPosition = this.origionElement.getLocation();
        this.position[0] = elementPosition.x;//+ this.style.height / 2+4;
        this.position[1] = elementPosition.y + this.style.borderWidth * 2 + this.style.backgroundHeight;
        this.style.textAnchor = 'start';
        this.style.textAlignmentBaseline = 'center';

    }

    _generateStyle(custom = false) {
        let styles;
        if (custom) {
            if (!this.origionElement.useCustomStyle) {
                return
            }
            styles = [this.origionElement.customStyle];
        } else {
            styles = this.origionElement.getStyles();
            if (this.origionElement.useCustomStyle) {
                styles.push(this.origionElement.customStyle);
            }
        }
        styles.forEach((style) => {
            for (const item in style) {
                switch (item.toLowerCase()) {
                    case 'text-color':
                        const textColorObj = style[item];
                        let textColorHex;
                        if (isFunction(textColorObj)) {
                            textColorHex = textColorObj(this.origionElement);
                        } else {
                            textColorHex = textColorObj;
                        }
                        const textColorRGB = hexRgb(textColorHex);
                        this.style.textColor[0] = textColorRGB.red;
                        this.style.textColor[1] = textColorRGB.green;
                        this.style.textColor[2] = textColorRGB.blue;
                        break;
                    case 'font-size':
                        const textSizeObj = style[item];
                        if (isFunction(textSizeObj)) {
                            this.style.textSize = textSizeObj(this.origionElement);
                        } else {
                            this.style.textSize = textSizeObj;
                        }
                        break;
                    case 'font-opacity':
                        const textOpacityObj = style[item];
                        if (isFunction(textOpacityObj)) {
                            this.style.textOpacity = textOpacityObj(this.origionElement);
                        } else {
                            this.style.textOpacity = textOpacityObj;
                        }
                        break;
                    case 'text':
                        const textObj = style[item];
                        if (isFunction(textObj)) {
                            this.text = textObj(this.origionElement);
                        } else {
                            this.text = textObj;
                        }
                        break;
                    case 'background-height':
                        const backgroundHeightObj = style[item];
                        if (isFunction(backgroundHeightObj)) {
                            this.style.backgroundHeight = backgroundHeightObj(this.origionElement)
                        } else {
                            this.style.backgroundHeight = backgroundHeightObj;
                        }
                        break;
                    case 'background-width':
                        const backgroundWidthObj = style[item];
                        if (isFunction(backgroundWidthObj)) {
                            this.style.backgroundWidth = backgroundWidthObj(this.origionElement)
                        } else {
                            this.style.backgroundWidth = backgroundWidthObj;
                        }
                        break;
                    case 'height':
                        const heightObj = style[item];
                        if (isFunction(heightObj)) {
                            this.style.height = heightObj(this.origionElement);
                        } else {
                            this.style.height = heightObj;
                        }
                        break;
                    // case 'border-width':
                    //     const borderWidthObj = style[item];
                    //     if (isFunction(borderWidthObj)) {
                    //         this.style.borderWidth = borderWidthObj(this.origionElement);
                    //     } else {
                    //         this.style.borderWidth = borderWidthObj;
                    //     }
                    //     break;
                    default:
                        break;
                }
            }
        });
        if (this.origionElement.useCustomStyle) {
            styles.pop();
        }
        this.style.textColor[3] = this.style.textOpacity * 255;
    }

}
