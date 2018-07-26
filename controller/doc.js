/**
* doc
*  <>-----}|------------------------------->
* 
*/

const router=new require('koa-router')()




router.get('/doc',(ctx)=>{
  ctx.render('doc/index',{
    docs:[{
      __title:'h1',
      apiname:'/home',
      hello:'asdf',
      hell:'dfd'
    },{
      __title:'h1',
      apiname:'/home',
      hello:'asdf',
      hell:'dfd'
    },{
      __title:'h1',
      apiname:'/home',
      hello:'asdf',
      hell:'dfd',
      response:'asdfasdfasdf'
    }]
  })
})

module.exports=router;