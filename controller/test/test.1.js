/**
 * 简单的测试
 */

const router=new require('koa-router')()
const mongo=require('../../lib/easy-mogo')
const _map=require('lodash/map')
const fetch=require('../../lib/easy-test')
const request=require('request')

const getRandom=(n)=>{
  let s="";
  const str="asdfghjklmnopqrstuvwxyz";
  while(n){
    s += str[Math.floor(Math.random()*str.length)]
    n--;
  }
  return s;
}

router.get('/test/create',async ()=>{
  const [client,db]=await mongo.getConnect('mongo');
  db.collection('user').insertMany(_map(new Array(1),()=>{
    return {
      unm:getRandom(6),
      pwd:'123456'
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

router.get('/test/create1',async ()=>{
  const [client,db]=await mongo.getConnect('mongo');
  db.collection('user').insert(_map(new Array(10),()=>{
    return {
      username:getRandom(6),
      password:'123456'
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
  const rs=await fetch.post('/user/login',{
    unm:'asdf5',
    pwd:'12312'
  })
  console.log(rs);
  ctx.body='12312'
})
router.get('/testpost1',async ctx=>{
  const ims=[request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000)),request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000))];
    const form={
      formData:{
        token:'69777f809ed211e8bab867aafc5ac03f',
        images:ims,
        desc:'banner1',
        type:'banner'
      }
    }
   fetch.post('/home',form).then(rs=>{
    console.log(rs);
    ctx.body='12312'
    })
 
})
router.get('/testpost2',async ()=>{
  // let ims=[request.get("http://dummyimage.com/200x100/"+Math.floor(Math.random()*1000)),];
  // let form={
  //   formData:{
  //     token:'d3d950909ed411e88876a946b7ee902d',
  //     images:ims,
  //     desc:'banner1',
  //     type:'banner',
  //     _id:'5b7140a67db19c05f0280212'
  //   }
  // }
  // return fetch.put('/home',form).then(rs=>{
  //   expect(rs.status).toBe(0);
  // })
  fetch.get('/home/water',{
    token:'3e360ec09f6a11e8bf551f276c9ad6e4',
    skip:0,
    limit:5
  }).then(rs=>{
    console.log(rs);
    expect(rs.status).toBe(0);
  })
 
})

router.get('/testpost3',async ctx=>{
  const rs=await mongo.find('page',{
    _id:'5b7140a67db19c05f0280212'
  })

  console.log(rs.length);
  ctx.body=rs[0];
})


module.exports=router;