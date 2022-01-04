
import hexRgb from 'hex-rgb';
import { isFunction } from '../helper/util';
export default class SuperRenderNodeLabel {
    constructor(element) {
        this.id = element.getId();
        this.position = [0, 0];
        this.origionElement = element;
        this.text = '';
        this.status = element.getStatus();
        this.style = {
            textColor: [255, 255, 255, 255],
            labelBackground: [255, 255, 255, 255],
            textSize: 10,
            textOpacity: 1,
            shape: 'rect',
            height: 0,
            textAnchor: 'middle',
            backgroundHeight: 0,
            backgroundWidth: 0,
            textAlignmentBaseline: 'top',

        }
        this._generateStyle();
        this._generatePosition();

    }

    rebuild() {
        this._generateStyle();
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

        this.position[0] = elementPosition.x + this.style.backgroundWidth / 2
        this.position[1] = elementPosition.y - (this.style.backgroundHeight - this.style.height) / 2 - 3;
        this.style.textAnchor = 'start';
        this.style.textAlignmentBaseline = 'bottom';



    }

    _generateStyle() {

        const styles = this.origionElement.getStyles();

        styles.forEach((style) => {
            for (const item in style) {
                switch (item.toLowerCase()) {
                    case 'label-text-color':
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
                    case 'label-font-size':
                        const textSizeObj = style[item];
                        if (isFunction(textSizeObj)) {
                            this.style.textSize = textSizeObj(this.origionElement);
                        } else {
                            this.style.textSize = textSizeObj;
                        }
                        break;
                    case 'node-label-text':
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
                    case 'node-label-background':
                        const labelBackgroundObj = style[item];
                        let labelBackgroundHex;
                        if (isFunction(labelBackgroundObj)) {
                            labelBackgroundHex = labelBackgroundObj(this.origionElement);
                        } else {
                            labelBackgroundHex = labelBackgroundObj;
                        }
                        const labelBackgroundRGB = hexRgb(labelBackgroundHex);
                        this.style.labelBackground[0] = labelBackgroundRGB.red;
                        this.style.labelBackground[1] = labelBackgroundRGB.green;
                        this.style.labelBackground[2] = labelBackgroundRGB.blue;
                    default:
                        break;
                }
            }
        });
        this.style.textColor[3] = this.style.textOpacity * 255;
    }
}