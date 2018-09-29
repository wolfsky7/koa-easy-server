import { get } from '../lib/easy-router'
import { maxLength } from '../lib/easy-router-check'

export default class NewHome {

    @get('/')
    @maxLength('a', 2)
    async index(ctx) {

        ctx.body = "new home"
    }
}