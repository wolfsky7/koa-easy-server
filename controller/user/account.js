/**
 * 账户相关
 */

const router=new require('koa-router')();
const mongo=require('../../lib/easy-mogo')
const {SESSION_EXPIRE}=require('../../constants')
const uuidv1=require('uuid/v1')

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
router.get('/user/register', (ctx,next)=>{
  // return next();
  // return ctx.throw('123123')
  return Promise.reject('123123');

  ctx.render('user/register')
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
    })
    user=user[0];
    if(!user){
      return Promise.reject('不正确的用户名或密码')
    }
    user.token=uuidv1().replace(/-/g,'');
    // token 存入redis
    await ctx.request.redis.redis().setAsync(user.token,JSON.stringify(user),'EX',SESSION_EXPIRE)

    // 限制多账号登陆
    let key=getKey(user._id,post._from);
    let lastLogin=ctx.request.redis.redis().getAsync(key);
    if(lastLogin){
      // 取消上次登陆
      await ctx.request.redis.redis().delAsync(lastLogin)
    }
    await ctx.request.redis.redis().setAsync(key,user.token,'EX',SESSION_EXPIRE)

    delete user._id;
    delete user.pwd;
    ctx.body=user;
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
      let user=await mongo.find('user',{
        unm:post.unm
      },db);
      if(user.length){
        return Promise.reject('用户名已存在')
      }
      await mongo.insert('user',{
        unm:post.unm,
        pwd:post.pwd,
        createTime:Date.now(),
        way:post._from||'web',
      },db)
    });
    
  })
  ctx.body={}
})

/**
 * 刷新用户信息
 * @token
 * @response
 *  {token,nickname,phone...}
 */
router.get('/user/profile',async ctx=>{

})

module.exports=router;