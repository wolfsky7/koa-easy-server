const request=require('request')
const querystring = require('querystring')
const path=require('path')

const host="http://localhost:3000"


module.exports=TestRouter=configRouter();

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
        url=(/\?/.test(url)?"&":"?")+querystring.stringify(body);
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


