import Selection from '../ngss/selection';

export default class StyleController{

    constructor(style){
        this.styles=style;
    }

    addStyle(styles){
        if(styles&&styles.length>0){
            this.styles=[...this.styles,...styles];
        }
    }

    replaceStyle(styles){
        if(styles&&styles.length>0){
            this.styles=styles;
        }
    }

    getStyles(){
        return this.styles;
    }
    /**
     * 将styles 根据selecter挂载到对应的 node link 上
     * @param {*} nodes 
     * @param {*} links 
     */
    mountStyleToElement(nodes,links){
        //初始化选择器
        const selector=new Selection(nodes,links);
        if(this.styles&&this.styles.length>0){
            this.styles.forEach((style)=>{
                 const selectStr=style.selector;
                //使用选择器进行匹配
                 const selectResult=selector.select(selectStr);


                 if(selectResult.nodes.length>0){
                     selectResult.nodes.forEach((node)=>{
                         node.addStyle(style.style);
                     });
                 }
                 if(selectResult.links.length>0){
                     selectResult.links.forEach((link)=>{
                         link.addStyle(style.style);
                     });
                 }

            })
        }
    }

    
}