/**
* test
*  <>-----}|------------------------------->
* 
*/
const router=new require('koa-router')()


/**
 * 首页
 * @keyword string 关键字 @@{maxLength:10,minLength:2,required:1}
 * @response
 *  
 */
router.get('/home',(ctx)=>{
  ctx.body=ctx.req.body||"home"
})

/**
 * @api hello
 * @h1 @@{required:1,maxLegth:20}
 * @h2 @@{minLength:4}
 */
router.get('/home/hello',(ctx)=>{
  ctx.body="hello"
})

/**
 * @api hi
 */
router.get('/home/hi',(ctx)=>{
  ctx.body='hi'
})

module.exports=router;

