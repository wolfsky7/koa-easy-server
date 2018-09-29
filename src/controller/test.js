const router = new require('koa-router')()

const get = (path) => (target, name, desc) => {
    router.get(path, ctx => {
        desc.value.call(target, ctx)
    })
    return desc;
}

export default class TestCon {

    @get('test/a')
    a() {

    }
}