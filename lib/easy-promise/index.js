/** 简单的把函数 转成Promise
* date 2018-01-10
* author wolfsky7 -->------|----------------->
**/

module.exports=function(obj,argsExec){
    var keys=Object.keys(obj);
    argsExec=arguments[1]||(args=>args);
    for(var a in keys){
        if( obj[keys[a]] instanceof Function){
            funAsync(keys[a],obj[keys[a]],obj,argsExec);
        }
    }
}
function funAsync(funname,fun,obj,argsExec){
    obj[funname+'Async']=function(){
        var args=Array.prototype.slice.call(arguments,0),me=this;
        
        return new Promise((s,f)=>{
            args.push(function(err){
                if(err){
                    f(err);
                }
                else{
                    s(arguments[1]);
                }
            })
            args=argsExec(args);

            fun.apply(me,args);
        })
        
    }
}