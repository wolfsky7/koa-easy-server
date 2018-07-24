const Koa = require('koa');
const app = new Koa();

const config = require('./config/config')
let AppStart=require('./app_start/koa')
let autoroute=require('./router')


app.use((ctx,next)=>{
  console.log(ctx.request.url)
  return next();
})

// error
app.on('error',(err)=>{
  console.error()
  console.error(err);
})

AppStart(app);

autoroute(app,'./controller').then(()=>{
  //404
  app.use((ctx)=>{
    ctx.body="404"
  })
})


// app.use((ctx,next)=>{
//   ctx.throw(500);
// })



module.exports=()=>{
  app.listen(config.port);
}

// app.listen(config.port);