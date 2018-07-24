/**
* test
*  <>-----}|------------------------------->
* 
*/
const route=require('koa-route')

module.exports=[
  route.get('/home',(ctx)=>{
    ctx.body=ctx.req.body||"home"
  }),
  route.get('/home/hello',(ctx)=>{
    ctx.body="hello"
  })
]

