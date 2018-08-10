/**
* test
*  <>-----}|------------------------------->
* 
*/
const router=new require('koa-router')()
const pick = require('lodash/pick')


/**
 * 首页
 * @keyword string 关键字 @@{maxLength:10,minLength:2,required:1}
 * @response
 *  
 */
router.get('/',(ctx)=>{
  ctx.body=ctx.request.body||"home"
})

/**
 * 获取首页数据
 */
router.get('/home',async ctx=>{
  await mongo.execute(async ([,db])=>{
    let banners=await mongo.find('page',{
      type:'banner'
    })

    let flows=await mongo.page('page',{type:'water'},db,20,0);

    ctx.body={
      banners:banners,
      waters:flows,
    }
  })
})

/**
 * 获取瀑布流数据
 * @skip @@{num:1}
 * @limit @@{num:1}
 */
router.get('/home/water',async ctx=>{
  const {skip=0,limit=20}=ctx.request.post||{};
  let flows=await mongo.page('page',{type:'water'},db,limit,skip);
  ctx.body=flows;
})

/**
 * 新增
 * @image @@{required:1}
 * @desc @@{maxLength:50}
 * @type @@{required:1,reg:banner|water}
 */
router.post('/home',async (ctx)=>{
  await mongo.execute(async ([,db])=>{
    const post=ctx.request.body;
    const sess=ctx.request.sess;
    await mongo.insert('page',{
      path:post.image.filename,
      desc:post.desc,
      type:post.type,
      createId:sess.user._id,
      createTime:Date.now(),
    },db)
  })
})

/**
 * 修改
 * @_id @@{required:1}
 */
router.put('/home',async ctx=>{
  await mongo.execute(async ([,db])=>{
    const post=ctx.request.body;
    const sess=ctx.request.sess;
    let ps=pick(post.body,['desc','type'])
    if(post.image){
      ps.path=post.image.filename
    }
    if(!Object.keys(ps).length){
      return Promise.reject('上传需要修改的数据') 
    }
    ps.updateTime=Date.now();
    ps.updateId=sess.user._id;
    await mongo.update('page',{
      _id:post._id
    },ps,db)
  })
})

/**
 * 删除
 * 
 */
router.delete('/home',async ctx=>{
  await mongo.execute(async ([,db])=>{
    const post=ctx.request.body;
    await mongo.delete('page',{
      _id:post._id
    },db)
  })
})


module.exports=router;

