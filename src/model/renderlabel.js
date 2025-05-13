//import { hexRgb } from 'hex-rgb';
import { isFunction } from '../helper/util';
//渲染icon,对应deck中的IconLayer
export default class RenderLabel {
    constructor(element) {
        this.id = element.getId();
        this.position = [0, 0];
        this.origionElement = element;
        this.url = '';
        this.status = element.getStatus();
        this.style = {
            iconWidth: 5,
            iconHeight: 5,
            width: 5,
            height: 5,
            iconSize: 6,
            backgroundHeight: 10,
            backgroundWidth: 10,
            labelPosition: "left-top"
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

    rebuildForCustomStyle(){
        this._generateStyle(true);
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
        const margin=2;
        const elementPosition = this.origionElement.getLocation();
        const originX = elementPosition.x - (this.style.backgroundWidth - this.style.width) / margin;
        const originY = elementPosition.y - (this.style.backgroundHeight - this.style.height) / margin;
        if (this.style.labelPosition === 'left-top') {
            this.position[0] = originX + margin;
            this.position[1] = originY + margin;
        } else if (this.style.labelPosition === 'right-top') {
            this.position[0] =originX+this.style.backgroundWidth-this.style.iconWidth-margin;
            this.position[1]=originY+margin;
        }else if(this.style.labelPosition==='left-bottom'){
            this.position[0]=originX+margin;
            this.position[1]=originY+this.style.backgroundHeight-this.style.iconHeight-margin;
        }else{
            this.position[0]=originX+this.style.backgroundWidth-this.style.iconWidth-margin;
            this.position[1]=originY+this.style.backgroundHeight-this.style.iconHeight-margin;
        }

    }

    /**
     * 将css样式解析为当前组件可用样式
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
                    case 'background-width':
                        const bgWObj = style[item];
                        if (isFunction(bgWObj)) {
                            this.style.backgroundWidth = bgWObj(this.origionElement);
                        } else {
                            this.style.backgroundWidth = bgWObj;
                        }
                        break;
                    case 'background-height':
                        const bgHObj = style[item];
                        if (isFunction(bgHObj)) {
                            this.style.backgroundHeight = bgHObj(this.origionElement);
                        } else {
                            this.style.backgroundHeight = bgHObj;
                        }
                        break;
                    case 'label-style':
                        const labelStyleObj = style[item];
                        this.url = labelStyleObj['url'];
                        this.style.iconWidth = labelStyleObj['width'];
                        this.style.iconHeight = labelStyleObj['height'];
                        this.style.iconSize = Math.min(labelStyleObj['width'], labelStyleObj['height']);
                        this.style.labelPosition = labelStyleObj['position'];
                        break;
                    case 'width':
                        const wObj = style[item];
                        if (isFunction(wObj)) {
                            this.style.width = wObj(this.origionElement);
                        } else {
                            this.style.width = wObj;
                        }
                        break;
                    case 'height':
                        const hObj = style[item];
                        if (isFunction(hObj)) {
                            this.style.height = hObj(this.origionElement);
                        } else {
                            this.style.height = hObj;
                        }
                        break;
                    default:

                }
            }
        });
        if(this.origionElement.useCustomStyle){
            styles.pop();
        }
    }
}