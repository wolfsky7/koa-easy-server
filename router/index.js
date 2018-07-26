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
  let route=require(file)||{};
  if(route instanceof Router){
    analyRules(file)
    return route;
  }
  return null;
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
                let ruleDesc=note[a][f]&&reg.exec(note[a][f]);

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
        routes=routes.concat(readFile(path.join(dir,name)))
        i--;
        resultCheck();
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

module.exports=(koa,dir)=>{

  // 验证
  koa.use((ctx,next)=>{
    let rk=`${ctx.request.path}-${ctx.request.method.toLowerCase()}`;
    let rules=_rules[rk];
    if(rules){
      return EasyCheck.checkFields(ctx.req.body||{},rules).then(()=>next()).catch(err=>{
        return Promise.reject(err);
      })
    }
    else next();
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


