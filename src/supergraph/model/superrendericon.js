//import { hexRgb } from 'hex-rgb';
import { isFunction } from '../helper/util';
//渲染icon,对应deck中的IconLayer
export default class SuperRenderIcon {
    constructor(element) {
        this.id = element.getId();
        this.position = [0, 0];
        this.origionElement = element;
        this.url = '';
        this.status = element.getStatus();
        this.style = {
            iconWidth: 5,
            iconHeight: 5,
            iconSize: 6,
            iconOpacity: 1,
            iconColor: [255, 0, 0, 255],
            borderWidth: 0,
            backgroundWidth: 10,
            backgroundHeight:10,
            shape: 'rect'
        }

        this._generateStyle();
        this._generatePosition();
    }

    get data() {
        return this.origionElement.data;
    }
    rebuild() {
        this._generateStyle();
        this._generatePosition();
    }
    /**
     * 计算位置
     */
    reLocation() {
        this._generatePosition();
    }
    /**
     * 更新状态
     */
    updateStatus() {
        this.status = this.origionElement.getStatus();
    }
    _generatePosition() {
        const elementPosition = this.origionElement.getLocation();
        this.position[0] = elementPosition.x;
        this.position[1] = elementPosition.y;

    }

    /**
     * 将css样式解析为当前组件可用样式
     */
    _generateStyle() {

        const styles = this.origionElement.getStyles();


        styles.forEach((style) => {
            for (const item in style) {
                switch (item.toLowerCase()) {
                    case 'url':
                        const iconUrlObj = style[item];
                        if (isFunction(iconUrlObj)) {
                            this.url = iconUrlObj(this.origionElement);
                        } else {
                            this.url = iconUrlObj;
                        }
                        break;
                    case 'height':
                        const iconHeightObj = style[item];
                        if (isFunction(iconHeightObj)) {
                            this.style.iconHeight = iconHeightObj(this.origionElement);
                        } else {
                            this.style.iconHeight = iconHeightObj;
                        }
                        this.style.iconWidth = this.style.iconHeight;
                        this.style.iconSize = this.style.iconHeight;
                        break;
                    case 'opacity':
                        const iconOpacityObj = style[item];
                        if (isFunction(iconOpacityObj)) {
                            this.style.iconOpacity = iconOpacityObj(this.origionElement);
                        } else {
                            this.style.iconOpacity = iconOpacityObj;
                        }
                        break;
                    case 'shape':
                        const shapeObj = style[item];
                        if (isFunction(shapeObj)) {
                            this.style.shape = shapeObj(this.origionElement);
                        } else {
                            this.style.shape = shapeObj;
                        }
                        break;
                    case 'background-width':
                        const backgroundWidthObj = style[item];
                        if (isFunction(backgroundWidthObj)) {
                            this.style.backgroundWidth = backgroundWidthObj(this.origionElement)
                        } else {
                            this.style.backgroundWidth = backgroundWidthObj;
                        }
                        this.style.backgroundHeight=this.style.backgroundWidth;
                        break;
                    default:
                    //console.error(`存在无法识别结点样式${item}`);
                }
            }
        });
        this.style.iconColor[3] = this.style.iconOpacity * 225;
    }
}