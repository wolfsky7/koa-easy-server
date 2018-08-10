const router=new require('koa-router')()
const mongo=require('../../lib/easy-mogo')
const _map=require('lodash/map')
const fetch=require('../../lib/easy-test')
const request=require('request')

const getRandom=(n)=>{
  let s="";
  let str="asdfghjklmnopqrstuvwxyz";
  while(n){
    s += str[Math.floor(Math.random()*str.length)]
    n--;
  }
  return s;
}

router.get('/test/create',async (ctx)=>{
  let [client,db]=await mongo.getConnect('mongo');
  db.collection('user').insertMany(_map(new Array(1),(item,index)=>{
    return {
      unm:getRandom(6),
      pwd:'123456',
    }
  }),(err,rs)=>{
    if(err){
      console.error(err)
    }
    else{
      console.log(rs);
    }

    client.close();
  })


})

router.get('/test/create1',async (ctx)=>{
  let [client,db]=await mongo.getConnect('mongo');
  db.collection('user').insert(_map(new Array(10),(item,index)=>{
    return {
      username:getRandom(6),
      password:'123456',
    }
  }),(err,rs)=>{
    if(err){
      console.error(err)
    }
    else{
      console.log(rs);
    }

    client.close();
  })


})

router.get('/testpost',async ctx=>{
  let rs=await fetch.post('/user/login',{
    unm:'asdf5',
    pwd:'12312'
  })
  console.log(rs);
  ctx.body='12312'
})
router.get('/testpost1',async ctx=>{
  let ims=[request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000)),request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000))];
    let form={
      formData:{
        images:ims,
        desc:'banner1',
        type:'banner',
      }
    }
   fetch.post('/home',form).then(rs=>{
    console.log(rs);
    ctx.body='12312'
    })
 
})


module.exports=router;