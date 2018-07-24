/** 一些启动需要的中间件
* date 2018-03-13
* author wolfsky7 -->------|----------------->
**/
const staticKoa=require('koa-static')
const bodyParser=require('koa-bodyparser')
const multer=require('koa-multer')
const querystring=require('querystring')

const uploads=multer({
    storage:multer.diskStorage({
        //设置上传后文件路径，uploads文件夹会自动创建。
        destination: function (req, file, cb) {
            cb(null, '../uploads')
        }, 
        //给上传文件重命名，获取添加后缀名
        filename: function (req, file, cb) {
            var fileFormat = (file.originalname).split(".");
            cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
        }
    }),
})

const route=require('koa-route')

module.exports=function(koa){
    
    //时间记录
    koa.use(async (ctx,next)=>{
        let start=Date.now();
        await next();
        let ms=Date.now()-start;
        ctx.set('X-Response-Time', ms + 'ms');
    })

    // 静态处理
    koa.use(staticKoa("./public"))

     // 上传
     koa.use(route.post('/upload',uploads.single("file"),(ctx,next)=>{
         ctx.body={
             file:ctx.req.body.filename
         }
     }));

    // 参数处理
    koa.use(bodyParser())

    // url 参数处理
    koa.use((ctx,next)=>{
        let query=ctx.request.querystring;
        if(!query)return next();
        
        let rs=querystring.parse(querystring.unescape(query));
        ctx.req.body=Object.assign(rs,ctx.req.body);
        next();
    })

   

    //错误处理
    koa.use(async (ctx,next)=>{
        try{
            await next();
        }
        catch(e){
            let rsType=ctx.request.type;
            let code=e.statusCode || e.status || 500;
            ctx.response.status=code;
            if(rsType=="json"){
                ctx.response.type="json";
                ctx.response.body={status:code,msg:e.message}
            }
            else{
                ctx.response.type = 'html';
                ctx.response.body = '<p>Something wrong, please contact administrator.</p>';
                ctx.app.emit('error', e, ctx);
            }
        }
    })
}