/**
* 自动引入controller 下的文件
* 自动加载字段验证规则
*  <>-----}|------------------------------->
* 
*/

const fs=require('fs');
const path=require('path')
const Router=require('koa-router')
const EasyCheck=require('easy-check')
const EasyNote=require('easy-note')


const readFile=(file)=>{
  if(/\.test\.js/.test(file)){
    // 测试文件
    return Promise.resolve(null)
  }

  let route=require(file)||{};
  
  if(route instanceof Router){
    analyRules(file)
    return new Promise(s=>{
      process.nextTick(()=>{
        s(route)
      })
    });
  }
  return Promise.resolve(null);
}

const noteOptions={
  // 匹配单个路由
  funcSingleRegex:[/\/\*[\w\W]+?\*\/[\w\W]*?router\.[\w\W]*?\([\w\W]*?,/],
  // 获取method-router
  getFunName:str=>{
    let method=/\.[\w\W]*?\(/.exec(str);
    if(method){
      method=method[0].slice(1,-1)
    }
    else{
      method=''
    }
    let action=str.replace(/[\w\W]*?\(/,'').replace(/['",]/g,'').trim();
    return action+'-'+method
  }
}

const analyRules=(file)=>{
  fs.readFile(file,'utf8',function(err,con){
    if(err)return;

    let note=EasyNote(con,noteOptions);
    // 形如 @@{maxLength:1,minLength:2,required:true}
    let reg=/@@\{.*?\}/;
    for(let a in note){
        let rules=[];
        if(a!="__title"){
            for(let f in note[a]){
                let ruleDesc=note[a][f]&&reg.exec(note[a][f]._text);

                ruleDesc=ruleDesc?ruleDesc[0]:null;
                if(!ruleDesc)
                    continue;
                try{
                    let _desc=/\{.*?:.*?\}/.exec(ruleDesc)[0].replace(/,/g,'","').replace(/\{/,'{\"').replace(/\}/,'\"}').replace(/:/g,'":"').replace('"[','["').replace(']"','"]');
                    ruleDesc=JSON.parse(_desc);
                    ruleDesc.key=ruleDesc.key||f;
                    rules.push(ruleDesc);
                }
                catch (e){
                    console.error(e);
                }
            }
        }

        _rules[a]=rules;
    }
  })
}

const readDir=(dir,cb)=>{
  let routes=[];
  let i=0;
  let resultCheck=()=>{
    if(i==0){
      cb(routes)
    }
  }
  fs.readdir(dir,(err,names)=>{
    names.forEach(name=>{
      i++;
      if(name.slice(-3,name.length)==".js"){
        readFile(path.join(dir,name)).then(rs=>{
          if(rs)
            routes=routes.concat(rs)
          i--;
          resultCheck();
        })
       
      }
      else{
        readDir(path.join(dir,name),(rs)=>{
          i--;
          routes=routes.concat(rs);
          resultCheck();
        })
      }
    })
  })

}

const getRoutes=(dir)=>{
  return new Promise((s)=>{
    readDir(dir,(routes)=>{
      s(routes)
    })
  })
}

// 字段验证规则
const _rules={}

const autoroute=(koa,dir)=>{


  // 字段验证
  koa.use(async (ctx,next)=>{
    let rk=`${ctx.request.path}-${ctx.request.method.toLowerCase()}`;
    let rules=_rules[rk];
    if(rules){
      return  EasyCheck.checkFields(ctx.request.body||{},rules).then(()=>next())
    }
    else return next();
  })

  return new Promise((s)=>{
    let absolutedir=path.resolve(dir);
    getRoutes(absolutedir).then(routes=>{
      routes.filter(r=>!!r).forEach(route=>{
        koa.use(route.routes())
      })
      s(routes);
    })
  })
  
}

module.exports=autoroute;

autoroute.__rules=_rules;


