const request =require('request')
exports.authUserBase=async function(code){
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+this.appid+'&secret='+this.appsecret+'&code='+code+'&grant_type=authorization_code';
    return new Promise((s,f)=>{
        request(url,(err,rs,body)=>{
            if(err)return f(err);
            return s(JSON.parse(body));
        })
    })
    
}

exports.authUserDetail= async function(code){
    const {openid}=await this.authUserBase(code);
    return this.getUser(openid);
}