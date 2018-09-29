/**
 * 账户相关
 */

const router=new require('koa-router')();
const mongo=require('../../lib/easy-mogo')
const {SESSION_EXPIRE}=require('../../constants')
const uuidv1=require('uuid/v1')
const _pick=require('lodash/pick')

/**
 * @forweb
 * 
 */
router.get('/user/login',(ctx)=>{
  ctx.render('user/login')
})

/**
 * @forweb
 */
router.get('/user/register', (ctx)=>{
  // return next();
  // return ctx.throw('123123')
  return Promise.reject('123123');

  // ctx.render('user/register')
})

/**
 * 注销
 * 
 */
router.post('/user/loginout',async ctx=>{
  await ctx.request.redis.redis().delAsync(user.token,getKey(ctx.request.sess.user._id,ctx.request.body._from));
  ctx.body={};
})


const getKey=(id,from)=>{
  return id+'-'+from;
}

const outUser=user=>{
  const {_id,pwd,...others}=user;
  return others;
}

/**
 * 登录
 * @unm @@{required:1,unm:1}
 * @pwd @@{required:1,pwd:1}
 * @_from 渠道默认web @@{required:1,reg:web|app|wx|wap}
 * @response
 *  {token,unm...}
 */
router.post('/user/login',async (ctx)=>{
  const post=ctx.request.body;

  await mongo.execute(async ([,db])=>{
    let user=await mongo.find('user',{
      unm:post.unm,
      pwd:post.pwd
    },db)
    user=user[0];
    if(!user){
      return Promise.reject('不正确的用户名或密码')
    }
    user._id=user._id.toString()
    user.token=uuidv1().replace(/-/g,'');
    // token 存入redis
    const sess=ctx.request.sess;
    sess.user=user
    sess.setSid(user.token)
    await sess.save(SESSION_EXPIRE)

    // 限制多账号登陆
    const key=getKey(user._id,post._from);
    const lastLogin=ctx.request.redis.redis().getAsync(key);
    if(lastLogin){
      // 取消上次登陆
      await ctx.request.redis.redis().delAsync(lastLogin)
    }
    await ctx.request.redis.redis().setAsync(key,user.token,'EX',SESSION_EXPIRE)

    ctx.body=outUser(user);
  })
})

/**
 * 注册
 * @unm @@{required:1,unm:1}
 * @pwd 密码 @@{required:1,minLength:5,maxLength:32} 直接md5 后上传
 * @response
 *  {statuse:0}
 */
router.post('/user/register',async ctx=>{
  const post=ctx.request.body;

  // 需要加锁
  await ctx.request.redis.lockAny('reg-'+post.unm,async ()=>{

    await mongo.execute(async ([,db])=>{
      // 检测唯一
      const user=await mongo.find('user',{
        unm:post.unm
      },db);
      if(user.length){
        return Promise.reject('用户名已存在')
      }
      await mongo.insert('user',{
        unm:post.unm,
        pwd:post.pwd,
        createTime:Date.now(),
        way:post._from||'web'
      },db)
    });
    
  })
  ctx.body={}
})

/**
 * 上传个人信息
 * @nickname @@{maxLength:20,minLength:2}
 * @desc @@{maxLength:200}
 * @image 头像
 * @token @@{required:1}
 */
router.post('/user/info',async ctx=>{
  let post = ctx.request.body;
  const fileds=['nickname','image','desc']
  post=_pick(post,fileds);
  if(!Object.keys(post).length){
    return Promise.reject('没有要修改的信息')
  }

  await mongo.execute(async ([,db])=>{
    await mongo.update('user',{
      _id:req.sess.user._id
    },post,db);
    let newU=await mongo.find('user',{
      _id:req.sess.user._id
    },db)
    newU=newU[0];
    if(!newU){
      return Promise.reject('无效的token')
    }
    await ctx.request.redis.redis().setAsync(newU.token,JSON.stringify(newU),'EX',SESSION_EXPIRE)

    ctx.body=outUser(newU);
  },'user')
})

/**
 * 刷新用户信息
 * @token
 * @response
 *  {token,nickname,phone...}
 */
router.get('/user/profile',async ()=>{

})

module.exports=router;