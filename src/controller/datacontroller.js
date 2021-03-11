
export default class DataController {
    constructor(data) {
        this.data = {
            nodes:new Array(),
            links:new Array()
        };
        this.newData=data
    }

    replaceData(data){
        this.data={
            nodes:new Array(),
            links:new Array()
        };
        this.newData=data;
        // this.idMapNode = new Map();
        // this.idMapLink = new Map();
        // this.nodeIdMapLinks = new Map();
        // this._initInternalDataStructure();
        // this._initInternalDataStructure();
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

