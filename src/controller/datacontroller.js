
export default class DataController {
    constructor(data) {
        this.data = {
            nodes:new Array(),
            links:new Array()
        };
        this.newData=data
    }
    //替换数据
    replaceData(data){
        this.data={
            nodes:new Array(),
            links:new Array()
        };
        this.newData=data;
    }
    getData() {
        return this.data;
    }

    // getDataByIds(ids){
    //     const tempData=[];
    //     if(ids&&ids.length>0){
    //         ids.forEach()
            
    //     }
    // }
    //只获取最新的数据
    getNewData(){
        if(this.newData){
            const newNodes=this.newData.nodes;
            const newLinks=this.newData.links;
            if(newNodes&&newNodes.length>0){
                newNodes.forEach((node)=>{
                    this.data.nodes.push(node);
                })
            }
            if(newLinks&&newLinks.length>0){
                newLinks.forEach((link)=>{
                    this.data.links.push(link);
                })
            }
        }
        const returnData=this.newData;
        this.newData={
            nodes:new Array(),
            links:new Array()
        }
        return returnData;
    }
    //获取所有的数据
    getAllData(){
        if(this.newData.nodes.length>0||this.newData.links.length>0){
            const newNodes=this.newData.nodes;
            const newLinks=this.newData.links;
            newNodes.forEach((node)=>{
                this.data.nodes.push(node);
            });
            this.newData.nodes=new Array();
            newLinks.forEach((link)=>{
                this.data.links.push(link);
            });
            this.newData.links=new Array();
        }
        return this.data;
    }
    //添加数据
    addData(data){
        if(data){
            const {nodes,links}=data;
            if(nodes&&nodes.length>0){
                nodes.forEach((node)=>{
                    this.newData.nodes.push(node);
                });
            }
            if(links&&links.length>0){
                links.forEach((link)=>{
                    this.newData.links.push(link);
                })
            }
        }

    }

    

}

