const request=require('request')
const querystring = require('querystring')
const path=require('path')


const host="http://localhost:3000"


const buildReq=form=>{
  if(form&&form.formData){
    return {
      ...form,
    }

  }

  return {
    body:querystring.stringify(form||null),
    headers:{
      'content-type': 'application/x-www-form-urlencoded',
    }
  }
}

function configRouter(){
  const methods=['get','post','put','delete']

  function req(url,method,body){
    return new Promise((s,f)=>{
      if(method=="get"&&body!=null&&typeof body!='string'){
        url +=(/\?/.test(url)?"&":"?")+querystring.stringify(body);
        body=null;
      }

      if(url.slice(0,4)!='http'){
        url=host+path.join('/',url);
      }

      request({
        url:url,
        method:method,
        ...buildReq(body)
      },(err,res,body)=>{
        if(err)f(err)
        else{
          let rs;
          try{
            rs=JSON.parse(body)
          }
          catch(e){
            // console.error(e);
            rs={
              status:500,
              msg:body
            }
          }
          s(rs);
        }
      })
    })
  }

  let obj={}
  methods.forEach(method=>{
    obj[method]=(m=>{
      return (url,body)=>{
       return req(url,method,body)
      }
    })(method)
  })

  return obj;
}

const fetch=configRouter();

let __userToken={};
let __isGet=false;
const testLogin=(unm="asdf",pwd="12312")=>{
  if(__userToken[unm]){
    return Promise.resolve(__userToken[unm])
  }
  if(__isGet){
    return Promise.resolve((s,f)=>{
      setTimeout(()=>{
        s(testLogin(unm,pwd));
      },1000)
    })
  }
  __isGet=true
  return fetch.post('/user/login',{
    unm:unm,
    pwd:pwd,
  }).then(rs=>{
    console.log(rs);
    __isGet=false;
    __userToken[unm]=rs.result.token;
    return Promise.resolve(rs.result.token)
  })
}


module.exports={
  fetch:fetch,
  testLogin:testLogin
}

