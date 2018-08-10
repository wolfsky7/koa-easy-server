function mem() {
    this._mem = {};
}

mem.prototype.get = function (key, cb) {
    var d1=this._mem[key+'_timeout'];
    if(d1){
        if(new Date()>d1){
            return cb(null);
        }
    }
    cb(this._mem[key]);
}

mem.prototype.set = function (key, value, cb,timeout) {
    this._mem[key] = value;
    if(timeout)
        this._mem[key+'_timeout']=new Date().addMilliseconds(timeout);
    else{
        this._mem[key+'_timeout']=0;
    }
    cb();
};

function easy_lock(opts) {
    opts = opts || {};
    this.max = opts.max || 10;
    this.db = opts.db || new mem();
}

easy_lock.prototype.lock = function* (key) {
    var me = this;

    function checkOne(cb, index) {
        me.db.get(key, function (err, v) {
            if (v || err) {
                if (index >= me.max) {
                    return cb(err || 'locked');
                }
                return process.nextTick(() => {
                    checkOne(cb, index + 1);
                });
            }
            return cb(null);
        });
    }

    return new Promise((s, f) => {
        checkOne(function (err) {
            if (err) {
                return f(err);
            }
            return s();
        }, 0)
    })
}

easy_lock.prototype.yieldLock=function *(key,exec){
    var isLocked=false,me=this;
    return co(function *(){
        yield me.lock(key);
        isLocked=true;
        var rs;
        try{
            rs=yield exec();
        }
        catch(e){
            return Promise.reject(e);
        }
        yield me.unLock(key);
        
        return Promise.resolve(rs);
    }).catch(err=>{
        if(isLocked){
            me.unLock(key).next()
        }

        return Promise.reject(err);
    });
}

easy_lock.prototype.unLock = function* (key) {
    var me = this;
    return new Promise((s, f) => {
        me.db.set(key, '', function (err) {
            if (err)
                return f(err);
            return s();
        })
    })
}

module.exports = easy_lock;

