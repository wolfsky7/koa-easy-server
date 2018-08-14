/**
* test
*  <>-----}|------------------------------->
* 
*/
const router=new require('koa-router')()
const pick = require('lodash/pick')
const mongo=require('../lib/easy-mogo')
const Pages=require('../graphql/page')


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
    const banners=await mongo.find('page',{
      type:'banner'
    })

    const flows=await mongo.page('page',{type:'water'},db,20,0);

    ctx.body={
      banners:banners,
      waters:flows
    }
  })
})

/**
 * 获取瀑布流数据
 * @skip @@{num:1}
 * @limit @@{num:1}
 */
router.get('/home/water',async ctx=>{
  const {skip=0,limit=20,format}=ctx.request.body||{};
  const flows=await mongo.page('page',{type:'water'},null,+limit,+skip);
  if(format)
    ctx.request._schema=Pages(flows)
  ctx.body=flows;
})

/**
 * 新增
 * @images @@{required:1}
 * @desc @@{maxLength:50}
 * @type @@{required:1,reg:banner|water}
 */
router.post('/home',async (ctx)=>{
  const post=ctx.request.body;
  if(!post.images.length){
    return Promise.reject('请上传图片')
  }
  await mongo.execute(async ([,db])=>{
    
    const sess=ctx.request.sess;
    const rs=await mongo.insert('page',{
      path:post.images[0],
      desc:post.desc,
      type:post.type,
      createId:sess.user._id,
      createTime:Date.now()
    },db)

    ctx.body={insertId:rs.insertedIds[0].toString()};
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
    const ps=pick(post,['desc'])
    if(post.images){
      ps.path=post.images[0]
    }
    if(!Object.keys(ps).length){
      return Promise.reject('上传需要修改的数据') 
    }
    ps.updateTime=Date.now();
    ps.updateId=sess.user._id
    
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
    await mongo.del('page',{
      _id:post._id
    },db)
  })
})


module.exports=router;

