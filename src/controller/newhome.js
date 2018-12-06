import { get, router } from '../lib/easy-router'
import { maxLength } from '../lib/easy-router-check'

@router
class NewHome {

    @get('/newhome')
    @maxLength('a', 2)
    index(ctx) {

        ctx.body = "new home"
    }
}

module.exports = NewHome