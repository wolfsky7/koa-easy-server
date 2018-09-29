import Router from 'koa-router'

const router = new Router()

const opts = {};
const genFun = key => {
    opts[key] = (path) => (obj, name, desc) => {
        const raw = desc.value;
        desc.value = function () {
            path = path || `/${obj.constructor.name}/${name}`

            router[key](path, function (ctx, next) {
                return raw.call(this, ctx, next)
            })
        }
    }
}

opts.get = genFun('get')
opts.del = genFun('delete')
opts.put = genFun('get')
opts.post = genFun('post')
opts.all = genFun('all')

export default opts;

class Controller {
    constructor() {
        this.router = new Router();
    }
}


export {
    Controller,
    router
}