/** 普通的config
* date 2018-03-13
* author wolfsky7 -->------|----------------->
**/

var dbConfig=require('./db')
var redisConfig=require('./redis')
var logConfig=require('./log4js')

const app_env=0;//0 debug  1 release 2 pre



module.exports={
    isDebug:app_env==0,
    port:3000,
    dbConfig:getConfig(app_env,dbConfig),
    logConfig:getConfig(app_env,logConfig),
    redisConfig:getConfig(app_env,redisConfig),
}

function getConfig(app_env,config){
    switch (app_env) {
        case 0:
            return config.test;
        case 1:
            return config.pre;
        case 2:
            return config.real
    }
}