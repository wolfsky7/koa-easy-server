/**
 * 文档的自动生成
 * 
 * 解析成
 * controller {}
 *  apis []
 *    {
 *       _title,
 *       apiname,
 *       rules,
 *       response
 *    }
 */


// 生成 data
const path=require('path')
const fs=require('fs');
const Router=require('koa-router')
const EasyNote=require('easy-note')

const readFile=(file)=>{
  if(/test\.js/.test(file)){
    // 测试文件
    return Promise.resolve(null)
  }
  let route=require(file)||{};
  if(route instanceof Router){
    return analyDocs(file)
  }
  return Promise.resolve(null);
}

const noteOptions={
  // 匹配单个路由
  // /* */router.[method]('routename',
  funcSingleRegex:[/\/\*[\w\W]+?\*\/[\w\W]*?router\.[\w\W]*?\([\w\W]*?,/],
  // 获取method-router
  getFunName:str=>{
    let method=/router\.[\w\W]*?\(/.exec(str);
    if(method){
      method=method[0].slice(7,-1)
    }
    else{
      method=''
    }
    let action=str.replace(/[\w\W]*\(/,'').replace(/['",]/g,'').trim();
    return action+'-'+method
  }
}

const analyDocs=(file)=>{
  return new Promise((s)=>{
    fs.readFile(file,'utf8',function(err,con){
      if(err)return;
  
      let note=EasyNote(con,noteOptions);
      // 形如 @@{maxLength:1,minLength:2,required:true}
      let controller={desc:{__title:{_text:''}},apis:[],rawName:file,name:file.replace(/[\w\W]*controller/g,'').slice(1)}
      Object.keys(note).forEach(key=>{
        if(key=="__title"){
          controller.desc=note[key]
          if(!Object.keys(controller.desc).length){
            controller.desc={
              __title:{
                _text:''
              }
            }
          }
        }
        else{
          if(!('forweb' in note[key]))
          controller.apis.push({
            ...note[key],
            apiname:key.replace(/-/g,'<--->')
          })
        }
      })
     
      s(controller)
    })
  })
}

const readDir=(dir,cb)=>{
  let docs=[];
  let i=0;
  let resultCheck=()=>{
    if(i==0){
      cb(docs)
    }
  }
  fs.readdir(dir,(err,names)=>{
    names.forEach(name=>{
      i++;
      if(name.slice(-3,name.length)==".js"){
        readFile(path.join(dir,name)).then(doc=>{
          docs.push(doc)
          i--;
          resultCheck();
        })
        
      }
      else{
        readDir(path.join(dir,name),(rs)=>{
          i--;
          docs=docs.concat(rs);
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

// doc
const _docs=[]


console.log()

const autoroute=(dir)=>{
  return new Promise((s)=>{
    let absolutedir=path.resolve(dir);
    getRoutes(absolutedir).then(routes=>{
      s(routes);
    })
  })
  
}


module.exports=autoroute;

if(process.env.NODE_ENV=="ENV")
  autoroute('./controller').then(docs=>{
    fs.writeFile("./public/api.json",JSON.stringify({docs:docs.filter(d=>!!d)}),{encoding:'utf8'});
    console.log('write end')
  })

