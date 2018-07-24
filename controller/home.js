/**
* test
*  <>-----}|------------------------------->
* 
*/
const route=require('koa-route')

module.exports=[
  route.get('/home',(ctx,next)=>{
    ctx.body=ctx.req.body||"home"
  }),
  route.get('/home/hello',(ctx,next)=>{
    ctx.body="hello"
  }),
]

