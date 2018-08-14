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
const Sess=require("../lib/easy-sess")
const excepts=require('./expectRouter')
const uploadPaths=require('./uploadRouter')
const fs=require('fs')
const {graphql}=require('graphql')

const uploadsDir="../uploads"
const uploads=multer({
    storage:multer.diskStorage({
        //设置上传后文件路径，uploads文件夹会自动创建。
        destination: function (req, file, cb) {
            cb(null,uploadsDir)
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
    koa.use(staticKoa(uploadsDir))

     // body参数处理
     koa.use(bodyParser())

    // 上传
    // 检测uploads
    if(!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir)
    }

    // 上传使用的是 req.body
    koa.use((ctx,next)=>{
        ctx.req.body=ctx.request.body;
        return next();
    })
    // koa.use(uploads.single('image'))
    // 根据url 来判断single 或者 array
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
        ctx.request.body=Object.assign(ctx.request.body,ctx.req.body);
        if(files&&files.length){
            let fa=ctx.request.body[files[0].fieldname]=[]
            files.forEach(file=>{
                fa.push(file.path.replace(/[\w\W]*uploads\\/,""))
            })
            // 如果出错了 就把 图片删除
            ctx.req.filesInErrRemove=true;
        }
        
        let query=ctx.request.querystring;
        if(!query)return next();
        
        let rs=querystring.parse(querystring.unescape(query));
        ctx.request.body=Object.assign(rs,ctx.request.body);
        return next();
    })

    //graphql 处理
    // 只是用graphql 格式化输出
    koa.use(async (ctx,next)=>{
        await next();
        let post=ctx.request.body;
        // query 类似 {hi} 
        if(post.format&&post.format[0]=="{"){
            // schema 对应接口标识
            if(ctx.request._schema){
                // 传入数据格式
                graphql(ctx.request._schema,post.format).then(rs=>{
                    if(!rs.error)
                    ctx.body.rows=rs.data.rows;
                })
            }
        }
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
            if(ctx.req.filesInErrRemove){
                // 图片移除
                ctx.req.files.forEach(file=>{
                    fs.unlink(path.join(uploadsDir,file.filename),(err)=>{
                        if(err){
                            __g_log.error(err)
                        }
                    })
                })
            }
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
        let sess=null
        if(post&&post.token){
           sess=new Sess(post.token,redis.redis());
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
        if(!sess){
            sess=new Sess('',redis.redis())
        }

        ctx.request.sess=sess;
        return next();
    })

   
}