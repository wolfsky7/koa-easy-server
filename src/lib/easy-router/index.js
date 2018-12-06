import Router from 'koa-router'


const router = (BaseCla) => {
    BaseCla.prototype.__router = BaseCla.prototype.__router || new Router();
    return BaseCla;
}

const opts = {};
const genFun = key => {
    opts[key] = (path) => (obj, name, desc) => {
        const router = obj.__router||new Router();
        obj.__router=router;
        if (!router)
            return;
        const raw = desc.value;

        path = path || `/${obj.constructor.name}/${name}`

            router[key](path, function (ctx, next) {
                return raw.call(this, ctx, next)
            })
    }
}

opts.get = genFun('get')
opts.del = genFun('delete')
opts.put = genFun('get')
opts.post = genFun('post')
opts.all = genFun('all')
opts.router = router;

module.exports = opts;

