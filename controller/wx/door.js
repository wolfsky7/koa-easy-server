/**
* 微信 公众号 开发 相关 
* 
*  <>-----}|------------------------------->
* 
*/
const router=new require('koa-router')();
const redis=require('../../lib/easy-share')

const wxAuth=require('../../lib/wx-auth')
const WechatAPI = require('co-wechat-api');
WechatAPI.mixin(wxAuth)

const {appId,appToken,wap}=require('../../config/config').WX;

const API=new WechatAPI(appId,appToken,async ()=>{
    const rs=await redis().redis().getAsync('wxToken')
    if(rs){
        return JSON.parse(rs)
    }
    return null;
},async token=>{
    redis().redis().setAsync('wxToken',JSON.stringify(token))
})

// js sdk ticket
API.registerTicketHandle(async ()=>{
    const rs=await redis().redis().getAsync('wxjSTicket')
    if(rs){
        return JSON.parse(rs)
    }
    return null;
},async (type, ticketToken)=>{
    redis().redis().setAsync('wxjSTicket',JSON.stringify(ticketToken))
})

const auth=async ctx=>{
    const {code}=ctx.request.body;
    const rn=ctx.params&&ctx.params.rn;
    const rs=await API.authUserBase(code);
    // const str=rs.toString()
    if(rs.openid){
        ctx.redirect(`${wap}${rn?("/"+rn.replace(/$/g,'\/')):""}?openid=${rs.openid}`)
    }
    else{
        ctx.body=rs;
    }
}

/**
 * 授权
 */
router.get('/wx/door/auth/:rn',async (ctx)=>{
   await auth(ctx);
})
router.get('/wx/door/auth',async (ctx)=>{
    await auth(ctx);
 })
 router.get('/wx/door/auth_d',async (ctx)=>{
    const {code}=ctx.request.body;
    const rn=ctx.params&&ctx.params.rn;
    const rs=await API.authUserBase(code);
    ctx.body=rs;
 })

/**
 * js sdk 授权
 */
router.get('/wx/door/jsapi',async ctx=>{
    const {url,debug,jsApiList}=ctx.request.body;
    const config=await API.getJsConfig({
        debug,url,jsApiList
    })
    ctx.body=config;
})

module.exports=router;