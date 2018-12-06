import EasyCheck from 'easy-check'

const genFun = function (field, rule) {
    const args = Array.prototype.slice.call(arguments, 2);


    return (obj, name, desc) => {
        const raw = desc.value;
        desc.value = async function (ctx, next) {
            const body = ctx.request.body;
            const ps = [body[field], ...args];
            if (EasyCheck['check_' + rule].apply(null, ps)) {
                return raw.call(obj, ctx, next)
            }
            else {
                // 抛出错误
                return Promise.reject(EasyCheck.errFormat(EasyCheck.errMsgs[rule], field, args[0], args[1], args[2]))
            }
        }
    }
}


// const maxLength = (field, max) => genFun(field, 'maxLength', max)

const opts = {}

Object.keys(EasyCheck).forEach(key => {
    if (/check_/.test(key)) {
        opts[key.substr(6)] = function (field) {
            const args = [field, key.substr(6), ...Array.prototype.slice.call(arguments, 1)]
            return genFun.apply(null, args);
        }
    }
})

module.exports = opts;
