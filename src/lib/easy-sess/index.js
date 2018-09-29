/**
 * 简易的session
 */

 class EasySess{
   constructor(sid,store){
    this.sid=sid;
    this.store=store;
    if(sid)
      this.init();
    else{
      this._initState={}
    }
   }
   async init(){
     
    let rs=await this.store.getAsync(this.sid);
    if(rs){
      try{
        rs=JSON.parse(rs);
        this._initState=rs;
      }
      catch(e){
        console.error(e);
      }
    }
    if(!rs){
      rs={
        create:Date.now()
      }
    }
    Object.keys(rs).forEach(key=>this[key]=rs[key])
   }
   setSid(sid){
     this.sid=sid;
   }
   async save(expire){
     const {save,sid,store,setSid,init,_initState,...others}=this;
     let ks=Object.keys(others)
     let changed=ks.length!==Object.keys(this._initState).length
     if(!changed){
        for(let i=0,len=ks.length;i<len;i++){
          if(changed=(others[ks[i]]!=this._initState[ks[i]])){
            break
          }
        }
     }
     if(changed){
        let ps=[this.sid,JSON.stringify(others)]
        if(expire){
          ps.push('EX',expire)
        }
       this.store.setAsync.apply(this.store,ps).then(()=>{
         this.changed=false;
         return Promise.resolve(true)
       });

     }
       
      return Promise.resolve(true);
   }
 }

 module.exports=EasySess;