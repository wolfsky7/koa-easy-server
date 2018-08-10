/**
* doc
*  <>-----}|------------------------------->
* 
*/

const router=new require('koa-router')()
const apiData=require('../public/api.json')



router.get('/doc',(ctx)=>{
  __g_log.info('doc')
  ctx.render('doc/index',apiData)
})

/**
 * test
 * @he @@{required:1,num:1}
 */
router.get('/doc/test',ctx=>{
  ctx.body="123";
})

module.exports=router;