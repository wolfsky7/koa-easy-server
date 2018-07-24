/**
* 自动引入controller 下的文件
*  <>-----}|------------------------------->
* 
*/

const fs=require('fs');
const path=require('path')


let readFile=(file)=>{
  let rs=require(file);
  if(rs instanceof Array){
    return rs;
  }
  return[];
}

let readDir=(dir,cb)=>{
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
      // if(/\.js/.test(name)){
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

let getRoutes=(dir)=>{
  return new Promise((s)=>{
    readDir(dir,(routes)=>{
      s(routes)
    })
  })
}


module.exports=(koa,dir)=>{
  return new Promise((s)=>{
    let absolutedir=path.resolve(dir);
    getRoutes(absolutedir).then(routes=>{
      routes.forEach(route=>{
        koa.use(route)
      })
      s(routes);
    })
  })
  
}


