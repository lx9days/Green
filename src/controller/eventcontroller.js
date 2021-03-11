export default class EventController {
    constructor() {
        this.events = new Map();
        this.eventSubId = -1;
    }

    fire(eventName,args){
        // setTimeout(()=>{
            if(!this.events.has(eventName)){
                return false;
            }
            const evs=this.events.get(eventName);

            evs.forEach((ev)=>{
                ev.func(args);
            });
        // },100);
        return this;
    }

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

    unSubscribeByName(eventName){
        if(this.events.has(eventName)){
            this.events.delete(eventName);
        }
    }
}