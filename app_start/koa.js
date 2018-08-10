/** 一些启动需要的中间件
* date 2018-03-13
* author wolfsky7 -->------|----------------->
**/
const staticKoa=require('koa-static')
const bodyParser=require('koa-bodyparser')
const multer=require('koa-multer')
const jade=require('koa-jade')
const path=require('path')
const querystring=require('querystring')
const router=new require('koa-router')()
const config=require('../config/config')
const share=require('../lib/easy-share')
const excepts=require('./expectRouter')
const uploadPaths=require('./uploadRouter')
const fs=require('fs')

const uploads=multer({
    storage:multer.diskStorage({
        //设置上传后文件路径，uploads文件夹会自动创建。
        destination: function (req, file, cb) {
            cb(null, '../uploads')
        }, 
        //给上传文件重命名，获取添加后缀名
        filename: function (req, file, cb) {
            var fileFormat = (file.originalname).split(".");
            cb(null, file.fieldname + '-' + Date.now() + "." + (fileFormat.length>1?fileFormat[fileFormat.length - 1]:"jpg"));
        }
    }),
    fileFilter:(req,file,next)=>{
        next(null,true)
    }
})

// redis config init
const redis=share(config.redis)

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
    koa.use(staticKoa("../uploads"))

     // body参数处理
     koa.use(bodyParser())

    // 上传
    // 检测uploads
    if(!fs.existsSync('../uploads')){
        fs.mkdirSync("../uploads")
    }

    // 上传使用的是 req.body
    koa.use((ctx,next)=>{
        ctx.req.body=ctx.request.body;
        return next();
    })
    // koa.use(uploads.single('image'))
    koa.use(uploads.array('images'))
       
    

    // 页面渲染
    let jd=new jade({
        viewPath:path.join(process.cwd(),'views'),
    })

    koa.use(async (ctx,next)=>{
        return jd.middleware.call(ctx,next).next().value();
    })


 

   

    // url 参数处理 及 文件上传的参数
    koa.use((ctx,next)=>{
        //uploads
        let files=ctx.req.files;
        if(files&&files.length){
            ctx.request.body[files[0].fieldname]=[]
            files.forEach(file=>{
                ctx.request.body.push(file.path.replace(/[\w\W]*uploads\\/,""))
            })
        }
        let query=ctx.request.querystring;
        if(!query)return next();
        
        let rs=querystring.parse(querystring.unescape(query));
        ctx.request.body=Object.assign(rs,ctx.request.body);
        return next();
    })
   

    // 错误处理
    // 标准输入输出
    koa.use(async (ctx,next)=>{
        try{
            await next();
            let rs=ctx.body;
            let isObj=typeof rs=='object'
            if(rs===undefined||rs===null||isObj){
                rs=rs||{status:0};
            }
            if(!rs.status){
                if(rs instanceof Array)
                    rs={
                        status:0,
                        rows:rs
                    }
                else if(isObj){
                    rs={
                        status:0,
                        result:rs
                    }
                }
            }
            if(rs!==undefined||rs!==null){
                ctx.body=rs;
            }
        }
        catch(e){
            let rsType=ctx.request.type;
            let code=e.statusCode || e.status || 500;
            ctx.response.status=code;
            let msg=typeof e=="string"?e:e.message;
            if(rsType=="html"){
                // ctx.response.type = 'html';
                // ctx.response.body = '<p>Something wrong, please contact administrator.</p>';
                ctx.render('500',{message:msg})
                ctx.app.emit('error', e, ctx);
            }
            else{
                ctx.type="json";
                // ctx.response.body={status:code,msg:msg}
                ctx.body={status:code,msg:msg}
               
            }
        }
    })



    // session 权限检测
    koa.use(async (ctx,next)=>{
        ctx.request.redis=redis;
        let post=ctx.request.body;
        if(post&&post.token){
            let sess=await redis.redis().getAsync(ctx.request.body.token)
            if(!sess||sess.isExpire){
                return Promise.reject('无效的token')
            }
        }
        else{
            let m=ctx.request.method.toLowerCase();
            let path=ctx.request.path;
            let canPass=false;
        
            for(let i=0,len=excepts.length;i<len;i++){
                let item=excepts[i]
                if(item===path){
                    canPass=true;
                    break;
                }
                if(item.path===path&&item.method==m){
                    canPass=true;
                    break;
                }
            }
            if(!canPass)
                return Promise.reject('无效的token')
        }
        return next();
    })

   
}