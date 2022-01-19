export default class EventController {
    constructor() {
        this.events = new Map();
        this.eventSubId = -1;
    }
    //触发事件
    fire(eventName,args){
         setTimeout(()=>{
            if(!this.events.has(eventName)){
                return false;
            }
            const evs=this.events.get(eventName);

            evs.forEach((ev)=>{
                ev.func(...args);

            });
         },50);
        return this;
    }
    //订阅事件
    subscribe(eventName, func) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Array());
        }

        const token=(++this.eventSubId).toString();
        this.events.get(eventName).push({
            token,
            func
        });
        return token;
    }
    //通过事件token 取消订阅事件
    unSubscribe(token){
        for(const key of this.events.keys()){
            const evs=this.events.get(key);
            for(let i=0,j=evs.length;i<j;i++){
                if(evs[i].token===token){
                    evs.splice(i,1);
                    return token;
                }
            }
        }
        return this;
    }
    //通过事件name 取消订阅
    unSubscribeByName(eventName){
        if(this.events.has(eventName)){
            this.events.delete(eventName);
        }
    }
}