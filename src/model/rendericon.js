//import { hexRgb } from 'hex-rgb';
import {isFunction} from '../helper/util';

export default class RenderIcon{
    constructor(element){
        this.id=element.getId();
        this.position=[0,0];
        this.origionElement=element;
        this.url='';
        this.status=2;
        this.style={
            iconWidth:5,
            iconHeight:5,
            iconSize:6,
            iconOpacity:1,
            iconColor:[0,0,0,255],
            borderWidth:0,
        }

        this._generateStyle();
        this._generatePosition();
    }

    rebuild(){
        this._generateStyle();
        this._generatePosition();
    }
    reLocation(){
        this._generatePosition();
    }

    updateStatus(){
        this.status=this.origionElement.getStatus();
    }
    _generatePosition(){
        const elementPosition=this.origionElement.getLocation();
        this.position[0]=elementPosition.x+this.style.borderWidth/2;
        this.position[1]=elementPosition.y+this.style.borderWidth/2;
    }

    _generateStyle(){
        const styles=this.origionElement.getStyles();

        styles.forEach((style)=>{
            for(const item in style){
                switch (item.toLowerCase()){
                    case 'url':
                        const iconUrlObj=style[item];
                        if(isFunction(iconUrlObj)){
                            this.url=iconUrlObj(this.origionElement);
                        }else{
                            this.url=iconUrlObj;
                        }
                        break;
                    case 'height':
                        const iconHeightObj=style[item];
                        if(isFunction(iconHeightObj)){
                            this.style.iconHeight=iconHeightObj(this.origionElement);
                        }else{
                            this.style.iconHeight=iconHeightObj;
                        }
                        this.style.iconWidth=this.style.iconHeight;
                        this.style.iconSize=this.style.iconHeight;
                        break;
                    case 'opacity':
                        const iconOpacityObj=style[item];
                        if(isFunction(iconOpacityObj)){
                            this.style.iconOpacity=iconOpacityObj(this.origionElement);
                        }else{
                            this.style.iconOpacity=iconOpacityObj;
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
                    default:
                        //console.error(`存在无法识别结点样式${item}`);
                }
            }
        });
        this.style.iconColor[3]=this.style.iconOpacity*225;
    }




}