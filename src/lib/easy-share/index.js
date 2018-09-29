/** 设置 共享内存   基于redis
* 单例
* date 2018-01-09
* author wolfsky7 -->------|----------------->
**/

var co=require('co');
var ep=require('../easy-promise');
var redis=require('redis'); 

ep(redis.RedisClient.prototype,args=>{
    if(args[0]){
        args[0]=shareVar._preFix+args[0];
    }
    return args;
});

var _obj={};
const _timeout=3000;
const _waittimeout=5000;
const _locktimeout=10000;
const _ts=5;
var _storeConfig,_store,_ints,_heart=60*1000,_heartKey="_heart",_connected=false;


function _init(){
    _storeConfig['retry_strategy']=function (options) {
        __g_log.error(options);
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
    _store=redis.createClient(_storeConfig);
    _store.on('error',function(err){
        __g_log.error('redis err');
        __g_log.error(err);
    });
    _store.on('connect',function(err){
        __g_log.debug('redis-connected');
        _connected=true;
        _ints=setInterval(function(){
            _store.get(_heartKey,function(err){
                if(err){
                    _connected=false;
                    _init();
                }
            })
        },_heart)
    });

    setTimeout(function() {
        var _tinit=Date.now();
        _store.getAsync('test').then(s=>console.error('s'+s)).catch(err=>console.error('er'+err));
    }, 3000);
    

    if(_ints){
        clearInterval(_ints);
    }
    
}

var ___ts=0;
var ___s='';
var ___tsmsg=function(msg){
   return;
    if(!msg){
        return console.error(___s);
    }
    ___s +=msg+(Date.now()-___ts)+"\n";
}

function shareVar(storeconfig){
    if(!_storeConfig){
        _storeConfig=storeconfig;
        _init(storeconfig);
    }
    return {
        redis:()=>_store,
        lockAny:function (key,/*返回一个Promise*/asyncCb){
            if(!_connected){
                return Promise.reject('Redis连接失败');
            }
           var me=this; 

           ___ts=Date.now();
           return new Promise((s,f)=>{
                me._lockAny(key,asyncCb,0,function(err,rs){
                    if(err){
                        f(err);
                    }
                    else s(rs)
                })
           })
        },
        _lockAny:function (key,asyncCb,initTime,cb){
            //流程  
            /* 
            setnx 获取锁 设置当前时间戳
            获取失败  get key 的时间戳  判断是否超时
            已经超时 getset 当前时间戳  对比 相同 则  获取锁 
            */
            var _isLocked=false,me=this,rs;
            var _initTime=Date.now();


            function toNext(initTime){
                setImmediate(()=>{
                    //下一tick 继续
                    me._lockAny(key,asyncCb,initTime,cb);
                })
            }

            if(initTime&&_initTime-initTime<_ts){
                return toNext();
            }

            function * succ(){
                _isLocked=true;
                rs=yield asyncCb();

                //执行太久 可能已经被其他 占用了
                if(Date.now()-_initTime<_timeout)
                    yield _store.delAsync(key);
                cb(null,rs);
            }

            function * fail(initTime){
                if(_initTime-initTime>_waittimeout){
                    //超过等待时间 直接错误
                    cb(1);
                }
                toNext(initTime);
            }

            return co(function *(){
                // set if not exist
                // 用set 替换 nx ex
                // let getLock=yield _store.setnxAsync(key,_initTime)
                let getLock=yield _store.setAsync(key,_initTime,'NX','EX',_timeout)
                if(getLock==="OK"){
                    yield succ();
                }
                else{
                    let oldTs=yield _store.getAsync(key);
                    if(_initTime- +oldTs>_timeout){
                        //已经超时 
                        let newTs=yield _store.getsetAsync(key,_initTime);
                        if(newTs ==oldTs){
                            yield succ();
                        }
                        else {
                            yield fail(initTime||_initTime)
                        }
                    }
                    else{
                        yield fail(initTime||_initTime);
                    }
                }
            }).catch(err=>{
                if(_isLocked){
                    //unlock
                    if(Date.now()-_initTime<_timeout){
                        return _store.delAsync(key).then(()=>cb(err));
                    }  
                }
                cb(err);
            })
        },
        createRedis:function(){
            //创建新的客户端
            var st=redis.createClient(_storeConfig);

            return st;
        }
    }
}


shareVar._preFix=''


module.exports=shareVar;