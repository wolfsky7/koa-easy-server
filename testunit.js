/**
 * 单元测试的自动生成
 * 
 */
const path=require('path')
const fs=require('fs')
const autoroute=require('./doc')

const appendField="\t\t//{append}"

const getTotalTemplate=(desc,rawName)=>{
  //describe('用户模块',()=>{
  //})
  const absoname=path.relative(path.resolve(rootPath),rawName);
  let p="";
  for(var i=0, count=absoname.split('\\').length;i<count-1;i++){
    p += "../"
  }
  return "const fetch=require('"+p+"../lib/easy-test')\n"+
  "describe('"+desc+"',()=>{\n"+
  appendField+
  "\n})";
}



 const getRouteTemplate=()=>{
  // test('{desc}',()=>{
  //   return fetch.{method}('{routeName}',{data}).then(rs=>{
  //     expect(rs.status).toBe(0);
  //   })
  // })
  let temp="\t\ttest('{desc}',()=>{\n"+
    "\t\t\treturn fetch.{method}('{routeName}',{data}).then(rs=>{\n"+
    "\t\t\t\texpect(rs.status).toBe(0);\n"+
    "\t\t\t})\n"+
    "\t\t})";
  
  return temp;
  return Promise.resolve(temp)
 }

 const compileTemplate=(template,{routeName,method,desc,fields})=>{
  if(!Array.isArray(template)){
    template=[template]
  }

  return template.map(item=>{
    //method
    let bs=item.replace(/\{routeName\}/g,routeName);
    bs=bs.replace(/\{method\}/g,method);
    bs=bs.replace(/\{desc\}/g,desc);
    let data="null";
    if(fields&&fields.length){
      data="{"+fields.reduce((last,now)=>{
        last +=now+":Math.random(),"
        return last;
      },"")+"}"
    }
    bs=bs.replace(/{data}/g,data);
    return bs;
  }).join('\n')
 }

 const testDoc=(apis,checkApi=()=>false)=>{
  const appends=[];
  apis.forEach(api=>{
    let [route,method]=api.apiname.split('<--->')
    let reg=new RegExp(`fetch\\.${method}\\('${route}'`)
    if(!checkApi(reg)){
      appends.push(compileTemplate(getRouteTemplate(),{
        routeName:route,
        method:method,
        desc:api.__title._text.trim(),
        fields:Object.keys(api).filter(item=>item!='__title'&&item!='apiname'&&item!="response")
      }))
    }
  })

  if(appends.length){
    appends.push(appendField)
  }

  return appends.join(' \n');
 }

 const test=async ({rawName,apis,desc})=>{
  
    const fn=rawName.replace(".js",".test.js");
    
    let totals
    if(fs.existsSync(fn)){
      totals=await (0,()=>{
        return new Promise((s,f)=>{
          fs.readFile(fn,{encoding:'utf8'},(err,rs)=>{
            if(err){
              console.error(err);
              return s('');
            }
    
            appends=testDoc(apis,reg=>reg.test(rs))
            if(appends)
              s(rs.replace(appendField,appends))
            else s(rs);
          });
        })
        
      })()
    }
    else{
      let appends=testDoc(apis);
      totals=getTotalTemplate(desc.__title._text.trim(),rawName);
      totals=totals.replace(appendField,appends);
    }
    fs.writeFile(fn,totals,err=>{
      console.log(err);
    })
    
 }

 const rootPath='./src/controller'
 autoroute(rootPath).then(docs=>{
    docs.forEach(doc=>{
      if(doc)
        test(doc)
    })
 })