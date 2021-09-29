//import Selection from '../ngss/selection';
import Selector from "../nges"

export default class StyleController{

    constructor(style){
        //this.styles=style;
        this.styles=[];
        this.newStyles=style;
    }

    addStyle(styles){
        if(styles&&styles.length>0){
            this.newStyles=[...this.newStyles,...styles];
           // this.styles=[...this.styles,...styles];
        }
    }

    replaceStyle(styles){
        if(styles&&styles.length>0){
            this.newStyles=styles;
            //this.styles=styles;
        }
    }

    getStyles(){
        //return this.styles;
        return [...this.styles,...this.newStyles]
    }
    /**
     * 将styles 根据selecter挂载到对应的 node link 上
     * @param {*} nodes 
     * @param {*} links 
     */
    mountStyleToElement(nodes,links){
        //初始化选择器
        const selector=new Selector(nodes,links);
        //const selector=new Selection(nodes,links);
        if(this.newStyles&&this.newStyles.length>0){
            
            this.newStyles.forEach((style)=>{
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
            this.styles=[...this.styles,...this.newStyles];
            this.newStyles=[];
        }
    }
    mountAllStyleToElement(nodes,links){
        //初始化选择器

        const selector=new Selector(nodes,links);
        //const selectResult=selector.select(selectStr);

        this.styles=[...this.styles,...this.newStyles];
        this.newStyles=[];
        //const selector=new Selection(nodes,links);
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